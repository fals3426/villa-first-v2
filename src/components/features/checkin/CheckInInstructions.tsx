'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, MapPin, Key, Phone, Mail, FileText, WifiOff } from 'lucide-react';
import { useOffline } from '@/hooks/useOffline';
import { OfflineIndicator } from '@/components/ui/offline-indicator';

interface CheckInInstructionsProps {
  bookingId: string;
}

interface CheckInInstruction {
  id: string;
  address: string;
  accessCodes: Record<string, string> | null;
  hostPhone: string | null;
  hostEmail: string | null;
  instructions: string | null;
}

/**
 * Composant pour afficher les instructions de check-in (Story 8.4)
 */
export function CheckInInstructions({ bookingId }: CheckInInstructionsProps) {
  const [instructions, setInstructions] = useState<CheckInInstruction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isOffline = useOffline();

  useEffect(() => {
    loadInstructions();
  }, [bookingId]);

  const loadInstructions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/bookings/${bookingId}/checkin-instructions`);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      const data = await response.json();
      setInstructions(data.data);
    } catch (err) {
      // En mode hors ligne, essayer d'utiliser le cache
      if (isOffline) {
        // Le service worker devrait servir depuis le cache
        setError('Impossible de charger les instructions. Mode hors ligne.');
      } else {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !instructions) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!instructions) {
    return (
      <Alert>
        <AlertDescription>
          Les instructions de check-in ne sont pas encore disponibles. Contactez l'hôte.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <OfflineIndicator />

      <div className="border rounded-lg p-4 bg-card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Informations de check-in
        </h3>

        <div className="space-y-3">
          {/* Adresse */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Adresse</p>
            <p className="text-sm">{instructions.address}</p>
          </div>

          {/* Codes d'accès */}
          {instructions.accessCodes && Object.keys(instructions.accessCodes).length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Key className="h-4 w-4" />
                Codes d'accès
              </p>
              <div className="mt-1 space-y-1">
                {Object.entries(instructions.accessCodes).map(([key, value]) => (
                  <p key={key} className="text-sm">
                    <span className="font-medium">{key} :</span> {value}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Contact hôte */}
          {(instructions.hostPhone || instructions.hostEmail) && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Contact hôte</p>
              <div className="mt-1 space-y-1">
                {instructions.hostPhone && (
                  <p className="text-sm flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {instructions.hostPhone}
                  </p>
                )}
                {instructions.hostEmail && (
                  <p className="text-sm flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {instructions.hostEmail}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Instructions supplémentaires */}
          {instructions.instructions && (
            <div>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Instructions
              </p>
              <p className="text-sm mt-1 whitespace-pre-wrap">{instructions.instructions}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
