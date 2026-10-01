// src/components/meter/PhotoCapture.tsx

import React from 'react';

export interface PhotoCaptureProps {
  onCaptureClick: () => void;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onCaptureClick }) => (
  <div
    onClick={onCaptureClick}
    className="flex flex-col items-center justify-center gap-2.5 text-secondary cursor-pointer"
  >
    <div className="w-12 h-12 rounded-full bg-bg flex items-center justify-center text-secondary">
      <span className="material-symbols-outlined text-[26px]">photo_camera</span>
    </div>
    <span className="text-[14px] font-medium text-secondary">Tap to capture</span>
  </div>
);

export default PhotoCapture;
