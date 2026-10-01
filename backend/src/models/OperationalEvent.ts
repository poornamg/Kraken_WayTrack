import mongoose, { Schema, model } from "mongoose"
import { statusEventSchema } from "./shared.js"



const addressSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    text: String,
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
