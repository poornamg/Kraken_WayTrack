import type { FastifyInstance } from "fastify"
import { requireRole } from "../../common/middleware/auth.js"
import { ok, page } from "../../common/utils/response.js"
import * as controller from "./controller.js"

export async function referenceRoutes(app: FastifyInstance) {
  app.get("/reference/outlets", { preHandler: app.authenticate }, async (request) => {
    requireRole(request, "dispatcher")
    const { rows, total, page: p, pageSize } = await controller.getOutletsHandler(request)
    return page(request, rows, p, pageSize, total)
  })

  app.get("/reference/vehicles", { preHandler: app.authenticate }, async (request) => {
    requireRole(request, "dispatcher")
    return ok(request, await controller.getVehiclesHandler(request))
  })

  app.get("/reference/drivers", { preHandler: app.authenticate }, async (request) => {
    requireRole(request, "dispatcher")
    return ok(request, await controller.getDriversHandler(request))
  })

  app.get("/catalog/products", { preHandler: app.authenticate }, async (request) => {
    requireRole(request, "store_manager")
    const { rows, total, page: p, pageSize } = await controller.getProductsHandler(request)
    return page(request, rows, p, pageSize, total)
  })

  app.get("/calendar/:date", { preHandler: app.authenticate }, async (request) => {
    requireRole(request, "dispatcher", "store_manager")
    return ok(request, await controller.getCalendarHandler(request))
  })
}
