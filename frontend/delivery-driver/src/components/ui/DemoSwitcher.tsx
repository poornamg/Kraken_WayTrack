// src/components/ui/DemoSwitcher.tsx - Floating Demo Screen Switcher Dock

import React from 'react';
import { ScreenName } from '@/types';

export interface DemoSwitcherProps {
  currentScreen: ScreenName;
  onJumpToScreen: (screen: ScreenName) => void;
}

export const DemoSwitcher: React.FC<DemoSwitcherProps> = ({
  currentScreen,
  onJumpToScreen
}) => {
  return (
    <aside
      aria-label="Demo switcher"
      className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900/95 text-neutral-300 rounded-full text-[11px] backdrop-blur-md border border-neutral-700 shadow-2xl select-none overflow-x-auto max-w-[96vw]"
    >
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[9px] font-bold uppercase tracking-wider shrink-0 mr-1">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span>Demo Mode</span>
      </div>

      <button
        type="button"
        onClick={() => onJumpToScreen('login')}
        className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer shrink-0 ${
          currentScreen === 'login' ? 'bg-primary text-white font-bold' : 'hover:bg-neutral-800'
        }`}
      >
        1. Login
      </button>
      <button
        type="button"
        onClick={() => onJumpToScreen('meter_photo_start')}
        className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer shrink-0 ${
          currentScreen === 'meter_photo_start' ? 'bg-primary text-white font-bold' : 'hover:bg-neutral-800'
        }`}
      >
        Start Meter
      </button>
      <button
        type="button"
        onClick={() => onJumpToScreen('dashboard')}
        className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer shrink-0 ${
          currentScreen === 'dashboard' ? 'bg-primary text-white font-bold' : 'hover:bg-neutral-800'
        }`}
      >
        2. Route
      </button>
      <button
        type="button"
        onClick={() => onJumpToScreen('market_detail')}
        className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer shrink-0 ${
          currentScreen === 'market_detail' ? 'bg-primary text-white font-bold' : 'hover:bg-neutral-800'
        }`}
      >
        3. Detail
      </button>
      <button
        type="button"
        onClick={() => onJumpToScreen('pin_confirmation')}
        className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer shrink-0 ${
          currentScreen === 'pin_confirmation' ? 'bg-primary text-white font-bold' : 'hover:bg-neutral-800'
        }`}
      >
        4. PIN
      </button>
      <button
        type="button"
        onClick={() => onJumpToScreen('meter_photo_end')}
        className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer shrink-0 ${
          currentScreen === 'meter_photo_end' ? 'bg-primary text-white font-bold' : 'hover:bg-neutral-800'
        }`}
      >
        End Meter
      </button>
      <button
        type="button"
        onClick={() => onJumpToScreen('map')}
        className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer shrink-0 ${
          currentScreen === 'map' ? 'bg-primary text-white font-bold' : 'hover:bg-neutral-800'
        }`}
      >
        5. Map
      </button>
      <button
        type="button"
        onClick={() => onJumpToScreen('shift_summary')}
        className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer shrink-0 ${
          currentScreen === 'shift_summary' ? 'bg-primary text-white font-bold' : 'hover:bg-neutral-800'
        }`}
      >
        6. Summary
      </button>
    </aside>
  );
};
