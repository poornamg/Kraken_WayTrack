// src/components/meter/PhotoPreview.tsx

import React from 'react';
import { SuccessCheck } from './SuccessCheck';

export interface PhotoPreviewProps {
  previewUri: string;
  animPhase: 'photo-in' | 'draw-check' | 'hold' | 'advance';
  prefersReducedMotion?: boolean;
}

export const PhotoPreview: React.FC<PhotoPreviewProps> = ({
  previewUri,
  animPhase,
  prefersReducedMotion = false
}) => (
  <div className="w-full h-full relative overflow-hidden rounded-[20px]">
    <img
      src={previewUri}
      alt="Vehicle meter reading"
      className={`w-full h-full object-cover transition-all duration-300 ${
        animPhase === 'photo-in' ? 'scale-[0.98] opacity-80' : 'scale-100 opacity-100'
      }`}
    />
    <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px] flex items-center justify-center">
      <div
        className={`transition-all duration-300 transform ${
          animPhase === 'photo-in' ? 'scale-90 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <SuccessCheck prefersReducedMotion={prefersReducedMotion} animPhase={animPhase} />
      </div>
    </div>
  </div>
);

export default PhotoPreview;
