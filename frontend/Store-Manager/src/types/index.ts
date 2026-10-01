type ButtonTone = "primary" | "secondary" | "issue"

type ButtonSize = "default" | "mobile"


type StatusKind = "confirmed" | "scheduled" | "transit" | "arrived" | "deferred" | "awaiting" | "received" | "issue"

const statusDetails: Record<StatusKind, {
  label: string
  icon: ReactNode
}> = {
  confirmed: { label: "Order confirmed", icon: <CheckCircle2 /> },
  scheduled: { label: "Scheduled", icon: <CalendarDays /> },
  transit: { label: "On the way", icon: <Truck /> },
  arrived: { label: "Arrived", icon: <CheckCircle2 /> },
  deferred: { label: "Deferred", icon: <Clock3 /> },
  awaiting: { label: "Awaiting confirmation", icon: <CircleAlert /> },
  received: { label: "Receipt confirmed", icon: <PackageCheck /> },
  issue: { label: "Receipt confirmed with issue", icon: <AlertTriangle /> },
}


type UpcomingDelivery = {
  id: string
  type: string
  date: string
  status: "confirmed" | "scheduled" | "deferred"
  eta: string
  reason?: string
}



type OrderType = "dry" | "chilled" | "products"

type OrderDrafts = Record<OrderType, Record<string, number>>


type CatalogProduct = {
  id: string
  name: string
  unit: string
}

const productCatalog: Record<"fresh" | "style" | "tech", Partial<Record<OrderType, CatalogProduct[]>>> = {
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

const mockDrafts: Record<"fresh" | "style" | "tech", Record<OrderType, Record<string, number>>> = {
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



type SubmissionState = "idle" | "submitting" | "error"


type OrderDetailState = "confirmed" | "deferred" | "scheduled" | "on-way" | "arrived" | "awaiting-confirmation" | "receipt-confirmed" | "receipt-issue"


type ReceiptFlowState = "verify" | "full" | "issue-edit" | "issue-review" | "confirmed" | "confirmed-issue"


type ReceiptIssueType = "good" | "missing" | "damaged" | "temperature" | "wrong-variant" | "wrong-item" | "seal" | "condition" | "other"


