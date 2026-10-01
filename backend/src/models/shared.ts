import { Schema } from "mongoose"

const statusEventSchema = new Schema(
  {
    status: { type: String, required: true },
    at: { type: Date, required: true, default: Date.now },
    actorId: { type: Schema.Types.ObjectId, ref: "User" },
    note: String,
  },
  { _id: false },
)



const addressSchema = new Schema({ lat: { type: Number, required: true }, lng: { type: Number, required: true }, text: String }, { _id: false })

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    unit: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitWeightKg: { type: Number, required: true, min: 0 },
    unitVolumeM3: { type: Number, required: true, min: 0 },
    temperatureClass: { type: String, required: true },
    fragile: { type: Boolean, required: true },
  },
  { _id: false },
)

export { statusEventSchema, addressSchema, orderItemSchema }
