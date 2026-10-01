import mongoose, { Schema, model } from "mongoose"

const deliveryItemSchema = new Schema(
  { orderId: Schema.Types.ObjectId, sku: String, expected: Number, delivered: Number, short: Number, damaged: Number, note: String },
  { _id: false },
)

const statusEventSchema = new Schema(
  {
    status: { type: String, required: true },
    at: { type: Date, required: true, default: Date.now },
    actorId: { type: Schema.Types.ObjectId, ref: "User" },
    note: String,
  },
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

const orderItemSchema = new Schema(
  {
    sku: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    weightKg: { type: Number, required: true },
    volumeM3: { type: Number, required: true },
    temperatureClass: { type: String, enum: ["ambient", "chilled", "frozen"] },
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
