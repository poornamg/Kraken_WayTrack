import mongoose, { Schema, model } from "mongoose"

const idempotencySchema = new Schema(
  {
    key: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, required: true },
    operation: { type: String, required: true },
    requestHash: { type: String, required: true },
    statusCode: { type: Number, required: true },
    response: { type: Schema.Types.Mixed, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true, versionKey: false },
)
idempotencySchema.index({ key: 1, userId: 1, operation: 1 }, { unique: true })
idempotencySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
idempotencySchema.index({ key: 1, userId: 1, operation: 1 }, { unique: true })
idempotencySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const IdempotencyRecord = model("IdempotencyRecord", idempotencySchema)
