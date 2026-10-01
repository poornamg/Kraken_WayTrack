// src/state/effects/useGpsLocationTracking.ts - Continuous GPS background queue and flush for active trip

import { useEffect } from 'react';
import { RoutePlan } from '@/types';
import { driverApi } from '@/api/driver';
import { queueLocation } from '@/offline/db';

export function useGpsLocationTracking(routes: RoutePlan[]) {
  useEffect(() => {
    const activeTrip = routes.find((route) => route.status === 'in_progress' && route.apiId);
    if (!activeTrip?.apiId || !navigator.geolocation) return;
    let sequence = Date.now();
    const flush = () => {
      if (navigator.onLine) {
        void driverApi
          .flushLocations(activeTrip.apiId!)
          .catch((error) => console.error('Location upload failed', error));
      }
    };
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const point = {
          key: `${activeTrip.apiId}:${sequence}`,
          tripId: activeTrip.apiId!,
          sequence: sequence++,
          recordedAt: new Date(position.timestamp).toISOString(),
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          ...(position.coords.heading == null ? {} : { heading: position.coords.heading }),
          ...(position.coords.speed == null ? {} : { speed: position.coords.speed })
        };
        void queueLocation(point).then(flush);
      },
      (error) => {
        console.error('Mandatory active-trip GPS gap', {
          code: error.code,
          message: error.message
        });
      },
      { enableHighAccuracy: true, maximumAge: 5_000, timeout: 15_000 }
    );
    window.addEventListener('online', flush);
    const interval = window.setInterval(flush, 30_000);
    return () => {
      navigator.geolocation.clearWatch(watchId);
      window.removeEventListener('online', flush);
      window.clearInterval(interval);
    };
  }, [routes]);
}
