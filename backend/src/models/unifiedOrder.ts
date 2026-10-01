import { Schema, model } from "mongoose"

const unifiedOrderSchema = new Schema(
  {
    storeId: { type: String, required: true },
    storeName: { type: String, required: true },
    town: { type: String, required: true },
    type: { type: String, required: true },
    itemsSummary: { type: String, required: true },
    items: [{ name: String, qty: Number }],
    kg: { type: Number, required: true },
    emergency: { type: Boolean, default: false },
    inReach: { type: Boolean, default: true },
    suggested: { type: Boolean, default: true },
    stop: { type: Number },
    deferred: { type: Boolean, default: false },
    deferredTo: { type: String },
    deferredNotice: { type: String },
    dueDay: { type: Number },
    status: { type: String, required: true, default: "Not scheduled" },
  },
  { timestamps: true }
)

unifiedOrderSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

export const UnifiedOrder = model("UnifiedOrder", unifiedOrderSchema)
