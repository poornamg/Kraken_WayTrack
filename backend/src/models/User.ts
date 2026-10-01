import mongoose, { Schema, model } from "mongoose"
import { ROLES } from "../common/constants/roles.js"

const userSchema = new Schema(
  {
    employeeId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ROLES, required: true },
    passwordHash: { type: String, required: true, select: false },
    outletId: { type: String, trim: true },
    depot: { type: String, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: "version", optimisticConcurrency: true },
)
userSchema.index({ email: 1, role: 1 })
userSchema.index({ email: 1, role: 1 })

export const User = model("User", userSchema)
