import { randomBytes } from "node:crypto"
import mongoose from "mongoose"
import type { FastifyInstance } from "fastify"
import { z } from "zod"
import { requireRole } from "../middleware/auth.js"
import { audit } from "../utils/audit.js"
import { badRequest, conflict, notFound, unprocessable } from "../middleware/errors.js"
import { pagination, paginationSchema } from "../utils/pagination.js"
import { ok, page } from "../utils/response.js"
import { parseServiceDate } from "../utils/time.js"
import { expectedVersion } from "../utils/version.js"
import { LoadRecord, Order, Outlet, Trip, User, Vehicle } from "../models/index.js"
import { validateTrip } from "../services/planningConstraints.js"

const tripBody = z.object({
  serviceDate: z.string(), departureAt: z.coerce.date(), plannedEndAt: z.coerce.date(), vehicleId: z.string().min(1), driverId: z.string().min(1),
  distanceKm: z.number().min(0),
  stops: z.array(z.object({ orderId: z.string().min(1), plannedArrivalAt: z.coerce.date() })).min(1),
})

async function buildValidation(data: z.infer<typeof tripBody>, excludeTripId?: string) {
  return validateTrip({
    serviceDate: data.serviceDate, departureAt: data.departureAt, plannedEndAt: data.plannedEndAt,
    vehicleId: data.vehicleId, driverId: data.driverId, orderIds: data.stops.map((stop) => stop.orderId),
    plannedArrivals: Object.fromEntries(data.stops.map((stop) => [stop.orderId, stop.plannedArrivalAt])),
    distanceKm: data.distanceKm,
    ...(excludeTripId ? { excludeTripId } : {}),
  })
}

