import mongoose, { Schema, model } from "mongoose"

const fileAssetSchema = new Schema(
  {
    publicId: { type: String, required: true, unique: true },
    provider: { type: String, default: "cloudinary" },
    kind: { type: String, required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tripId: { type: Schema.Types.ObjectId, ref: "Trip" },
    deliveryId: { type: Schema.Types.ObjectId, ref: "DeliveryRecord" },
    mimeType: { type: String, required: true },
    format: { type: String, required: true },
    bytes: { type: Number, required: true },
    capturedAt: { type: Date, required: true },
    providerVersion: Number,
  },
  { timestamps: true, versionKey: false },
)
fileAssetSchema.index({ tripId: 1, kind: 1 })
fileAssetSchema.index({ deliveryId: 1, kind: 1 })
fileAssetSchema.index({ tripId: 1, kind: 1 })
fileAssetSchema.index({ deliveryId: 1, kind: 1 })

export const FileAsset = model("FileAsset", fileAssetSchema)
