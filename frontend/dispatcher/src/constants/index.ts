import type { Order } from "../types"

export const DAILY_TURN_LIMIT = 2
export const TODAY = 27
export const TODAY_ORDER_IDS = ["ORD-1047", "ORD-1056"]
export const OPEN_ORDER_EVENT = "waytrack:open-order"

export const ROUTE_EXTRAS_BY_DAY: Record<number, Order[]> = {
  27: [
    { id: "ORD-1061", shop: "Imaduwa Traders", town: "Imaduwa", type: "Tech", items: "5 boxes", kg: 140, emergency: false, inReach: true, suggested: true, dueDay: 28 },
    { id: "ORD-1064", shop: "Akuressa Food City", town: "Akuressa", type: "Fresh", items: "12 crates", kg: 180, emergency: false, inReach: true, suggested: true, dueDay: 28 },
    { id: "ORD-1066", shop: "Fort Book Corner", town: "Galle Fort", type: "Style", items: "3 boxes", kg: 60, emergency: false, inReach: true, suggested: true, dueDay: 30 },
  ],
  28: [
    { id: "ORD-1080", shop: "Weligama Bay Stores", town: "Weligama", type: "Fresh", items: "9 crates", kg: 130, emergency: false, inReach: true, suggested: true, dueDay: 30 },
    { id: "ORD-1082", shop: "Unawatuna Beach Mart", town: "Unawatuna", type: "Style", items: "4 boxes", kg: 90, emergency: false, inReach: true, suggested: true, dueDay: 30 },
  ],
}
