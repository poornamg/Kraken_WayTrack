import mongoose, { Schema, model } from "mongoose"
import { addressSchema } from "./shared.js"


const locationSchema = new Schema(
  {
    tripId: { type: Schema.Types.ObjectId, ref: "Trip", required: true },
    driverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sequence: { type: Number, required: true },
    recordedAt: { type: Date, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    heading: Number,
    speed: Number,
  },
  { timestamps: true, versionKey: false },
)
locationSchema.index({ tripId: 1, sequence: 1 }, { unique: true })
locationSchema.index({ tripId: 1, recordedAt: -1 })
locationSchema.index({ tripId: 1, sequence: 1 }, { unique: true })
locationSchema.index({ tripId: 1, recordedAt: -1 })

export const TripLocation = model("TripLocation", locationSchema)
