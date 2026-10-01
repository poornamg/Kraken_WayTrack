import type { OrderType, CatalogProduct } from "../types"
import { getCatalog } from "../data/mockData"

export function formatOutlet(business: "fresh" | "style" | "tech" = "fresh"): string {
  if (business === "style") return "Waypoint Style · Kandy City"
  if (business === "tech") return "Waypoint Tech · Kandy City"
  return "Waypoint Fresh · Kandy City"
}

export function formatOrderType(business: "fresh" | "style" | "tech" = "fresh", type: OrderType = "dry"): string {
  if (business === "style") return "Style stock"
  if (business === "tech") return "Tech stock"
  if (type === "dry") return "Dry groceries"
  return "Chilled / Frozen"
}

export function getDefaultOrderType(business: "fresh" | "style" | "tech"): OrderType {
  if (business === "fresh") return "dry"
  return "products"
}

export function pluralizeUnit(unit: string, quantity: number): string {
  if (quantity === 1 || unit === "kg") return unit
  return unit + "s"
}

export function selectedProducts(
  business: "fresh" | "style" | "tech",
  type: OrderType,
  quantities: Record<string, number> | undefined
): Array<CatalogProduct & { quantity: number }> {
  return getCatalog(business, type)
    .map((product: CatalogProduct) => ({
      ...product,
      quantity: (quantities && quantities[product.id]) ?? 0,
    }))
    .filter((product) => product.quantity > 0)
}
