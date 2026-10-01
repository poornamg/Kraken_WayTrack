import mongoose, { Schema, model } from "mongoose"

const calendarDaySchema = new Schema(
  {
    date: { type: String, required: true, unique: true },
    dayOfWeek: { type: String, required: true },
    isWeekend: { type: Boolean, required: true },
    isoYear: { type: Number, required: true },
    isoWeek: { type: Number, required: true },
    isPayday: { type: Boolean, required: true },
    festival: String,
    festivalRamp: Number,
    isHoliday: { type: Boolean, required: true },
    monsoon: { type: Boolean, required: true },
    isOperating: { type: Boolean, required: true },
  },
  { timestamps: true, versionKey: false },
)

export const CalendarDay = model("CalendarDay", calendarDaySchema)
