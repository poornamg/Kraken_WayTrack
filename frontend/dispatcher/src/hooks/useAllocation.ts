// src/hooks/useAllocation.ts - Hook managing order selection and constraint validation for vehicle allocation

import { useState, useMemo, useCallback } from 'react'
import { Vehicle, Order } from '@/types'
import {
  checkWeightConstraint,
  checkVolumeConstraint,
  checkTemperatureConstraint,
  isAtQuota,
  isDayLimit
} from '@/domain/constraints'

export function useAllocation(selectedVehicle: Vehicle | null) {
  const [allocatedOrders, setAllocatedOrders] = useState<Order[]>([])

  const constraints = useMemo(() => {
    if (!selectedVehicle) return null

    const weight = checkWeightConstraint(allocatedOrders, selectedVehicle)
    const volume = checkVolumeConstraint(allocatedOrders, selectedVehicle)
    const temp = checkTemperatureConstraint(allocatedOrders, selectedVehicle)
    const quotaReached = isAtQuota(selectedVehicle)
    const dayLimitReached = isDayLimit(selectedVehicle)

    const hasViolations =
      weight.exceeded ||
      volume.exceeded ||
      temp.violation ||
      quotaReached ||
      dayLimitReached

    return {
      weight,
      volume,
      temp,
      quotaReached,
      dayLimitReached,
      hasViolations
    }
  }, [allocatedOrders, selectedVehicle])

  const toggleOrder = useCallback((order: Order) => {
    setAllocatedOrders((prev) => {
      const exists = prev.some((o) => o.id === order.id)
      if (exists) {
        return prev.filter((o) => o.id !== order.id)
      }
      return [...prev, order]
    })
  }, [])

  const clearAllocations = useCallback(() => {
    setAllocatedOrders([])
  }, [])

  return {
    allocatedOrders,
    setAllocatedOrders,
    toggleOrder,
    clearAllocations,
    constraints
  }
}
