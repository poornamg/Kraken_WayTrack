import { randomBytes } from "node:crypto"
import type { FastifyInstance } from "fastify"
import { z } from "zod"
import { requireRole } from "../middleware/auth.js"
import { audit } from "../utils/audit.js"
import { badRequest, forbidden, notFound, unprocessable } from "../middleware/errors.js"
import { findIdempotentResult, saveIdempotentResult } from "../utils/idempotency.js"
import { pagination, paginationSchema } from "../utils/pagination.js"
import { ok, page } from "../utils/response.js"
import { orderingCutoffContext, parseServiceDate, selectPlanningDate } from "../utils/time.js"
import { CalendarDay, Order, Outlet, Product, User } from "../models/index.js"

const createBody = z.object({
  orderType: z.string().min(1).max(40),
  requestedDate: z.string().optional(),
  items: z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(100_000) })).min(1).max(200),
})

async function managerContext(userId: string) {
  const user = await User.findById(userId).lean()
  if (!user?.outletId) throw forbidden("The Store Manager is not assigned to an outlet.")
  const outlet = await Outlet.findOne({ outletId: user.outletId, active: true }).lean()
  if (!outlet) throw forbidden("The assigned outlet is unavailable.")
  return { user, outlet }
}

async function currentOrderingContext() {
  const cutoff = orderingCutoffContext()
  const operatingDays = await CalendarDay.find({ date: { $gt: cutoff.orderingDate }, isOperating: true }).sort({ date: 1 }).limit(2).lean()
  const requestedDate = selectPlanningDate(operatingDays.map((day) => day.date), cutoff.cutoffBucket)
  if (!requestedDate) throw unprocessable("PLANNING_CALENDAR_UNAVAILABLE", "The next planning run is not available in the operating calendar.")
  return { ...cutoff, requestedDate }
}

