// src/components/meter/SuccessCheck.tsx

import React from 'react';

export interface SuccessCheckProps {
  prefersReducedMotion?: boolean;
  animPhase?: 'photo-in' | 'draw-check' | 'hold' | 'advance';
}

export const SuccessCheck: React.FC<SuccessCheckProps> = ({
  prefersReducedMotion = false,
  animPhase = 'draw-check'
}) => (
  <svg className="w-20 h-20" viewBox="0 0 72 72" fill="none">
    <circle cx="36" cy="36" r="32" className="stroke-white/20" strokeWidth="3.5" />
    <circle
      cx="36"
      cy="36"
      r="32"
      stroke="#00C46A"
      strokeWidth="3.5"
      strokeLinecap="round"
      style={{
        strokeDasharray: 202,
        strokeDashoffset: prefersReducedMotion || animPhase !== 'photo-in' ? 0 : 202,
        transition: prefersReducedMotion
          ? 'none'
          : 'stroke-dashoffset 400ms cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    />
    <path
      d="M22 36.5L31.5 46L50 26.5"
      stroke="#00C46A"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        strokeDasharray: 42,
        strokeDashoffset: prefersReducedMotion || animPhase !== 'photo-in' ? 0 : 42,
        transition: prefersReducedMotion
          ? 'none'
          : 'stroke-dashoffset 350ms cubic-bezier(0.16, 1, 0.3, 1) 150ms'
      }}
    />
  </svg>
);

export default SuccessCheck;
