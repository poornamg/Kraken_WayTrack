import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import type { OrderDetailState } from "../../types/index"

export const orderDetailStages = [
  "Order confirmed",
  "Scheduled",
  "On the way",
  "Arrived",
  "Receipt confirmation",
]


export const orderDetailTimestamps: Record<OrderDetailState, string[]> = {
  deferred: ["Wed � 13:46", "-", "-", "-", "-", "-"],
  confirmed: ["Wed · 13:46", "-", "-", "-", "-", "-"],
  scheduled: ["Wed · 13:46", "Wed · 16:35", "-", "-", "-", "-"],
  "on-way": ["Wed · 13:46", "Wed · 16:35", "Thu · 05:48", "-", "-", "-"],
  arrived: ["Wed · 13:46", "Wed · 16:35", "Thu · 05:48", "Thu · 06:43", "-", "-"],

  "awaiting-confirmation": [
    "Wed · 13:46",
    "Wed · 16:35",
    "Thu · 05:48",
    "Thu · 06:43",
    "Thu · 06:45",
    "Current",
  ],
  "receipt-confirmed": [
    "Wed · 13:46",
    "Wed · 16:35",
    "Thu · 05:48",
    "Thu · 06:43",
    "Thu · 06:45",
    "Thu · 06:57",
  ],
  "receipt-issue": [
    "Wed · 13:46",
    "Wed · 16:35",
    "Thu · 05:48",
    "Thu · 06:43",
    "Thu · 06:45",
    "Thu · 06:59",
  ],
}


export const orderDetailStep: Record<OrderDetailState, number> = {
  deferred: 0,
  confirmed: 0,
  scheduled: 1,
  "on-way": 2,
  arrived: 3,
  
  "awaiting-confirmation": 5,
  "receipt-confirmed": 5,
  "receipt-issue": 5,
}

