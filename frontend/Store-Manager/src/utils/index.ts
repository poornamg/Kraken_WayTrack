import type { OrderType, CatalogProduct } from "../types";

function formatOutlet(business: "fresh" | "style" | "tech" = "fresh") {
  if (business === "style") return "Waypoint Style · Kandy City"
  if (business === "tech") return "Waypoint Tech · Kandy City"
  return "Waypoint Fresh · Kandy City"
}

function formatOrderType(business: "fresh" | "style" | "tech" = "fresh", type: OrderType = "dry") {
  if (business === "style") return "Style stock"
  if (business === "tech") return "Tech stock"
  if (type === "dry") return "Dry groceries"
  return "Chilled / Frozen"
}


function getDefaultOrderType(business: "fresh" | "style" | "tech"): OrderType {
  if (business === "fresh") return "dry"
  return "products"
}


function pluralizeUnit(unit: string, quantity: number) {
  if (quantity === 1 || unit === "kg") return unit
  return unit + "s"
}


function selectedProducts(business: "fresh" | "style" | "tech", type: OrderType, quantities: Record<string, number> | undefined): Array<CatalogProduct & { quantity: number }> {
  return getCatalog(business, type)
    .map((product) => ({ ...product, quantity: (quantities && quantities[product.id]) ?? 0 }))
    .filter((product) => product.quantity > 0)
}