export async function planningRoutes(app: FastifyInstance) {
  app.get("/planning/orders", { preHandler: app.authenticate }, async (request) => {
    requireRole(request, "dispatcher")
    const query = z.object({ serviceDate: z.string().optional(), brand: z.string().optional(), status: z.string().optional() }).merge(paginationSchema).safeParse(request.query)
    if (!query.success) throw badRequest("Invalid planning-order filters.")
    if (query.data.serviceDate) parseServiceDate(query.data.serviceDate)
    const filter: Record<string, unknown> = { ...(query.data.serviceDate ? { requestedDate: query.data.serviceDate } : {}), status: query.data.status ?? { $in: ["submitted", "deferred"] }, allocatedTripId: { $exists: false } }
    if (query.data.brand) filter.brand = query.data.brand
    const { skip, limit } = pagination(query.data.page, query.data.pageSize)
    const [rows, total] = await Promise.all([Order.find(filter).sort({ requestedDate: 1, cutoffBucket: 1, createdAt: 1 }).skip(skip).limit(limit).lean(), Order.countDocuments(filter)])
    const outlets = await Outlet.find({ outletId: { $in: rows.map((row) => row.outletId) } }).select("outletId displayName district depot coordinates").lean()
    const outletMap = new Map(outlets.map((outlet) => [outlet.outletId, outlet]))
    return page(request, rows.map((row) => ({ ...row, outlet: outletMap.get(row.outletId) ?? null })), query.data.page, query.data.pageSize, total)
  })

  app.post("/planning/trips", { preHandler: app.authenticate }, async (request, reply) => {
    const auth = requireRole(request, "dispatcher")
    const parsed = tripBody.safeParse(request.body)
    if (!parsed.success) throw badRequest("The trip draft is invalid.", parsed.error.flatten())
    parseServiceDate(parsed.data.serviceDate)
    const [driver, vehicle] = await Promise.all([
      User.findOne({ _id: parsed.data.driverId, role: "driver", active: true }).lean(),
      Vehicle.findOne({ vehicleId: parsed.data.vehicleId, active: true }).lean(),
    ])
    if (!driver) throw unprocessable("DRIVER_UNAVAILABLE", "The selected Driver is unavailable.")
    if (!vehicle) throw unprocessable("VEHICLE_UNAVAILABLE", "The selected vehicle is unavailable.")
    const validation = await buildValidation(parsed.data)
    const orders = await Order.find({ _id: { $in: parsed.data.stops.map((stop) => stop.orderId) } }).lean()
    const orderMap = new Map(orders.map((order) => [String(order._id), order]))
    const trip = await Trip.create({
      tripNumber: `TRP-${parsed.data.serviceDate.replaceAll("-", "")}-${randomBytes(3).toString("hex").toUpperCase()}`,
      ...parsed.data, depot: vehicle.depot, dispatcherId: auth.userId, status: "draft",
      stops: parsed.data.stops.map((stop, index) => ({ stopId: `STOP-${index + 1}`, orderId: stop.orderId, outletId: orderMap.get(stop.orderId)?.outletId, sequence: index + 1, plannedArrivalAt: stop.plannedArrivalAt })),
      constraintCheck: { checkedAt: new Date(), valid: validation.valid, rules: validation.rules },
      statusHistory: [{ status: "draft", at: new Date(), actorId: auth.userId }],
    })
    await audit(request, "trip.draft_created", "trip", trip.id, { valid: validation.valid })
    return reply.status(201).send(ok(request, trip.toObject()))
  })

  app.post("/planning/trips/:tripId/validate", { preHandler: app.authenticate }, async (request) => {
    requireRole(request, "dispatcher")
    const params = z.object({ tripId: z.string() }).safeParse(request.params)
    if (!params.success) throw badRequest("A trip ID is required.")
    const trip = await Trip.findById(params.data.tripId)
    if (!trip) throw notFound()
    const data = { serviceDate: trip.serviceDate, departureAt: trip.departureAt, plannedEndAt: trip.plannedEndAt!, vehicleId: trip.vehicleId, driverId: String(trip.driverId), distanceKm: trip.distanceKm, stops: trip.stops.map((stop) => ({ orderId: String(stop.orderId), plannedArrivalAt: stop.plannedArrivalAt! })) }
    const validation = await buildValidation(data, trip.id)
    trip.set("constraintCheck", { checkedAt: new Date(), valid: validation.valid, rules: validation.rules })
    await trip.save()
    return ok(request, { ...validation, version: trip.version })
  })

  app.post("/planning/trips/:tripId/publish", { preHandler: app.authenticate }, async (request) => {
    const auth = requireRole(request, "dispatcher")
    const params = z.object({ tripId: z.string() }).safeParse(request.params)
    const body = z.object({ expectedVersion: z.number().int().optional() }).safeParse(request.body ?? {})
    if (!params.success || !body.success) throw badRequest("A valid trip ID and version are required.")
    const version = expectedVersion(request, body.data.expectedVersion)
    const session = await mongoose.startSession()
    let published: InstanceType<typeof Trip> | null = null
    try {
      await session.withTransaction(async () => {
        const trip = await Trip.findOne({ _id: params.data.tripId, status: "draft", version }).session(session)
        if (!trip) throw conflict("STALE_OR_INVALID_STATE", "The trip changed or is no longer a draft.")
        const data = { serviceDate: trip.serviceDate, departureAt: trip.departureAt, plannedEndAt: trip.plannedEndAt!, vehicleId: trip.vehicleId, driverId: String(trip.driverId), distanceKm: trip.distanceKm, stops: trip.stops.map((stop) => ({ orderId: String(stop.orderId), plannedArrivalAt: stop.plannedArrivalAt! })) }
        const validation = await buildValidation(data, trip.id)
        if (!validation.valid) throw unprocessable("TRIP_CONSTRAINTS_FAILED", "The trip does not satisfy all hard constraints.", validation)
        const orderIds = trip.stops.map((stop) => stop.orderId)
        const update = await Order.updateMany({ _id: { $in: orderIds }, status: { $in: ["submitted", "deferred"] }, allocatedTripId: { $exists: false } }, { $set: { status: "allocated", allocatedTripId: trip._id }, $push: { statusHistory: { status: "allocated", at: new Date(), actorId: auth.userId } } }, { session })
        if (update.modifiedCount !== orderIds.length) throw conflict("ORDER_ALLOCATION_CONFLICT", "One or more orders were allocated concurrently.")
        const orders = await Order.find({ _id: { $in: orderIds } }).session(session).lean()
        const orderMap = new Map(orders.map((order) => [String(order._id), order]))
        const loadItems = [...trip.stops].reverse().flatMap((stop) => (orderMap.get(String(stop.orderId))?.items ?? []).map((item) => ({ itemId: `${stop!.stopId}-${item.sku}`, stopId: stop!.stopId, orderId: stop.orderId, sku: item.sku, name: item.name, expectedQuantity: item.quantity })))
        await LoadRecord.create([{ tripId: trip._id, depot: trip.depot, status: "available", items: loadItems }], { session })
        trip.status = "published"
        trip.set("constraintCheck", { checkedAt: new Date(), valid: true, rules: validation.rules })
        trip.statusHistory.push({ status: "published", at: new Date(), actorId: new mongoose.Types.ObjectId(auth.userId) })
        await trip.save({ session })
        published = trip
      })
    } finally { await session.endSession() }
    await audit(request, "trip.published", "trip", params.data.tripId)
    return ok(request, published!.toObject())
  })

  app.post("/orders/:orderId/defer", { preHandler: app.authenticate }, async (request) => {
    const auth = requireRole(request, "dispatcher")
    const params = z.object({ orderId: z.string() }).safeParse(request.params)
    const body = z.object({ nextDate: z.string(), reasonCode: z.string().min(1), note: z.string().max(1000).optional() }).safeParse(request.body)
    if (!params.success || !body.success) throw badRequest("A valid deferral request is required.")
    parseServiceDate(body.data.nextDate)
    const order = await Order.findOneAndUpdate({ _id: params.data.orderId, status: { $in: ["submitted", "deferred"] }, allocatedTripId: { $exists: false } }, { $set: { status: "deferred", deferredTo: body.data.nextDate, deferralReason: body.data.reasonCode }, $push: { statusHistory: { status: "deferred", at: new Date(), actorId: auth.userId, note: body.data.note ?? body.data.reasonCode } } }, { new: true })
    if (!order) throw conflict("ORDER_NOT_DEFERRABLE", "The order is no longer available for deferral.")
    await audit(request, "order.deferred", "order", order.id, { nextDate: body.data.nextDate, reasonCode: body.data.reasonCode })
    return ok(request, order.toObject())
  })

  app.post("/orders/defer-batch", { preHandler: app.authenticate }, async (request) => {
    const auth = requireRole(request, "dispatcher")
    const body = z.object({ orderIds: z.array(z.string()).min(1).max(100), nextDate: z.string(), reasonCode: z.string().min(1), note: z.string().max(1000).optional() }).safeParse(request.body)
    if (!body.success) throw badRequest("A valid batch deferral request is required.")
    parseServiceDate(body.data.nextDate)
    const results = []
    for (const orderId of body.data.orderIds) {
      const order = await Order.findOneAndUpdate({ _id: orderId, status: { $in: ["submitted", "deferred"] }, allocatedTripId: { $exists: false } }, { $set: { status: "deferred", deferredTo: body.data.nextDate, deferralReason: body.data.reasonCode }, $push: { statusHistory: { status: "deferred", at: new Date(), actorId: auth.userId, note: body.data.note ?? body.data.reasonCode } } }, { new: true }).lean()
      results.push({ orderId, result: order ? "deferred" : "conflict", order })
    }
    await audit(request, "order.batch_deferred", "order_batch", request.id, { count: body.data.orderIds.length, nextDate: body.data.nextDate, reasonCode: body.data.reasonCode })
    return ok(request, results)
  })

  app.patch("/planning/trips/:tripId", { preHandler: app.authenticate }, async (request) => {
    requireRole(request, "dispatcher")
    const params = z.object({ tripId: z.string() }).safeParse(request.params)
    const body = tripBody.partial().extend({ expectedVersion: z.number().int().optional() }).safeParse(request.body)
    if (!params.success || !body.success) throw badRequest("The trip edit is invalid.")
    const version = expectedVersion(request, body.data.expectedVersion)
    const { expectedVersion: _ignored, ...changes } = body.data
    const trip = await Trip.findOneAndUpdate({ _id: params.data.tripId, status: "draft", version }, { $set: changes, $inc: { version: 1 } }, { new: true })
    if (!trip) throw conflict("TRIP_EDIT_CONFLICT", "Only a current draft can be edited.")
    return ok(request, trip.toObject())
  })

  app.get("/trips", { preHandler: app.authenticate }, async (request) => {
    const auth = requireRole(request, "dispatcher", "loader", "driver")
    const query = z.object({ date: z.string(), status: z.string().optional(), vehicleId: z.string().optional() }).safeParse(request.query)
    if (!query.success) throw badRequest("A valid date is required.")
    const filter: Record<string, unknown> = { serviceDate: query.data.date }
    if (query.data.status) filter.status = query.data.status
    if (query.data.vehicleId) filter.vehicleId = query.data.vehicleId
    if (auth.role === "driver") filter.driverId = auth.userId
    const rows = await Trip.find(filter).sort({ departureAt: 1 }).lean()
    return ok(request, rows)
  })

  app.get("/trips/:tripId", { preHandler: app.authenticate }, async (request) => {
    const auth = requireRole(request, "dispatcher", "loader", "driver")
    const params = z.object({ tripId: z.string() }).safeParse(request.params)
    if (!params.success) throw badRequest("A trip ID is required.")
    const filter: Record<string, unknown> = { _id: params.data.tripId }
    if (auth.role === "driver") filter.driverId = auth.userId
    const trip = await Trip.findOne(filter).lean()
    if (!trip) throw notFound()
    const orders = await Order.find({ _id: { $in: trip.stops.map((stop) => stop.orderId) } }).lean()
    return ok(request, { ...trip, orders })
  })

  
  app.post("/planning/unified-trips", { preHandler: app.authenticate }, async (request, reply) => {
    const auth = requireRole(request, "dispatcher")
    const bodySchema = z.object({
      serviceDate: z.string(),
      departureAt: z.coerce.date(),
      plannedEndAt: z.coerce.date(),
      vehicleId: z.string().min(1),
      driverId: z.string().min(1),
      distanceKm: z.number().min(0),
      stops: z.array(z.object({
        unifiedOrderId: z.string().min(1),
        plannedArrivalAt: z.coerce.date()
      })).min(1),
      expectedVersion: z.number().int().optional()
    })
    const parsed = bodySchema.safeParse(request.body)
    if (!parsed.success) throw badRequest("The trip draft is invalid.", parsed.error.flatten())
    parseServiceDate(parsed.data.serviceDate)

    const [driver, vehicle] = await Promise.all([
      User.findOne({ _id: parsed.data.driverId, role: "driver", active: true }).lean(),
      Vehicle.findOne({ vehicleId: parsed.data.vehicleId, active: true }).lean(),
    ])
    if (!driver) throw unprocessable("DRIVER_UNAVAILABLE", "The selected Driver is unavailable.")
    if (!vehicle) throw unprocessable("VEHICLE_UNAVAILABLE", "The selected vehicle is unavailable.")

    const { UnifiedOrder } = require("../models/unifiedOrder.js");
    const { DeliveryRecord } = require("../models/index.js");
    const argon2 = require("argon2");
    
    const existingTrip = await Trip.findOne({ 
      serviceDate: parsed.data.serviceDate, 
      vehicleId: parsed.data.vehicleId, 
      driverId: parsed.data.driverId,
      status: { $ne: "cancelled" }
    });
    if (existingTrip) {
      // Idempotent: return the existing trip if it matches the vehicle and driver on the same day
      return reply.status(200).send(ok(request, existingTrip.toObject()));
    }
    
    const session = await mongoose.startSession()
    let published: any = null
    try {
      await session.withTransaction(async () => {
        const uOrders = await UnifiedOrder.find({ _id: { $in: parsed.data.stops.map((s: any) => s.unifiedOrderId) } }).session(session);
        const uOrderMap = new Map(uOrders.map((o: any) => [String(o._id), o]));
        
        const realOrderIds: any[] = [];
        const realOrders: any[] = [];
        
        for (const stop of parsed.data.stops) {
          const uo: any = uOrderMap.get(stop.unifiedOrderId);
          if (!uo) throw notFound("UnifiedOrder not found: " + stop.unifiedOrderId);
          if (uo.status === "Scheduled") throw conflict("ORDER_ALLOCATION_CONFLICT", "Order already allocated");
          
          let brand = uo.type || "Fresh";
          let orderType = brand === "Fresh" ? "dry" : "products";
          const order = await Order.create([{
            orderNumber: `TRP-${parsed.data.serviceDate.replaceAll("-", "")}-${uo._id.toString().slice(-6).toUpperCase()}`,
            outletId: uo.storeId === "store-1" ? "OUT076" : uo.storeId,
            storeManagerId: auth.userId,
            brand,
            orderType,
            requestedDate: parsed.data.serviceDate,
            cutoffBucket: "before_cutoff",
            status: "allocated",
            items: uo.items.map((item: any) => ({ sku: item.name.toLowerCase().replace(/\s+/g, '-'), name: item.name, quantity: item.qty || 1 })),
            totalWeightKg: uo.kg || 10,
            totalVolumeM3: (uo.kg || 10) / 100,
          }], { session });
          
          realOrderIds.push(order[0]!._id);
          realOrders.push(order[0]);
          
          uo.status = "Scheduled";
          uo.stop = parsed.data.stops.indexOf(stop) + 1;
          await uo.save({ session });
        }
        
        const validation = await validateTrip({
          serviceDate: parsed.data.serviceDate,
          departureAt: parsed.data.departureAt,
          plannedEndAt: parsed.data.plannedEndAt,
          vehicleId: parsed.data.vehicleId,
          driverId: parsed.data.driverId,
          orderIds: realOrderIds.map(String),
          plannedArrivals: Object.fromEntries(realOrderIds.map((id, i) => [String(id), parsed.data.stops[i]!.plannedArrivalAt])),
          distanceKm: parsed.data.distanceKm
        });
        
        if (!validation.valid) throw unprocessable("TRIP_CONSTRAINTS_FAILED", "The trip does not satisfy all hard constraints.", validation)
        
        const trip = await Trip.create([{
          tripNumber: `TRP-${parsed.data.serviceDate.replaceAll("-", "")}-${require("node:crypto").randomBytes(3).toString("hex").toUpperCase()}`,
          serviceDate: parsed.data.serviceDate,
          departureAt: parsed.data.departureAt,
          plannedEndAt: parsed.data.plannedEndAt,
          vehicleId: parsed.data.vehicleId,
          driverId: parsed.data.driverId,
          distanceKm: parsed.data.distanceKm,
          depot: vehicle.depot,
          dispatcherId: auth.userId,
          status: "published",
          stops: parsed.data.stops.map((stop: any, index: number) => ({
            stopId: `STOP-${index + 1}`,
            orderId: realOrderIds[index],
            outletId: realOrders[index].outletId,
            sequence: index + 1,
            plannedArrivalAt: stop.plannedArrivalAt
          })),
          constraintCheck: { checkedAt: new Date(), valid: true, rules: validation.rules },
          statusHistory: [{ status: "published", at: new Date(), actorId: auth.userId }],
        }], { session });
        
        const loadItems = [...trip[0]!.stops].reverse().flatMap((stop: any) => {
          const o = realOrders.find(ro => String(ro._id) === String(stop.orderId));
          return (o?.items ?? []).map((item: any) => ({
            itemId: `${stop!.stopId}-${item.sku}`,
            stopId: stop!.stopId,
            orderId: stop.orderId,
            sku: item.sku,
            name: item.name,
            expectedQuantity: item.quantity
          }))
        });
        await LoadRecord.create([{ tripId: trip[0]!._id, depot: trip[0]!.depot, status: "available", items: loadItems }], { session });
        
        for (let i = 0; i < trip[0]!.stops.length; i++) {
          const stop = trip[0]!.stops[i];
          const order = realOrders[i];
          const pin = String(Math.floor(1000 + Math.random() * 9000));
          const pinHash = await argon2.hash(pin);
          const uo: any = uOrderMap.get(parsed.data.stops[i]!.unifiedOrderId);
          uo.set('deliveryPin', pin, { strict: false });
          uo.set('eta', new Date(stop!.plannedArrivalAt!).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"}), { strict: false });
          await uo.save({ session });
          
          await DeliveryRecord.create([{
            tripId: trip[0]!._id,
            stopId: stop!.stopId,
            orderId: order._id,
            outletId: order.outletId,
            driverId: auth.userId,
            status: "planned",
            items: order.items.map((item: any) => ({ orderId: order._id, sku: item.sku, expected: item.quantity, delivered: 0, short: 0, damaged: 0 })),
            pinHash: pinHash,
            pinExpiresAt: new Date(Date.now() + 24 * 60 * 60_000)
          }], { session });
        }
        
        published = trip[0];
      })
    } finally { await session.endSession() }
    
    await audit(request, "trip.published", "trip", published.id)
    return reply.status(201).send(ok(request, published.toObject()))
  })


}
