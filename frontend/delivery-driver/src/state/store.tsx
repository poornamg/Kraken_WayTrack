// src/state/store.tsx - Unified prototype store composed of modular state slices

import React, { createContext, useContext, ReactNode } from 'react';
import {
  ScreenName,
  TransitionType,
  RoutePlan,
  Outlet,
  DriverProfile,
  MeterPhotoRecord,
  RouteMeterPhotos,
  PrototypeConditions,
  NetworkStatus,
  GpsStatus,
  GpsQuality
} from '@/types';
import {
  useNavigationSlice,
  getLogicalStackForScreen,
  getFallbackPrevScreen
} from './slices/navigationSlice';
import { useTrackingSlice } from './slices/trackingSlice';
import { useConditionsSlice } from './slices/conditionsSlice';
import { useRoutesSlice } from './slices/routesSlice';
import { useDemoSlice } from './slices/demoSlice';
import { useSyncQueue } from './syncQueueContext';
import { useRouteBootstrap } from './effects/useRouteBootstrap';
import { useGpsLocationTracking } from './effects/useGpsLocationTracking';

// Re-export domain types for backward compatibility
export type {
  ScreenName,
  MeterPhotoRecord,
  RouteMeterPhotos,
  TransitionType,
  NetworkStatus,
  GpsStatus,
  GpsQuality,
  PrototypeConditions
};
export { getLogicalStackForScreen, getFallbackPrevScreen };

export interface StoreContextType {
  // Navigation
  currentScreen: ScreenName;
  historyStack: ScreenName[];
  transitionType: TransitionType;
  returnTo: 'dashboard' | 'map';
  loginStage: 'stageA' | 'stageB';
  pushScreen: (screen: ScreenName) => void;
  popScreen: () => void;
  replaceScreen: (screen: ScreenName) => void;
  setReturnTo: (dest: 'dashboard' | 'map') => void;
  setLoginStage: (stage: 'stageA' | 'stageB') => void;

  // Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Driver & Routes
  driver: DriverProfile;
  routes: RoutePlan[];
  selectedRouteId: number | null;
  expandedRouteId: number | null;
  activeOutletId: string | null;
  selectedMapOutletId: string | null;
  selectRoute: (id: number | null) => void;
  toggleExpandRoute: (id: number) => void;
  startRoute: (id: number) => void;
  finishRoute: (id: number) => void;
  setRouteVersion: (id: number, version: number) => void;
  setActiveOutletId: (id: string | null) => void;
  setSelectedMapOutletId: (id: string | null) => void;
  toggleProductCheck: (outletId: string, productId: string) => void;
  updateProductShortfall: (
    outletId: string,
    productId: string,
    data: { shortQty: number; damagedQty: number; deliveredQty: number; reason?: string }
  ) => void;
  recordStopArrival: (outletId: string, timestamp?: string) => Promise<void>;
  markUnpackingComplete: (outletId: string, complete?: boolean) => Promise<void>;
  completeOutlet: (outletId: string, isOffline?: boolean) => void;
  syncPendingOutlets: () => Promise<void>;
  isSyncing: boolean;

  // Meter Photos
  meterPhotos: Record<number, RouteMeterPhotos>;
  setRouteMeterPhoto: (routeId: number, moment: 'start' | 'end', record: MeterPhotoRecord) => void;
  clearRouteMeterPhotos: (routeId: number) => void;

  // Conditions (Panel controlled)
  conditions: PrototypeConditions;
  setConditions: React.Dispatch<React.SetStateAction<PrototypeConditions>>;
  updateCondition: <K extends keyof PrototypeConditions>(key: K, value: PrototypeConditions[K]) => void;

  // Store Manager Actions
  managerApprove: (outletId?: string) => void;
  managerReject: (outletId?: string, reason?: string) => void;
  issueNewPin: (outletId?: string) => void;
  expirePin: (outletId?: string) => void;

  // Selectors
  selectedRoute: RoutePlan | undefined;
  activeOutlet: Outlet | undefined;
  completedOutletsCount: number;
  totalOutletsCount: number;
  allOutletsCompleted: boolean;
  upNextOutlet: Outlet | null;

  // Function Tracker
  trackedFunctions: Record<string, boolean>;
  track: (id: string) => void;
  resetTicks: () => void;
  resetDemo: () => void;
  jumpToScreen: (screen: ScreenName) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const syncQueue = useSyncQueue();
  const trackingSlice = useTrackingSlice();
  const navSlice = useNavigationSlice(trackingSlice.track);
  const conditionsSlice = useConditionsSlice(trackingSlice.track);
  const routesSlice = useRoutesSlice(trackingSlice.track, conditionsSlice.markMeterPhotosSynced, syncQueue);

  useRouteBootstrap(routesSlice.setRoutes);
  useGpsLocationTracking(routesSlice.routes);

  const { resetDemo, jumpToScreen } = useDemoSlice(
    navSlice,
    routesSlice,
    conditionsSlice,
    trackingSlice
  );

  return (
    <StoreContext.Provider
      value={{
        ...navSlice,
        ...trackingSlice,
        ...conditionsSlice,
        ...routesSlice,
        resetDemo,
        jumpToScreen
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};
