import mongoose, { Schema, model } from "mongoose"
import { statusEventSchema } from "./shared.js"


const deliveryItemSchema = new Schema(
  { orderId: Schema.Types.ObjectId, sku: String, expected: Number, delivered: Number, short: Number, damaged: Number, note: String },
  { _id: false },
)


const addressSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    text: String,
  },
  { _id: false },
)



const deliveryRecordSchema = new Schema(
  {
    tripId: { type: Schema.Types.ObjectId, ref: "Trip", required: true },
    stopId: { type: String, required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    outletId: { type: String, required: true },
    driverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["planned", "arrived", "proof_verified", "completed"], default: "planned" },
    arrivedAt: Date,
    completedAt: Date,
    outcome: String,
    items: [deliveryItemSchema],
    pinHash: { type: String, select: false },
    pinExpiresAt: Date,
    pinAttempts: { type: Number, default: 0 },
    receipt: Schema.Types.Mixed,
  },
  { timestamps: true, versionKey: "version", optimisticConcurrency: true },
)
deliveryRecordSchema.index({ tripId: 1, stopId: 1 }, { unique: true })
deliveryRecordSchema.index({ outletId: 1, completedAt: -1 })
deliveryRecordSchema.index({ driverId: 1, completedAt: -1 })
deliveryRecordSchema.index({ tripId: 1, stopId: 1 }, { unique: true })
deliveryRecordSchema.index({ outletId: 1, completedAt: -1 })
deliveryRecordSchema.index({ driverId: 1, completedAt: -1 })

export const DeliveryRecord = model("DeliveryRecord", deliveryRecordSchema)
