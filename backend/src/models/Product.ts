import mongoose, { Schema, model } from "mongoose"

const productSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true },
    orderTypes: [{ type: String, required: true }],
    unit: { type: String, required: true },
    weightKg: { type: Number, required: true, min: 0 },
    volumeM3: { type: Number, required: true, min: 0 },
    temperatureClass: { type: String, required: true },
    fragile: { type: Boolean, default: false },
    source: { type: String, required: true },
    assumptions: [{ type: String }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: "version" },
)
productSchema.index({ brand: 1, active: 1, name: 1 })
productSchema.index({ brand: 1, active: 1, name: 1 })

export const Product = model("Product", productSchema)
