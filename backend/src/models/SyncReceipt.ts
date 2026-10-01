import mongoose, { Schema, model } from "mongoose"

const syncReceiptSchema = new Schema(
  {
    clientMutationId: { type: String, required: true },
    driverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tripId: { type: String, required: true },
    operation: { type: String, required: true },
    result: { type: String, enum: ["applied", "duplicate", "conflict", "rejected"], required: true },
    response: Schema.Types.Mixed,
  },
  { timestamps: true, versionKey: false },
)
syncReceiptSchema.index({ clientMutationId: 1, driverId: 1 }, { unique: true })
syncReceiptSchema.index({ clientMutationId: 1, driverId: 1 }, { unique: true })

export const SyncReceipt = model("SyncReceipt", syncReceiptSchema)
