import mongoose, { Schema, model } from "mongoose"

const handoffSchema = new Schema(
  {
    codeHash: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    intendedOrigin: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    consumedAt: Date,
  },
  { timestamps: true, versionKey: false },
)
handoffSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
handoffSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const AuthHandoff = model("AuthHandoff", handoffSchema)
