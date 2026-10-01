// src/hooks/useNetworkQuality.ts - Hook tracking network connectivity and quality

import { useState, useEffect } from 'react';
import { NetworkStatus } from '@/types';

export function useNetworkQuality(initialStatus: NetworkStatus = 'good') {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(initialStatus);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setNetworkStatus('good');
    };
    const handleOffline = () => {
      setIsOnline(false);
      setNetworkStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    networkStatus,
    setNetworkStatus
  };
}