export async function orderRoutes(app: FastifyInstance) {
  app.get("/store/context", { preHandler: app.authenticate }, async (request) => {
    const auth = requireRole(request, "store_manager")
    const { user, outlet } = await managerContext(auth.userId)
    const [ordering, orderTypes] = await Promise.all([currentOrderingContext(), Product.distinct("orderTypes", { brand: outlet.brand, active: true })])
    return ok(request, { user: { id: user._id, employeeId: user.employeeId, name: user.name }, outlet: { outletId: outlet.outletId, displayName: outlet.displayName, brand: outlet.brand, district: outlet.district, depot: outlet.depot }, orderTypes, ordering })
  })

  app.post("/orders", { preHandler: app.authenticate }, async (request, reply) => {
    const auth = requireRole(request, "store_manager")
    const parsed = createBody.safeParse(request.body)
    if (!parsed.success) throw badRequest("The order request is invalid.", parsed.error.flatten())
    const idem = await findIdempotentResult(request, "orders.create", parsed.data)
    if (idem.existing) return reply.status(idem.existing.statusCode).send(idem.existing.response)

    const ordering = await currentOrderingContext()
    if (parsed.data.requestedDate) {
      parseServiceDate(parsed.data.requestedDate)
      if (parsed.data.requestedDate !== ordering.requestedDate) throw unprocessable("STALE_PLANNING_DATE", "The planning date changed. Refresh the order context and try again.", { requestedDate: ordering.requestedDate })
    }
    const requestedDate = ordering.requestedDate
    const [{ outlet }, calendar, products] = await Promise.all([
      managerContext(auth.userId),
      CalendarDay.findOne({ date: requestedDate }).lean(),
      Product.find({ _id: { $in: parsed.data.items.map((item) => item.productId) }, active: true }).lean(),
    ])
    if (!calendar?.isOperating) throw unprocessable("NON_OPERATING_DAY", "Orders cannot be requested for a non-operating day.")
    if (products.length !== new Set(parsed.data.items.map((item) => item.productId)).size) throw unprocessable("UNKNOWN_PRODUCT", "One or more products are unavailable.")
    const productMap = new Map(products.map((product) => [String(product._id), product]))
    const items = parsed.data.items.map(({ productId, quantity }) => {
      const product = productMap.get(productId)!
      if (product.brand.toLowerCase() !== outlet.brand.toLowerCase() || !product.orderTypes.includes(parsed.data.orderType)) {
        throw unprocessable("PRODUCT_NOT_ALLOWED", `${product.sku} is not available for this outlet and order type.`)
      }
      return {
        productId: product._id,
        sku: product.sku,
        name: product.name,
        unit: product.unit,
        quantity,
        unitWeightKg: product.weightKg,
        unitVolumeM3: product.volumeM3,
        temperatureClass: product.temperatureClass,
        fragile: product.fragile,
      }
    })
    const now = new Date()
    const order = await Order.create({
      orderNumber: `ORD-${now.toISOString().slice(2, 10).replaceAll("-", "")}-${randomBytes(3).toString("hex").toUpperCase()}`,
      outletId: outlet.outletId,
      storeManagerId: auth.userId,
      brand: outlet.brand,
      orderType: parsed.data.orderType,
      requestedDate,
      cutoffBucket: ordering.cutoffBucket,
      items,
      totalWeightKg: items.reduce((total, item) => total + item.unitWeightKg * item.quantity, 0),
      totalVolumeM3: items.reduce((total, item) => total + item.unitVolumeM3 * item.quantity, 0),
      statusHistory: [{ status: "submitted", at: now, actorId: auth.userId }],
    })
    await audit(request, "order.submitted", "order", order.id, { orderNumber: order.orderNumber, outletId: outlet.outletId, cutoffBucket: ordering.cutoffBucket, requestedDate })
    const response = ok(request, order.toObject())
    await saveIdempotentResult({ key: idem.key, requestHash: idem.requestHash, operation: "orders.create", userId: auth.userId, statusCode: 201, response })
    return reply.status(201).send(response)
  })

  app.get("/orders", { preHandler: app.authenticate }, async (request) => {
    const auth = requireRole(request, "store_manager")
    const { outlet } = await managerContext(auth.userId)
    const query = z.object({ status: z.string().optional(), from: z.string().optional(), to: z.string().optional() }).merge(paginationSchema).safeParse(request.query)
    if (!query.success) throw badRequest("Invalid order filters.")
    const filter: Record<string, unknown> = { outletId: outlet.outletId }
    if (query.data.status) filter.status = query.data.status
    if (query.data.from || query.data.to) filter.requestedDate = { ...(query.data.from ? { $gte: query.data.from } : {}), ...(query.data.to ? { $lte: query.data.to } : {}) }
    const { skip, limit } = pagination(query.data.page, query.data.pageSize)
    const [rows, total] = await Promise.all([Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(), Order.countDocuments(filter)])
    return page(request, rows, query.data.page, query.data.pageSize, total)
  })

  app.get("/store/order-history", { preHandler: app.authenticate }, async (request) => {
    const auth = requireRole(request, "store_manager")
    const { outlet } = await managerContext(auth.userId)
    const query = paginationSchema.safeParse(request.query)
    if (!query.success) throw badRequest("Invalid history pagination.")
    const { skip, limit } = pagination(query.data.page, query.data.pageSize)
    const [rows, total] = await Promise.all([Order.find({ outletId: outlet.outletId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(), Order.countDocuments({ outletId: outlet.outletId })])
    return page(request, rows, query.data.page, query.data.pageSize, total)
  })

  app.get("/orders/:orderId", { preHandler: app.authenticate }, async (request) => {
    const auth = requireRole(request, "store_manager", "dispatcher")
    const params = z.object({ orderId: z.string() }).safeParse(request.params)
    if (!params.success) throw badRequest("An order ID is required.")
    const order = await Order.findById(params.data.orderId).lean()
    if (!order) throw notFound()
    if (auth.role === "store_manager") {
      const { outlet } = await managerContext(auth.userId)
      if (order.outletId !== outlet.outletId) throw notFound()
    }
    return ok(request, order)
  })
}
