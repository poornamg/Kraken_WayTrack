import { PROTOTYPE_USERS } from "../data/mockUsers.js"
import { AuthError, type User } from "./types"
import type { AuthApi } from "./api"


const wait = (ms = 500) => new Promise((r) => setTimeout(r, ms))
const ROLE_ORIGINS = {
  dispatcher: import.meta.env.VITE_DISPATCHER_ORIGIN ?? "http://localhost:5174",
  loader: import.meta.env.VITE_LOADER_ORIGIN ?? "http://localhost:5175",
  driver: import.meta.env.VITE_DRIVER_ORIGIN ?? "http://localhost:5176",
  store_manager: import.meta.env.VITE_STORE_MANAGER_ORIGIN ?? "http://localhost:5177",
} as const

export const mockApi: AuthApi = {
  async login(employeeId, password, email) {
    await wait()
    const u = PROTOTYPE_USERS.find((x) => x.employeeId === employeeId.toUpperCase() && x.password === password && x.email === email.toLowerCase().trim())
    if (!u) throw new AuthError("INVALID_CREDENTIALS", "The supplied credentials do not match an active employee record.")
    const handoffCode = `mock-${crypto.randomUUID()}`
    return { handoffCode, redirectUrl: `${ROLE_ORIGINS[u.role]}/auth/callback?code=${encodeURIComponent(handoffCode)}`, expiresIn: 60 }
  },
}
