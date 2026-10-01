import { DateTime } from "luxon"
import { CalendarDay, Outlet, Product, Trip, User, Vehicle } from "../../models/index.js"
import { cutoffContext, OPERATING_ZONE, parseServiceDate } from "../../common/utils/time.js"
import { notFound } from "../../common/errors/index.js"

const clean = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

export async function getOutlets(query: any, skip: number, limit: number) {
  const filter: Record<string, unknown> = { active: true }
  if (query.brand) filter.brand = query.brand
  if (query.depot) filter.depot = query.depot
  if (query.district) filter.district = query.district
  if (query.search) filter.$or = [{ outletId: { $regex: clean(query.search), $options: "i" } }, { displayName: { $regex: clean(query.search), $options: "i" } }]
  return Promise.all([Outlet.find(filter).sort({ outletId: 1 }).skip(skip).limit(limit).lean(), Outlet.countDocuments(filter)])
}

export async function getVehicles(query: any) {
  parseServiceDate(query.serviceDate)
  const filter: Record<string, unknown> = { active: true }
  if (query.depot) filter.depot = query.depot
  if (query.type) filter.type = query.type
  if (query.temp) filter.temperatureClass = query.temp
  const rows = await Vehicle.find(filter).sort({ vehicleId: 1 }).lean()
  const date = DateTime.fromISO(query.serviceDate, { zone: OPERATING_ZONE })
  const weekStart = date.startOf("week").toFormat("yyyy-MM-dd")
  const weekEnd = date.endOf("week").toFormat("yyyy-MM-dd")
  const trips = await Trip.find({ vehicleId: { $in: rows.map((row: any) => row.vehicleId) }, serviceDate: { $gte: weekStart, $lte: weekEnd }, status: { $ne: "cancelled" } }).select("vehicleId serviceDate distanceKm").lean()
  return rows.map((vehicle: any) => {
    const vehicleTrips = trips.filter((trip: any) => trip.vehicleId === vehicle.vehicleId)
    const usedDistanceKm = vehicleTrips.reduce((sum: number, trip: any) => sum + trip.distanceKm, 0)
    return { ...vehicle, routesToday: vehicleTrips.filter((trip: any) => trip.serviceDate === query.serviceDate).length, routeLimit: 2, usedDistanceKm, usedFuelL: usedDistanceKm / vehicle.kmPerL }
  })
}

export async function getDrivers(query: any) {
  const filter: Record<string, unknown> = { role: "driver", active: true }
  if (query.depot) filter.depot = query.depot
  return User.find(filter).select("employeeId name depot").sort({ name: 1 }).lean()
}

export async function getProducts(query: any, skip: number, limit: number) {
  const filter: Record<string, unknown> = { active: true }
  if (query.brand) filter.brand = query.brand
  if (query.orderType) filter.orderTypes = query.orderType
  if (query.search) filter.$or = [{ sku: { $regex: clean(query.search), $options: "i" } }, { name: { $regex: clean(query.search), $options: "i" } }]
  return Promise.all([Product.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(), Product.countDocuments(filter)])
}

export async function getCalendarDay(date: string) {
  parseServiceDate(date)
  const day = await CalendarDay.findOne({ date }).lean()
  if (!day) throw notFound("The requested date is outside the imported operating calendar.")
  return { ...day, ...cutoffContext(date) }
}
