'use client';

import { useOffline } from '@/hooks/useOffline';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { WifiOff, Wifi } from 'lucide-react';

/**
 * Indicateur de mode hors ligne (Story 5.10)
 */
export function OfflineIndicator() {
  const isOffline = useOffline();

  if (!isOffline) {
    return null;
  }

  return (
    <Alert className="mb-4 bg-yellow-50 border-yellow-200">
      <WifiOff className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800">Mode hors ligne</AlertTitle>
      <AlertDescription className="text-yellow-700">
        <p className="text-sm">
          Vous êtes actuellement hors ligne. Vous pouvez consulter vos réservations confirmées,
          mais certaines fonctionnalités nécessitent une connexion internet.
        </p>
      </AlertDescription>
    </Alert>
  );
}
