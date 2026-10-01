import mongoose, { Schema, model } from "mongoose"
import { statusEventSchema, orderItemSchema } from "./shared.js"



const addressSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    text: String,
  },
  { _id: false },
)



const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    outletId: { type: String, required: true },
    storeManagerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    brand: { type: String, required: true },
    orderType: { type: String, required: true },
    requestedDate: { type: String, required: true },
    cutoffBucket: { type: String, enum: ["before_cutoff", "after_cutoff"], required: true },
    status: { type: String, enum: ["submitted", "deferred", "allocated", "in_transit", "delivered", "cancelled"], default: "submitted" },
    items: { type: [orderItemSchema], required: true },
    totalWeightKg: { type: Number, required: true },
    totalVolumeM3: { type: Number, required: true },
    allocatedTripId: { type: Schema.Types.ObjectId, ref: "Trip" },
    deferredTo: String,
    deferralReason: String,
    statusHistory: { type: [statusEventSchema], default: [] },
  },
  { timestamps: true, versionKey: "version", optimisticConcurrency: true },
)
orderSchema.index({ outletId: 1, createdAt: -1 })
orderSchema.index({ requestedDate: 1, status: 1, brand: 1 })
orderSchema.index({ outletId: 1, createdAt: -1 })
orderSchema.index({ requestedDate: 1, status: 1, brand: 1 })

export const Order = model("Order", orderSchema)
