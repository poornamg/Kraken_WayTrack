import { FastifyRequest } from "fastify"
import { badRequest } from "../../common/errors/index.js"
import { pagination } from "../../common/utils/pagination.js"
import { getCalendarParamsSchema, getDriversQuerySchema, getOutletsQuerySchema, getProductsQuerySchema, getVehiclesQuerySchema } from "./schemas.js"
import * as service from "./service.js"

export async function getOutletsHandler(request: FastifyRequest) {
  const query = getOutletsQuerySchema.safeParse(request.query)
  if (!query.success) throw badRequest("Invalid outlet filters.", query.error.flatten())
  const { skip, limit } = pagination(query.data.page, query.data.pageSize)
  const [rows, total] = await service.getOutlets(query.data, skip, limit)
  return { rows, total, page: query.data.page, pageSize: query.data.pageSize }
}

export async function getVehiclesHandler(request: FastifyRequest) {
  const query = getVehiclesQuerySchema.safeParse(request.query)
  if (!query.success) throw badRequest("serviceDate is required.")
  return service.getVehicles(query.data)
}

export async function getDriversHandler(request: FastifyRequest) {
  const query = getDriversQuerySchema.safeParse(request.query)
  if (!query.success) throw badRequest("Invalid Driver filters.")
  return service.getDrivers(query.data)
}

export async function getProductsHandler(request: FastifyRequest) {
  const query = getProductsQuerySchema.safeParse(request.query)
  if (!query.success) throw badRequest("Invalid catalogue filters.")
  const { skip, limit } = pagination(query.data.page, query.data.pageSize)
  const [rows, total] = await service.getProducts(query.data, skip, limit)
  return { rows, total, page: query.data.page, pageSize: query.data.pageSize }
}

export async function getCalendarHandler(request: FastifyRequest) {
  const parsed = getCalendarParamsSchema.safeParse(request.params)
  if (!parsed.success) throw badRequest("A date is required.")
  return service.getCalendarDay(parsed.data.date)
}
