// src/hooks/useGps.ts - Browser Geolocation hook with permission and accuracy tracking

import { useState, useEffect, useCallback, useRef } from 'react';
import { GpsStatus } from '@/types';

export interface DriverCoords {
  lat: number;
  lng: number;
  accuracyMeters?: number;
  heading?: number | null;
  speed?: number | null;
  timestamp?: number;
}

export function useGps(autoStart = false) {
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>(autoStart ? 'requesting' : 'off');
  const [position, setPosition] = useState<DriverCoords | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const startWatching = useCallback(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setGpsStatus('unavailable');
      setErrorMessage('Geolocation is not supported by this device.');
      return;
    }

    stopWatching();
    setGpsStatus('requesting');
    setErrorMessage(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracyMeters: pos.coords.accuracy || 15,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
          timestamp: pos.timestamp
        });
        setGpsStatus('on');
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGpsStatus('blocked');
          setErrorMessage('Location permission was denied.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGpsStatus('unavailable');
          setErrorMessage('Location is currently unavailable.');
        } else {
          setErrorMessage(err.message);
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000
      }
    );
  }, [stopWatching]);

  useEffect(() => {
    if (autoStart) {
      startWatching();
    }
    return () => {
      stopWatching();
    };
  }, [autoStart, startWatching, stopWatching]);

  return {
    gpsStatus,
    position,
    errorMessage,
    startWatching,
    stopWatching,
    setGpsStatus
  };
}
