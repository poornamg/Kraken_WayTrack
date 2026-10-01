import mongoose, { Schema, model } from "mongoose"
import { addressSchema } from "./shared.js"


const outletSchema = new Schema(
  {
    outletId: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    brand: { type: String, required: true },
    district: { type: String, required: true },
    depot: { type: String, required: true },
    dockType: String,
    parkingConstraint: String,
    windowOpenTime: { type: String, required: true },
    windowCloseTime: { type: String, required: true },
    coordinates: { latitude: Number, longitude: Number },
    source: { type: String, default: "official_csv" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: "version" },
)
outletSchema.index({ brand: 1, depot: 1, district: 1 })
outletSchema.index({ brand: 1, depot: 1, district: 1 })

export const Outlet = model("Outlet", outletSchema)
