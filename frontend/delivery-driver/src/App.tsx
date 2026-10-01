// src/App.tsx - Thin shell (<100 lines): Providers + Screen switch + Mobile responsive device frame

import React, { lazy, Suspense } from 'react';
import { SyncQueueProvider } from '@/state/syncQueueContext';
import { StoreProvider, useStore } from '@/state/store';
import { Toast, DemoSwitcher } from '@/components/ui';
import { isDemoMode } from '@/shared/lib/demo';
import { ErrorBoundary } from './app/ErrorBoundary';
import '@/styles/globals.css';

// Feature screens (lazy loaded for optimal bundle splitting)
const Login = lazy(() => import('@/components/screens/Login'));
const MeterPhotoScreen = lazy(() => import('@/components/screens/MeterPhotoScreen'));
const RouteDashboard = lazy(() => import('@/components/screens/RouteDashboard'));
const MarketDetail = lazy(() => import('@/components/screens/MarketDetail'));
const PinConfirmation = lazy(() => import('@/components/screens/PinConfirmation'));
const MapNavigation = lazy(() => import('@/components/screens/MapNavigation'));
const ShiftSummary = lazy(() => import('@/components/screens/ShiftSummary'));

const ScreenFallback: React.FC = () => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-bg select-none">
    <div className="w-8 h-8 rounded-full border-2 border-action border-t-transparent animate-spin mb-2" />
    <span className="text-[13px] font-medium text-secondary">Loading…</span>
  </div>
);

const AppShell: React.FC = () => {
  const store = useStore();
  const { currentScreen, transitionType, toastMessage, jumpToScreen } = store;
  const demoActive = isDemoMode();

  if (demoActive && typeof window !== 'undefined') {
    (window as any).__store = store;
  }

  const getTransitionClass = () => {
    if (transitionType === 'push') return 'screen-push-enter';
    if (transitionType === 'pop') return 'screen-pop-enter';
    return 'screen-replace-enter';
  };

  return (
    <div className="w-full min-h-[100vh] min-h-[100dvh] bg-bg flex justify-center items-stretch selection:bg-primary-container">
      {/* Mobile-first centered column (320px fluid to 480px max on desktop) */}
      <div
        className="w-full max-w-[480px] min-h-[100vh] min-h-[100dvh] bg-bg sm:border-x sm:border-hairline/60 flex flex-col justify-between relative overflow-hidden"
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif'
        }}
      >
        <ErrorBoundary>
          <Suspense fallback={<ScreenFallback />}>
            <div key={currentScreen} className={`w-full h-full flex-1 flex flex-col ${getTransitionClass()}`}>
              {currentScreen === 'login' && <Login />}
              {currentScreen === 'meter_photo_start' && <MeterPhotoScreen moment="start" />}
              {currentScreen === 'dashboard' && <RouteDashboard />}
              {currentScreen === 'market_detail' && <MarketDetail />}
              {currentScreen === 'pin_confirmation' && <PinConfirmation />}
              {currentScreen === 'meter_photo_end' && <MeterPhotoScreen moment="end" />}
              {currentScreen === 'map' && <MapNavigation />}
              {currentScreen === 'shift_summary' && <ShiftSummary />}
            </div>
          </Suspense>
        </ErrorBoundary>

        <Toast message={toastMessage} />
      </div>

      {/* Floating Demo Screen Switcher Dock */}
      {demoActive && (
        <DemoSwitcher currentScreen={currentScreen} onJumpToScreen={jumpToScreen} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <SyncQueueProvider>
      <StoreProvider>
        <AppShell />
      </StoreProvider>
    </SyncQueueProvider>
  );
}
