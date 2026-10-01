export const ROLES = ["dispatcher", "loader", "driver", "store_manager"] as const;
export type Role = typeof ROLES[number];
