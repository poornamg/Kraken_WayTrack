import type { FastifyInstance } from "fastify"
import { z } from "zod"
import { UnifiedOrder } from "../models/unifiedOrder.js"
import { ok } from "../common/utils/response.js"
import { badRequest, notFound } from "../common/errors/index.js"

export async function unifiedOrderRoutes(app: FastifyInstance) {
  // SSE or Polling endpoint. Dispatcher can just poll GET /api/v1/unified/orders
  app.get("/unified/orders", async (request, reply) => {
    // optional filter by status or store
    const query = request.query as any
    const filter: any = {}
    if (query.status) filter.status = query.status
    if (query.shop) filter.storeName = query.shop
    if (query.storeId) filter.storeId = query.storeId
    
    const orders = await UnifiedOrder.find(filter).sort({ createdAt: -1 })
    return ok(request, orders)
  })

  app.post("/unified/orders", async (request, reply) => {
    const body = request.body as any
    const now = new Date()
    
    const order = await UnifiedOrder.create({
      storeId: body.storeId || "store-1",
      storeName: body.storeName || "Unknown Store",
      town: body.town || "Unknown Town",
      type: body.type || "Fresh",
      itemsSummary: body.itemsSummary || "0 items",
      items: body.items || [],
      kg: body.kg || 0,
      emergency: body.emergency || false,
      inReach: true,
      suggested: true,
      stop: body.stop,
      dueDay: body.dueDay,
      status: "Not scheduled"
    })
    
    return reply.status(201).send(ok(request, order))
  })

  app.patch("/unified/orders/:id", async (request, reply) => {
    const params = request.params as any
    const body = request.body as any
    
    const order = await UnifiedOrder.findByIdAndUpdate(params.id, { $set: body }, { new: true }).lean()
    if (!order) throw notFound("Order not found")
    
    return ok(request, order)
  })

  // Basic SSE endpoint for live updates
  app.get("/unified/orders/live", async (request, reply) => {
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('Access-Control-Allow-Origin', '*');
    
    reply.raw.flushHeaders();

    const changeStream = UnifiedOrder.watch();
    
    changeStream.on('change', (change) => {
      reply.raw.write(`data: ${JSON.stringify(change)}\n\n`);
    });

    request.raw.on('close', () => {
      changeStream.close();
    });
  })
}
