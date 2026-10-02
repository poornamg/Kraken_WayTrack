// src/state/slices/routesSlice.ts - Routes, outlets, products, and manager actions

import { useState, useCallback, useMemo } from 'react';
import { RoutePlan, Outlet, DriverProfile } from '@/shared/types';
import { createInitialRoutes } from '@/shared/lib/mockData';
import { CANONICAL_DRIVER } from '@/shared/lib/constants';
import { driverApi } from '@/api/driver';
import type { SyncQueueContextType } from '../syncQueueContext';

export function useRoutesSlice(
  track: (id: string) => void,
  onSyncPhotos?: () => void,
  syncQueue?: SyncQueueContextType
) {
  const [driver] = useState<DriverProfile>(CANONICAL_DRIVER);
  const [routes, setRoutes] = useState<RoutePlan[]>(createInitialRoutes());
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [expandedRouteId, setExpandedRouteId] = useState<number | null>(null);
  const [activeOutletId, setActiveOutletId] = useState<string | null>(null);
  const [selectedMapOutletId, setSelectedMapOutletId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const selectRoute = useCallback((id: number | null) => {
    setSelectedRouteId(id);
    if (id !== null) {
      track('L06');
    } else {
      track('L07');
    }
  }, [track]);

  const toggleExpandRoute = useCallback((id: number) => {
    setExpandedRouteId((prev) => {
      const next = prev === id ? null : id;
      if (next !== null) track('L05');
      return next;
    });
  }, [track]);

  const startRoute = useCallback((id: number) => {
    setSelectedRouteId(id);
    setRoutes((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            status: 'in_progress',
            startedAt: r.startedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        return r;
      })
    );
  }, []);

  const finishRoute = useCallback((id: number) => {
    setRoutes((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            status: 'completed',
            finishedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        return r;
      })
    );
  }, []);

  const setRouteVersion = useCallback((id: number, version: number) => {
    setRoutes((prev) => prev.map((route) => route.id === id ? { ...route, version } : route));
  }, []);

  const toggleProductCheck = useCallback((outletId: string, productId: string) => {
    setRoutes((prev) =>
      prev.map((r) => ({
        ...r,
        outlets: r.outlets.map((o) => {
          if (o.id !== outletId) return o;
          const products = o.products.map((p) => {
            if (p.id === productId) return { ...p, checked: !p.checked };
            return p;
          });
          const allChecked = products.every((p) => p.checked);
          return {
            ...o,
            products,
            status: products.some((p) => p.checked) ? 'in_progress' : o.status,
            unpackingComplete: allChecked ? o.unpackingComplete : false
          };
        })
      }))
    );
    track('M01');
  }, [track]);

  const updateProductShortfall = useCallback((
    outletId: string,
    productId: string,
    data: { shortQty: number; damagedQty: number; deliveredQty: number; reason?: string }
  ) => {
    setRoutes((prev) =>
      prev.map((r) => ({
        ...r,
        outlets: r.outlets.map((o) => {
          if (o.id !== outletId) return o;
          const products = o.products.map((p) => {
            if (p.id !== productId) return p;
            return {
              ...p,
              checked: true,
              shortQty: data.shortQty,
              damagedQty: data.damagedQty,
              deliveredQty: data.deliveredQty,
              reason: data.reason
            };
          });
          const allChecked = products.every((p) => p.checked);
          return {
            ...o,
            products,
            status: products.some((p) => p.checked) ? 'in_progress' : o.status,
            unpackingComplete: allChecked ? o.unpackingComplete : false
          };
        })
      }))
    );
    if (syncQueue) {
      const route = routes.find((candidate) => candidate.outlets.some((outlet) => outlet.id === outletId));
      syncQueue.enqueue('outlet_progress', {
        tripId: route?.apiId ?? String(route?.id),
        stopId: outletId,
        productId,
        ...data,
        entityType: 'stop'
      });
    }
  }, [routes, syncQueue]);

  const recordStopArrival = useCallback(async (outletId: string, timestamp?: string) => {
    const route = routes.find((candidate) => candidate.outlets.some((outlet) => outlet.id === outletId));
    const targetOutlet = route?.outlets.find((o) => o.id === outletId);
    if (!targetOutlet) return;
    if (targetOutlet.arrivedAt) return;

    const arrivedAt = timestamp || new Date().toISOString();

    setRoutes((prev) =>
      prev.map((r) => {
        if (r.id !== route?.id) return r;
        return {
          ...r,
          outlets: r.outlets.map((o) => {
            if (o.id !== outletId) return o;
            return {
              ...o,
              arrivedAt,
              status: o.status === 'completed' ? 'completed' : 'in_progress'
            };
          })
        };
      })
    );

    if (syncQueue) {
      syncQueue.enqueue('stop_arrival', {
        tripId: route?.apiId ?? String(route?.id),
        stopId: outletId,
        arrivedAt,
        entityType: 'stop'
      });
    }

    if (route?.apiId && typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const result = await driverApi.arriveStop(route.apiId, outletId, arrivedAt);
        if (result.tripVersion !== undefined) {
          setRoutes((prev) =>
            prev.map((r) => (r.id === route.id ? { ...r, version: result.tripVersion } : r))
          );
        }
      } catch (e) {
        console.warn('arriveStop API call failed or offline; queued in syncQueue', e);
      }
    }
  }, [routes, syncQueue]);

  const markUnpackingComplete = useCallback(async (outletId: string, complete: boolean = true) => {
    const route = routes.find((candidate) => candidate.outlets.some((outlet) => outlet.id === outletId));
    let deliveryVersion = route?.outlets.find((outlet) => outlet.id === outletId)?.apiVersion;
    let tripVersion = route?.version;
    const targetOutlet = route?.outlets.find((outlet) => outlet.id === outletId);
    const existingArrivedAt = targetOutlet?.arrivedAt;
    const finalArrivedAt = existingArrivedAt || new Date().toISOString();
    if (complete && route?.apiId && deliveryVersion === undefined && import.meta.env.VITE_ALLOW_UNAUTHENTICATED_PROTOTYPE !== 'true') {
      const arrived = await driverApi.arriveStop(route.apiId, outletId, finalArrivedAt);
      const outlet = route.outlets.find((candidate) => candidate.id === outletId)!;
      const updated = await driverApi.accountStopItems(route.apiId, outletId, arrived.delivery.version, outlet.products);
      deliveryVersion = updated.version;
      tripVersion = arrived.tripVersion;
    }
    if (complete && syncQueue && targetOutlet) {
      syncQueue.enqueue('stop_items', {
        tripId: route?.apiId ?? String(route?.id),
        stopId: outletId,
        items: targetOutlet.products.map((p) => ({
          sku: p.id,
          deliveredQty: p.deliveredQty ?? (p.checked ? Number(p.quantity) : 0),
          shortQty: p.shortQty ?? 0,
          damagedQty: p.damagedQty ?? 0,
          reason: p.reason
        })),
        entityType: 'stop'
      });
    }
    setRoutes((prev) =>
      prev.map((r) => ({
        ...r,
        version: r.id === route?.id && tripVersion !== undefined ? tripVersion : r.version,
        outlets: r.outlets.map((o) => {
          if (o.id !== outletId) return o;
          return {
            ...o,
            apiVersion: deliveryVersion,
            unpackingComplete: complete,
            status: 'in_progress',
            arrivedAt: o.arrivedAt || finalArrivedAt
          };
        })
      }))
    );
  }, [routes, syncQueue]);

  const completeOutlet = useCallback((outletId: string, isOffline: boolean = false) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setRoutes((prev) =>
      prev.map((r) => ({
        ...r,
        outlets: r.outlets.map((o) => {
          if (o.id !== outletId) return o;
          const hasShortfall = o.products.some((p) => (Number(p.shortQty || 0) > 0) || (Number(p.damagedQty || 0) > 0));
          return {
            ...o,
            status: 'completed',
            outcome: hasShortfall ? 'delivered with shortfall' : 'delivered',
            completedAt: timeStr,
            syncStatus: isOffline ? 'pending' : 'synced',
            confirmation: {
              ...o.confirmation,
              approvalStatus: 'approved'
            }
          };
        })
      }))
    );
  }, []);

  const syncPendingOutlets = useCallback(async () => {
    setIsSyncing(true);
    track('S03');
    await new Promise((r) => setTimeout(r, 600));
    setRoutes((prev) =>
      prev.map((r) => ({
        ...r,
        outlets: r.outlets.map((o) => ({ ...o, syncStatus: 'synced' }))
      }))
    );
    if (onSyncPhotos) {
      onSyncPhotos();
    }
    setIsSyncing(false);
  }, [track, onSyncPhotos]);

  // Selectors
  const selectedRoute = useMemo(() => {
    const active = routes.find((r) => r.id === selectedRouteId);
    if (active) return active;
    return routes.find((r) => r.status === 'in_progress') || routes[0];
  }, [routes, selectedRouteId]);

  const activeOutlet = useMemo(() => {
    if (!selectedRoute) return undefined;
    if (activeOutletId) {
      const found = selectedRoute.outlets.find((o) => o.id === activeOutletId);
      if (found) return found;
    }
    return selectedRoute.outlets[0];
  }, [selectedRoute, activeOutletId]);

  const completedOutletsCount = useMemo(() => {
    return selectedRoute?.outlets.filter((o) => o.status === 'completed').length || 0;
  }, [selectedRoute]);

  const totalOutletsCount = useMemo(() => {
    return selectedRoute?.outlets.length || 0;
  }, [selectedRoute]);

  const allOutletsCompleted = useMemo(() => {
    return totalOutletsCount > 0 && completedOutletsCount === totalOutletsCount;
  }, [totalOutletsCount, completedOutletsCount]);

  const upNextOutlet = useMemo(() => {
    if (!selectedRoute) return null;
    const inProg = selectedRoute.outlets.find((o) => o.status === 'in_progress');
    if (inProg) return inProg;
    const pending = selectedRoute.outlets.find((o) => o.status === 'pending');
    return pending || null;
  }, [selectedRoute]);

  // Store Manager Actions
  const managerApprove = useCallback((outletId?: string) => {
    const targetId = outletId || activeOutlet?.id;
    if (!targetId) return;
    setRoutes((prev) =>
      prev.map((r) => ({
        ...r,
        outlets: r.outlets.map((o) => {
          if (o.id !== targetId) return o;
          return {
            ...o,
            confirmation: { ...o.confirmation, approvalStatus: 'approved' }
          };
        })
      }))
    );
    track('P07');
  }, [activeOutlet, track]);

  const managerReject = useCallback((outletId?: string, reason: string = '2 items reported damaged') => {
    const targetId = outletId || activeOutlet?.id;
    if (!targetId) return;
    setRoutes((prev) =>
      prev.map((r) => ({
        ...r,
        outlets: r.outlets.map((o) => {
          if (o.id !== targetId) return o;
          return {
            ...o,
            confirmation: { ...o.confirmation, approvalStatus: 'rejected', rejectionReason: reason }
          };
        })
      }))
    );
    track('P06');
  }, [activeOutlet, track]);

  const issueNewPin = useCallback((outletId?: string) => {
    const targetId = outletId || activeOutlet?.id;
    if (!targetId) return;
    setRoutes((prev) =>
      prev.map((r) => ({
        ...r,
        outlets: r.outlets.map((o) => {
          if (o.id !== targetId) return o;
          return {
            ...o,
            confirmation: {
              ...o.confirmation,
              attemptsLeft: 3,
              locked: false,
              expired: false
            }
          };
        })
      }))
    );
  }, [activeOutlet]);

  const expirePin = useCallback((outletId?: string) => {
    const targetId = outletId || activeOutlet?.id;
    if (!targetId) return;
    setRoutes((prev) =>
      prev.map((r) => ({
        ...r,
        outlets: r.outlets.map((o) => {
          if (o.id !== targetId) return o;
          return {
            ...o,
            confirmation: { ...o.confirmation, expired: true }
          };
        })
      }))
    );
    track('P06');
  }, [activeOutlet, track]);

  return {
    driver,
    routes,
    setRoutes,
    selectedRouteId,
    setSelectedRouteId,
    expandedRouteId,
    setExpandedRouteId,
    activeOutletId,
    setActiveOutletId,
    selectedMapOutletId,
    setSelectedMapOutletId,
    isSyncing,
    selectRoute,
    toggleExpandRoute,
    startRoute,
    finishRoute,
    setRouteVersion,
    toggleProductCheck,
    updateProductShortfall,
    recordStopArrival,
    markUnpackingComplete,
    completeOutlet,
    syncPendingOutlets,
    selectedRoute,
    activeOutlet,
    completedOutletsCount,
    totalOutletsCount,
    allOutletsCompleted,
    upNextOutlet,
    managerApprove,
    managerReject,
    issueNewPin,
    expirePin
  };
}
