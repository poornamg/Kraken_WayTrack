import mongoose, { Schema, model } from "mongoose"
import { statusEventSchema, orderItemSchema } from "./shared.js"


const ruleSchema = new Schema(
  { code: String, passed: Boolean, message: String, actual: Schema.Types.Mixed, threshold: Schema.Types.Mixed },
  { _id: false },
)

const stopSchema = new Schema(
  {
    stopId: { type: String, required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    outletId: { type: String, required: true },
    sequence: { type: Number, required: true },
    plannedArrivalAt: Date,
    status: { type: String, default: "planned" },
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



const tripSchema = new Schema(
  {
    tripNumber: { type: String, required: true, unique: true },
    serviceDate: { type: String, required: true },
    departureAt: { type: Date, required: true },
    depot: { type: String, required: true },
    vehicleId: { type: String, required: true },
    driverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dispatcherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["draft", "published", "load_confirmed", "claimed", "in_transit", "completed", "cancelled"], default: "draft" },
    stops: { type: [stopSchema], default: [] },
    distanceKm: { type: Number, required: true, min: 0 },
    plannedEndAt: Date,
    constraintCheck: { checkedAt: Date, valid: Boolean, rules: [ruleSchema] },
    claimedByDriverId: { type: Schema.Types.ObjectId, ref: "User" },
    vehicleConfirmedAt: Date,
    startFileAssetId: String,
    endFileAssetId: String,
    startedAt: Date,
    completedAt: Date,
    statusHistory: { type: [statusEventSchema], default: [] },
  },
  { timestamps: true, versionKey: "version", optimisticConcurrency: true },
)
tripSchema.index({ serviceDate: 1, vehicleId: 1, status: 1 })
tripSchema.index({ driverId: 1, serviceDate: 1 })
tripSchema.index({ serviceDate: 1, vehicleId: 1, status: 1 })
tripSchema.index({ driverId: 1, serviceDate: 1 })

export const Trip = model("Trip", tripSchema)
