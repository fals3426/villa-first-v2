'use client';

import { useState, useEffect } from 'react';

/**
 * Hook pour détecter l'état de connexion (Story 5.10)
 */
export function useOffline() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Vérifier l'état initial
    setIsOffline(!navigator.onLine);

    // Écouter les changements d'état
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOffline;
}
