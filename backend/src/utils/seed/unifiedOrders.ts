import { UnifiedOrder } from "../../models/unifiedOrder.js"

const initialOrders = [
  { storeId: "store-1", storeName: "Matara City Mart", town: "Matara", type: "Fresh", itemsSummary: "8 crates", kg: 320, emergency: true, inReach: true, suggested: true, stop: 5, dueDay: 27, status: "Not scheduled", items: [] },
  { storeId: "store-2", storeName: "Coastal Traders", town: "Weligama", type: "Tech", itemsSummary: "3 boxes", kg: 90, emergency: true, inReach: true, suggested: true, stop: 3, dueDay: 27, status: "Not scheduled", items: [] },
  { storeId: "store-3", storeName: "Sunrise Mart", town: "Galle Fort", type: "Fresh", itemsSummary: "14 crates", kg: 410, emergency: false, inReach: true, suggested: true, stop: 1, dueDay: 27, status: "Not scheduled", items: [] },
  { storeId: "store-4", storeName: "Lanka Super Stores", town: "Unawatuna", type: "Style", itemsSummary: "6 boxes", kg: 260, emergency: false, inReach: true, suggested: true, stop: 2, dueDay: 27, status: "Not scheduled", items: [] },
  { storeId: "store-5", storeName: "Mirissa Mart", town: "Mirissa", type: "Tech", itemsSummary: "4 boxes", kg: 180, emergency: false, inReach: true, suggested: true, stop: 4, dueDay: 27, status: "Not scheduled", items: [] },
  { storeId: "store-6", storeName: "Hill View Stores", town: "Akuressa", type: "Fresh", itemsSummary: "10 crates", kg: 150, emergency: false, inReach: false, suggested: false, dueDay: 27, status: "Not scheduled", items: [] },
  { storeId: "store-7", storeName: "Galle Fashion House", town: "Galle", type: "Style", itemsSummary: "5 boxes", kg: 120, emergency: false, inReach: true, suggested: false, dueDay: 27, status: "Not scheduled", items: [] },
  { storeId: "store-8", storeName: "Imaduwa Traders", town: "Imaduwa", type: "Tech", itemsSummary: "5 boxes", kg: 140, emergency: false, inReach: true, suggested: false, dueDay: 28, status: "Not scheduled", items: [] },
  { storeId: "store-9", storeName: "Akuressa Food City", town: "Akuressa", type: "Fresh", itemsSummary: "12 crates", kg: 180, emergency: false, inReach: true, suggested: false, dueDay: 28, status: "Not scheduled", items: [] },
  { storeId: "store-10", storeName: "Fort Book Corner", town: "Galle Fort", type: "Tech", itemsSummary: "2 boxes", kg: 60, emergency: false, inReach: true, suggested: false, dueDay: 28, status: "Not scheduled", items: [] },
  { storeId: "store-3", storeName: "Sunrise Mart", town: "Galle", type: "Fresh", itemsSummary: "7 crates", kg: 220, emergency: false, inReach: true, suggested: false, dueDay: 28, status: "Not scheduled", items: [] },
  { storeId: "store-2", storeName: "Coastal Traders", town: "Weligama", type: "Tech", itemsSummary: "3 boxes", kg: 80, emergency: false, inReach: true, suggested: true, dueDay: 28, status: "Not scheduled", items: [] },
  { storeId: "store-5", storeName: "Mirissa Mart", town: "Mirissa", type: "Style", itemsSummary: "4 boxes", kg: 140, emergency: false, inReach: true, suggested: true, dueDay: 28, status: "Not scheduled", items: [] }
]

export async function seedUnifiedOrders() {
  const count = await UnifiedOrder.countDocuments()
  if (count === 0) {
    await UnifiedOrder.insertMany(initialOrders)
    console.log("Seeded unified orders")
  }
}
