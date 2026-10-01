// src/hooks/usePhotoUpload.ts - Handles photo file validation, compression, and preview generation

import { useState, useRef, useEffect, useCallback } from 'react';

export interface UsePhotoUploadOptions {
  maxSizeBytes?: number;
  maxDimension?: number;
}

export function usePhotoUpload(options: UsePhotoUploadOptions = {}) {
  const { maxSizeBytes = 10 * 1024 * 1024, maxDimension = 1600 } = options;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const activeObjectUrlRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    if (activeObjectUrlRef.current) {
      URL.revokeObjectURL(activeObjectUrlRef.current);
      activeObjectUrlRef.current = null;
    }
    setPreviewUri(null);
    setErrorMessage(null);
  }, []);

  useEffect(() => {
    return () => {
      if (activeObjectUrlRef.current) {
        URL.revokeObjectURL(activeObjectUrlRef.current);
      }
    };
  }, []);

  const validateAndProcessFile = useCallback(
    async (file: File): Promise<{ file: File; dataUri: string; objectUrl: string } | null> => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
      const validExtensions = /\.(jpe?g|png|webp|heic|heif)$/i;

      if (!validTypes.includes(file.type.toLowerCase()) && !validExtensions.test(file.name)) {
        setErrorMessage("That file isn't a photo. Please try again.");
        return null;
      }

      if (file.size > maxSizeBytes) {
        setErrorMessage('Photo exceeds 10MB limit. Please choose a smaller photo.');
        return null;
      }

      setErrorMessage(null);

      const objectUrl = URL.createObjectURL(file);
      activeObjectUrlRef.current = objectUrl;

      const compressedDataUri = await new Promise<string>((resolve) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.82));
          } else {
            resolve(objectUrl);
          }
        };
        img.onerror = () => resolve(objectUrl);
        img.src = objectUrl;
      });

      setPreviewUri(compressedDataUri);
      return { file, dataUri: compressedDataUri, objectUrl };
    },
    [maxSizeBytes, maxDimension]
  );

  return {
    previewUri,
    setPreviewUri,
    errorMessage,
    setErrorMessage,
    validateAndProcessFile,
    cleanup
  };
}
