'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';

/**
 * Hook pour gérer la connexion Socket.IO (Story 6.1)
 * 
 * Optimisé pour le bf-cache :
 * - Initialisation différée après le chargement initial de la page
 * - Utilise pagehide au lieu de unload pour ne pas bloquer le bf-cache
 * 
 * Note: Pour l'instant, utilisation de polling pour le temps réel
 * Socket.IO sera intégré dans une version ultérieure avec serveur séparé
 */
export function useSocket() {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(true); // Simulé pour l'instant
  const initializedRef = useRef(false);

  useEffect(() => {
    // Initialisation différée pour ne pas bloquer le bf-cache au chargement initial
    // La connexion Socket.IO sera initialisée après que la page soit complètement chargée
    if (initializedRef.current) return;
    
    // Utiliser requestIdleCallback ou setTimeout pour différer l'initialisation
    const initSocket = () => {
      // TODO: Implémenter Socket.IO avec serveur séparé
      // Pour l'instant, on simule une connexion active
      initializedRef.current = true;
      setIsConnected(true);
    };

    // Différer l'initialisation après le chargement initial
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(initSocket, { timeout: 2000 });
      } else {
        setTimeout(initSocket, 100);
      }
    }

    // Nettoyage avec pagehide au lieu de unload (compatible bf-cache)
    const handlePageHide = () => {
      // Nettoyage de la connexion Socket.IO si nécessaire
      // Ne pas utiliser unload car cela bloque le bf-cache
    };

    window.addEventListener('pagehide', handlePageHide);
    
    return () => {
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [session]);

  return { socket: null, isConnected };
}
