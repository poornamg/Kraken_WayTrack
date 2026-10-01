// src/state/slices/demoSlice.ts - Prototype demo reset and jump-to-screen navigation logic

import { useCallback } from 'react';
import { ScreenName } from '@/types';
import { createInitialRoutes } from '@/data/mockData';
import { DEFAULT_CONDITIONS } from './conditionsSlice';
import { getLogicalStackForScreen } from './navigationSlice';

export function useDemoSlice(
  navSlice: any,
  routesSlice: any,
  conditionsSlice: any,
  trackingSlice: any
) {
  const resetDemo = useCallback(() => {
    routesSlice.setRoutes(createInitialRoutes());
    routesSlice.setSelectedRouteId(null);
    routesSlice.setExpandedRouteId(null);
    routesSlice.setActiveOutletId(null);
    routesSlice.setSelectedMapOutletId(null);
    navSlice.setLoginStage('stageB');
    navSlice.setHistoryStack(['login']);
    navSlice.setTransitionType('replace');
    conditionsSlice.setConditions(DEFAULT_CONDITIONS);
    conditionsSlice.setMeterPhotos({});
    trackingSlice.setTrackedFunctions({ G01: true });
  }, [routesSlice, navSlice, conditionsSlice, trackingSlice]);

  const jumpToScreen = useCallback(
    (screen: ScreenName) => {
      navSlice.setTransitionType('replace');
      navSlice.setHistoryStack(getLogicalStackForScreen(screen));

      if (screen === 'login') {
        navSlice.setLoginStage('stageB');
        routesSlice.setSelectedRouteId(null);
      } else if (screen === 'meter_photo_start' || screen === 'dashboard') {
        routesSlice.setSelectedRouteId(1);
        navSlice.setLoginStage('stageB');
      } else if (screen === 'market_detail') {
        routesSlice.setSelectedRouteId(1);
        const r1 = routesSlice.routes[0];
        if (r1 && r1.outlets[0]) {
          routesSlice.setActiveOutletId(r1.outlets[0].id);
        }
      } else if (screen === 'pin_confirmation') {
        routesSlice.setSelectedRouteId(1);
        const r1 = routesSlice.routes[0];
        if (r1 && r1.outlets[0]) {
          routesSlice.setActiveOutletId(r1.outlets[0].id);
          routesSlice.setRoutes((prev: any[]) =>
            prev.map((r) => ({
              ...r,
              outlets: r.outlets.map((o: any, idx: number) => {
                if (idx === 0) {
                  return {
                    ...o,
                    unpackingComplete: true,
                    status: 'in_progress',
                    products: o.products.map((p: any) => ({ ...p, checked: true }))
                  };
                }
                return o;
              })
            }))
          );
        }
      } else if (screen === 'map') {
        routesSlice.setSelectedRouteId(2);
        routesSlice.setSelectedMapOutletId(null);
      } else if (screen === 'meter_photo_end') {
        routesSlice.setSelectedRouteId(2);
        routesSlice.setRoutes((prev: any[]) =>
          prev.map((r) => {
            if (r.id === 2 || r.routeNumber === 2) {
              return {
                ...r,
                status: 'in_progress',
                startedAt: '05:12',
                distanceKm: 42
              };
            }
            return r;
          })
        );
      } else if (screen === 'shift_summary') {
        routesSlice.setSelectedRouteId(2);
        routesSlice.setRoutes((prev: any[]) =>
          prev.map((r) => {
            if (r.id === 2 || r.routeNumber === 2) {
              return {
                ...r,
                status: 'completed',
                startedAt: '05:12',
                finishedAt: '11:48',
                distanceKm: 42,
                outlets: r.outlets.map((o: any) => ({
                  ...o,
                  status: 'completed',
                  syncStatus:
                    o.city === 'Teldeniya' || o.city === 'Kundasale' ? 'pending' : 'synced'
                }))
              };
            }
            return r;
          })
        );
      }
    },
    [navSlice, routesSlice]
  );

  return { resetDemo, jumpToScreen };
}
