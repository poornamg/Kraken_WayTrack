import type { OrderType, OrderDrafts } from "../types/index"

export const mockDrafts: Record<"fresh" | "style" | "tech", Record<OrderType, Record<string, number>>> = {
  fresh: {
    dry: { rice: 20, "milk-powder": 30, flour: 10, "cooking-oil": 20 },
    chilled: { "fresh-milk": 12, chicken: 8 },
  },
  style: {
    products: { "t-shirts": 30, shirts: 20, trousers: 15, shoes: 12, dresses: 5, jackets: 4 },
  },
  tech: {
    products: { laptops: 6, smartphones: 12, monitors: 8, keyboards: 15, tablets: 10 },
  },
} as any
