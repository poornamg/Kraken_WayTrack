// src/state/effects/useRouteBootstrap.ts - Bootstraps live routes from API if authenticated

import { useEffect } from 'react';
import { RoutePlan } from '@/types';
import { driverApi } from '@/api/driver';

export function useRouteBootstrap(setRoutes: React.Dispatch<React.SetStateAction<RoutePlan[]>>) {
  useEffect(() => {
    if (import.meta.env.VITE_ALLOW_UNAUTHENTICATED_PROTOTYPE === 'true') return;
    void driverApi
      .routesToday()
      .then(async (trips) => {
        const details = await Promise.all(trips.map((trip) => driverApi.tripDetail(trip._id)));
        setRoutes(
          details.map((trip, index) => ({
            apiId: trip._id,
            version: trip.version,
            vehicleId: trip.vehicleId,
            id: index + 1,
            routeNumber: index + 1,
            brandName: trip.tripNumber,
            distanceKm: trip.distanceKm,
            status:
              trip.status === 'in_transit'
                ? 'in_progress'
                : trip.status === 'completed'
                ? 'completed'
                : 'pending',
            outlets: trip.stops.map((stop) => {
              const order =
                trip.orders.find(
                  (candidate) =>
                    candidate._id === String((stop as unknown as { orderId?: string }).orderId)
                ) ?? trip.orders.find((candidate) => candidate.outletId === stop.outletId);
              return {
                id: stop.stopId,
                city: stop.outletId,
                lat: 0,
                lng: 0,
                visitOrder: stop.sequence,
                managerName: 'Store Manager',
                managerPhone: '',
                itemCount: order?.items.length ?? 0,
                status:
                  stop.status === 'completed'
                    ? 'completed'
                    : stop.status === 'arrived'
                    ? 'in_progress'
                    : 'pending',
                arrivedAt: (stop as any).arrivedAt ? new Date((stop as any).arrivedAt).toISOString() : undefined,
                unpackingComplete: false,
                syncStatus: 'synced',
                products: (order?.items ?? []).map((item) => ({
                  id: item.sku,
                  name: item.name,
                  quantity: item.quantity,
                  unit: item.unit,
                  checked: false
                })),
                confirmation: {
                  approvalStatus: 'waiting',
                  attemptsLeft: 5,
                  locked: false,
                  expired: false
                }
              };
            })
          }))
        );
      })
      .catch((error) => {
        console.error('Driver route bootstrap list failed', error);
        setRoutes([]);
      });
  }, [setRoutes]);
}
