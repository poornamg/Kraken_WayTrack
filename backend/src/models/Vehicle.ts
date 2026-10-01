import mongoose, { Schema, model } from "mongoose"

const vehicleSchema = new Schema(
  {
    vehicleId: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    temperatureClass: { type: String, required: true },
    weightCapacityKg: { type: Number, required: true, min: 0 },
    volumeCapacityM3: { type: Number, required: true, min: 0 },
    fuelType: { type: String, required: true },
    kmPerL: { type: Number, required: true, min: 0.01 },
    weeklyFuelQuotaL: { type: Number, required: true, min: 0 },
    depot: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: "version" },
)
vehicleSchema.index({ depot: 1, type: 1, temperatureClass: 1, active: 1 })
vehicleSchema.index({ depot: 1, type: 1, temperatureClass: 1, active: 1 })

export const Vehicle = model("Vehicle", vehicleSchema)
