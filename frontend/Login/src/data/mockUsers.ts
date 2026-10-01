import type { User } from "../auth/types"

export const PROTOTYPE_USERS: (User & { password: string })[] = [
  { employeeId: "DSP-1001", password: "Dispatch@123", name: "Nuwan Perera", role: "dispatcher", email: "nuwan.perera@waypoint.lk" },
  { employeeId: "LDR-2001", password: "Loader@123", name: "Kasun Silva", role: "loader", email: "kasun.silva@waypoint.lk" },
  { employeeId: "DRV-3001", password: "Driver@123", name: "Ruwan Fernando", role: "driver", email: "ruwan.fernando@waypoint.lk" },
  { employeeId: "STM-4001", password: "Store@123", name: "Dilani Jayasuriya", role: "store_manager", email: "dilani.j@waypoint.lk" },
]
