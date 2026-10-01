import { apiRequest } from "./client"

export type ApiProduct = { _id: string; sku: string; name: string; brand: string; orderTypes: string[]; unit: string }
export type CreatedOrder = { _id: string; orderNumber: string; status: string; cutoffBucket: "before_cutoff" | "after_cutoff"; version: number }
export type StoreDelivery = { _id: string; orderId: string; status: string; outcome?: string; version: number; arrivedAt?: string; completedAt?: string; receipt?: unknown; items: Array<{ sku: string; expected: number; delivered: number; short: number; damaged: number }> }
export type StoreContext = {
  user: { id: string; employeeId: string; name: string }
  outlet: { outletId: string; displayName: string; brand: string; district: string; depot: string }
  orderTypes: string[]
  ordering: { requestedDate: string; serverNow: string; cutoffDeadlineAt: string; secondsRemaining: number; cutoffBucket: "before_cutoff" | "after_cutoff" }
}

const brandName = { fresh: "Fresh", style: "Style", tech: "Tech" } as const
const orderTypeName = (_business: keyof typeof brandName, type: string) => type

export function getCatalogue(business: keyof typeof brandName, type: string) {
  const query = new URLSearchParams({ brand: brandName[business], orderType: orderTypeName(business, type), pageSize: "100" })
  return apiRequest<ApiProduct[]>(`/catalog/products?${query}`)
}

export function submitStoreOrder(input: { business: keyof typeof brandName; type: string; items: Array<{ id: string; quantity: number }> }) {
  return apiRequest<CreatedOrder>("/orders", {
    method: "POST",
    headers: { "Idempotency-Key": crypto.randomUUID() },
    body: JSON.stringify({ orderType: orderTypeName(input.business, input.type), items: input.items.map((item) => ({ productId: item.id, quantity: item.quantity })) }),
  })
}

export const getStoreContext = () => apiRequest<StoreContext>("/store/context")

export const storeDeliveryApi = {
  list: () => apiRequest<StoreDelivery[]>("/store/deliveries"),
  issuePin: (deliveryId: string) => apiRequest<{ pin: string; expiresAt: string }>(`/store/deliveries/${deliveryId}/pin`, { method: "POST" }),
  confirmFullReceipt: (delivery: StoreDelivery) => apiRequest<StoreDelivery>(`/store/deliveries/${delivery._id}/receipt`, {
    method: "POST",
    headers: { "If-Match": String(delivery.version) },
    body: JSON.stringify({ result: "full", expectedVersion: delivery.version, itemOutcomes: delivery.items.map((item) => ({ sku: item.sku, received: item.delivered })), evidenceFileIds: [] }),
  }),
}
