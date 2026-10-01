// src/components/login/GpsIndicator.tsx - GPS status indicator pill for login/profile header

import React from 'react';
import { PrototypeConditions } from '@/types';

export interface GpsIndicatorProps {
  conditions: PrototypeConditions;
  isLocatingGps: boolean;
  onGpsTap: () => void;
}

export const GpsIndicator: React.FC<GpsIndicatorProps> = ({
  conditions,
  isLocatingGps,
  onGpsTap
}) => {
  return (
    <button
      type="button"
      onClick={onGpsTap}
      className={`h-8 px-3 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer ${
        conditions.gpsStatus === 'on'
          ? 'bg-gps-tint text-success-text cursor-default'
          : isLocatingGps
          ? 'bg-neutral-200 dark:bg-white/10 text-secondary'
          : 'bg-neutral-200 dark:bg-white/10 text-secondary hover:bg-neutral-300 dark:hover:bg-white/20'
      }`}
      aria-label="GPS Status"
    >
      <span
        className={`w-2 h-2 rounded-full ${
          conditions.gpsStatus === 'on'
            ? 'bg-action'
            : isLocatingGps
            ? 'bg-secondary animate-ping'
            : 'bg-secondary'
        }`}
      />
      <span className="text-[12px] font-semibold tracking-tight uppercase">
        {conditions.gpsStatus === 'on'
          ? 'GPS ON'
          : isLocatingGps
          ? 'SEARCHING…'
          : 'GPS OFF'}
      </span>
    </button>
  );
};

export default GpsIndicator;
