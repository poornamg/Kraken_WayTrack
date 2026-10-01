import type { OrderType, CatalogProduct } from "../types/index"

export const productCatalog: Record<"fresh" | "style" | "tech", Partial<Record<OrderType, CatalogProduct[]>>> = {
  fresh: {
    dry: [
      { id: "rice", name: "Rice", unit: "bag" },
      { id: "milk-powder", name: "Milk powder", unit: "carton" },
      { id: "flour", name: "Flour", unit: "bag" },
      { id: "cooking-oil", name: "Cooking oil", unit: "bottle" },
      { id: "canned-goods", name: "Canned goods", unit: "carton" },
    ],
    chilled: [
      { id: "fresh-milk", name: "Fresh milk", unit: "carton" },
      { id: "chicken", name: "Chicken", unit: "kg" },
      { id: "frozen-vegetables", name: "Frozen vegetables", unit: "box" },
      { id: "yoghurt", name: "Yoghurt", unit: "crate" },
      { id: "frozen-meat", name: "Frozen meat", unit: "box" },
    ],
  },
  style: {
    products: [
      { id: "t-shirts", name: "T-shirts", unit: "piece" },
      { id: "shirts", name: "Shirts", unit: "piece" },
      { id: "trousers", name: "Trousers", unit: "piece" },
      { id: "dresses", name: "Dresses", unit: "piece" },
      { id: "jackets", name: "Jackets", unit: "piece" },
      { id: "shoes", name: "Shoes", unit: "pair" },
      { id: "sandals", name: "Sandals", unit: "pair" },
      { id: "bags", name: "Bags", unit: "piece" },
      { id: "belts", name: "Belts", unit: "piece" },
      { id: "caps", name: "Caps", unit: "piece" },
    ],
  },
  tech: {
    products: [
      { id: "laptops", name: "Laptops", unit: "unit" },
      { id: "smartphones", name: "Smartphones", unit: "unit" },
      { id: "monitors", name: "Monitors", unit: "unit" },
      { id: "tablets", name: "Tablets", unit: "unit" },
      { id: "keyboards", name: "Keyboards", unit: "unit" },
      { id: "mice", name: "Mice", unit: "unit" },
      { id: "chargers", name: "Chargers", unit: "unit" },
      { id: "headsets", name: "Headsets", unit: "unit" },
      { id: "cables", name: "Cables", unit: "unit" },
      { id: "battery-packs", name: "Battery packs", unit: "unit" },
    ],
  },
}
