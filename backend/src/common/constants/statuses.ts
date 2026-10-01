export const ORDER_STATUSES = ["Draft", "Submitted", "Scheduled", "Deferred", "Confirmed", "Delivered", "Cancelled"] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];
export const TRIP_STATUSES = ["planned", "in-progress", "completed", "cancelled"] as const;
export type TripStatus = typeof TRIP_STATUSES[number];
