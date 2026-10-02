// src/shared/components/ui/KeyFigures.tsx - Three quiet key figures in a row

import React from 'react';

export interface KeyFiguresProps {
  outletsCount: number;
  itemsCount: number;
  shortItemsCount?: number;
  damagedItemsCount?: number;
  distanceKm: number;
  totalTime: string;
  className?: string;
  style?: React.CSSProperties;
}

export const KeyFigures: React.FC<KeyFiguresProps> = ({
  outletsCount,
  itemsCount,
  shortItemsCount,
  damagedItemsCount,
  distanceKm,
  totalTime,
  className = '',
  style
}) => {
  return (
    <div className={`w-full text-center select-none ${className}`} style={style}>
      <div className="grid grid-cols-3 gap-1 px-1">
        {/* Outlets */}
        <div className="flex flex-col items-center">
          <span className="text-[28px] font-bold tracking-tight text-black dark:text-white tabular-nums font-mono leading-none">
            {outletsCount}
          </span>
          <span className="text-[13px] text-secondary mt-1.5 leading-tight font-normal">
            outlets
          </span>
        </div>

        {/* Items unpacked */}
        <div className="flex flex-col items-center">
          <span className="text-[28px] font-bold tracking-tight text-black dark:text-white tabular-nums font-mono leading-none">
            {itemsCount}
          </span>
          <span className="text-[13px] text-secondary mt-1.5 leading-tight font-normal">
            items unpacked
          </span>
          {(Boolean(shortItemsCount) || Boolean(damagedItemsCount)) && (
            <span className="text-[12px] text-amber-600 dark:text-amber-400 font-medium tabular-nums mt-0.5 leading-tight">
              {shortItemsCount ? `${shortItemsCount} short` : ''}
              {shortItemsCount && damagedItemsCount ? ' · ' : ''}
              {damagedItemsCount ? `${damagedItemsCount} damaged` : ''}
            </span>
          )}
        </div>

        {/* Distance */}
        <div className="flex flex-col items-center">
          <span className="text-[28px] font-bold tracking-tight text-black dark:text-white tabular-nums font-mono leading-none">
            {distanceKm} km
          </span>
          <span className="text-[13px] text-secondary mt-1.5 leading-tight font-normal">
            distance
          </span>
        </div>
      </div>

      {/* Total time secondary line */}
      <p className="text-[14px] text-secondary mt-3 tabular-nums font-normal tracking-tight">
        Total time <span className="font-mono">{totalTime}</span>
      </p>
    </div>
  );
};
