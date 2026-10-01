import mongoose, { Schema, model } from "mongoose"

const loadItemSchema = new Schema(
  {
    itemId: { type: String, required: true },
    stopId: { type: String, required: true },
    orderId: { type: Schema.Types.ObjectId, required: true },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    expectedQuantity: { type: Number, required: true },
    loadedQuantity: { type: Number, default: 0 },
    status: { type: String, enum: ["pending", "loaded", "missing", "damaged"], default: "pending" },
    exception: { type: Schema.Types.Mixed },
  },
  { _id: false },
)

const loadRecordSchema = new Schema(
  {
    tripId: { type: Schema.Types.ObjectId, ref: "Trip", required: true, unique: true },
    depot: { type: String, required: true },
    status: { type: String, enum: ["available", "claimed", "loading", "reconciled", "confirmed"], default: "available" },
    claimedBy: { type: Schema.Types.ObjectId, ref: "User" },
    claimedAt: Date,
    loadingStartedAt: Date,
    confirmedAt: Date,
    items: { type: [loadItemSchema], default: [] },
  },
  { timestamps: true, versionKey: "version", optimisticConcurrency: true },
)
loadRecordSchema.index({ depot: 1, status: 1, createdAt: -1 })
loadRecordSchema.index({ depot: 1, status: 1, createdAt: -1 })

export const LoadRecord = model("LoadRecord", loadRecordSchema)
