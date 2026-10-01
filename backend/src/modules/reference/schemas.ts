import { z } from "zod"
import { paginationSchema } from "../../common/utils/pagination.js"

export const getOutletsQuerySchema = z.object({ brand: z.string().optional(), depot: z.string().optional(), district: z.string().optional(), search: z.string().max(100).optional() }).merge(paginationSchema)
export const getVehiclesQuerySchema = z.object({ serviceDate: z.string(), depot: z.string().optional(), type: z.string().optional(), temp: z.string().optional() })
export const getDriversQuerySchema = z.object({ depot: z.string().optional() })
export const getProductsQuerySchema = z.object({ brand: z.string().optional(), orderType: z.string().optional(), search: z.string().max(100).optional() }).merge(paginationSchema)
export const getCalendarParamsSchema = z.object({ date: z.string() })
