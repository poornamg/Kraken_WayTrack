import mongoose, { Schema, model } from "mongoose"

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


const eventSchema = new Schema(
  {
    eventType: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    actorId: { type: Schema.Types.ObjectId, ref: "User" },
    actorRole: String,
    requestId: String,
    data: Schema.Types.Mixed,
  },
  { timestamps: true, versionKey: false },
)
eventSchema.index({ entityType: 1, entityId: 1, createdAt: -1 })
eventSchema.index({ entityType: 1, entityId: 1, createdAt: -1 })

export const OperationalEvent = model("OperationalEvent", eventSchema)
