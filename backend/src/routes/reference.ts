import type { FastifyInstance } from "fastify"
import { DateTime } from "luxon"
import { z } from "zod"
import { requireRole } from "../middleware/auth.js"
import { badRequest, notFound } from "../middleware/errors.js"
import { pagination, paginationSchema } from "../utils/pagination.js"
import { ok, page } from "../utils/response.js"
import { cutoffContext, OPERATING_ZONE, parseServiceDate } from "../utils/time.js"
import { CalendarDay, Outlet, Product, Trip, User, Vehicle } from "../models/index.js"

const clean = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

export async function referenceRoutes(app: FastifyInstance) {
  app.get("/reference/outlets", { preHandler: app.authenticate }, async (request) => {
    requireRole(request, "dispatcher")
    const query = z.object({ brand: z.string().optional(), depot: z.string().optional(), district: z.string().optional(), search: z.string().max(100).optional() }).merge(paginationSchema).safeParse(request.query)
    if (!query.success) throw badRequest("Invalid outlet filters.", query.error.flatten())
    const filter: Record<string, unknown> = { active: true }
    if (query.data.brand) filter.brand = query.data.brand
    if (query.data.depot) filter.depot = query.data.depot
    if (query.data.district) filter.district = query.data.district
    if (query.data.search) filter.$or = [{ outletId: { $regex: clean(query.data.search), $options: "i" } }, { displayName: { $regex: clean(query.data.search), $options: "i" } }]
    const { skip, limit } = pagination(query.data.page, query.data.pageSize)
    const [rows, total] = await Promise.all([Outlet.find(filter).sort({ outletId: 1 }).skip(skip).limit(limit).lean(), Outlet.countDocuments(filter)])
    return page(request, rows, query.data.page, query.data.pageSize, total)
  })

  app.get("/reference/vehicles", { preHandler: app.authenticate }, async (request) => {
    requireRole(request, "dispatcher")
    const query = z.object({ serviceDate: z.string(), depot: z.string().optional(), type: z.string().optional(), temp: z.string().optional() }).safeParse(request.query)
    if (!query.success) throw badRequest("serviceDate is required.")
    parseServiceDate(query.data.serviceDate)
    const filter: Record<string, unknown> = { active: true }
    if (query.data.depot) filter.depot = query.data.depot
    if (query.data.type) filter.type = query.data.type
    if (query.data.temp) filter.temperatureClass = query.data.temp
    const rows = await Vehicle.find(filter).sort({ vehicleId: 1 }).lean()
    const date = DateTime.fromISO(query.data.serviceDate, { zone: OPERATING_ZONE })
    const weekStart = date.startOf("week").toFormat("yyyy-MM-dd")
    const weekEnd = date.endOf("week").toFormat("yyyy-MM-dd")
    const trips = await Trip.find({ vehicleId: { $in: rows.map((row) => row.vehicleId) }, serviceDate: { $gte: weekStart, $lte: weekEnd }, status: { $ne: "cancelled" } }).select("vehicleId serviceDate distanceKm").lean()
    return ok(request, rows.map((vehicle) => {
      const vehicleTrips = trips.filter((trip) => trip.vehicleId === vehicle.vehicleId)
      const usedDistanceKm = vehicleTrips.reduce((sum, trip) => sum + trip.distanceKm, 0)
      return { ...vehicle, routesToday: vehicleTrips.filter((trip) => trip.serviceDate === query.data.serviceDate).length, routeLimit: 2, usedDistanceKm, usedFuelL: usedDistanceKm / vehicle.kmPerL }
    }))
  })

  app.get("/reference/drivers", { preHandler: app.authenticate }, async (request) => {
    requireRole(request, "dispatcher")
    const query = z.object({ depot: z.string().optional() }).safeParse(request.query)
    if (!query.success) throw badRequest("Invalid Driver filters.")
    const filter: Record<string, unknown> = { role: "driver", active: true }
    if (query.data.depot) filter.depot = query.data.depot
    const rows = await User.find(filter).select("employeeId name depot").sort({ name: 1 }).lean()
    return ok(request, rows)
  })

  app.get("/catalog/products", { preHandler: app.authenticate }, async (request) => {
    requireRole(request, "store_manager")
    const query = z.object({ brand: z.string().optional(), orderType: z.string().optional(), search: z.string().max(100).optional() }).merge(paginationSchema).safeParse(request.query)
    if (!query.success) throw badRequest("Invalid catalogue filters.")
    const filter: Record<string, unknown> = { active: true }
    if (query.data.brand) filter.brand = query.data.brand
    if (query.data.orderType) filter.orderTypes = query.data.orderType
    if (query.data.search) filter.$or = [{ sku: { $regex: clean(query.data.search), $options: "i" } }, { name: { $regex: clean(query.data.search), $options: "i" } }]
    const { skip, limit } = pagination(query.data.page, query.data.pageSize)
    const [rows, total] = await Promise.all([Product.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(), Product.countDocuments(filter)])
    return page(request, rows, query.data.page, query.data.pageSize, total)
  })

  app.get("/calendar/:date", { preHandler: app.authenticate }, async (request) => {
    requireRole(request, "dispatcher", "store_manager")
    const parsed = z.object({ date: z.string() }).safeParse(request.params)
    if (!parsed.success) throw badRequest("A date is required.")
    parseServiceDate(parsed.data.date)
    const day = await CalendarDay.findOne({ date: parsed.data.date }).lean()
    if (!day) throw notFound("The requested date is outside the imported operating calendar.")
    return ok(request, { ...day, ...cutoffContext(parsed.data.date) })
  })
}
