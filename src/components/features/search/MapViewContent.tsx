'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { MapListing } from '@/server/services/listings/geolocation.service';
import { Loader2, MapPin } from 'lucide-react';

// Helper pour différer les tâches non critiques après le premier render
function deferNonCriticalTask(callback: () => void) {
  // Utiliser requestIdleCallback si disponible (navigateurs modernes)
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout: 2000 });
  } else {
    // Fallback: délai court pour permettre au premier render de se terminer
    setTimeout(callback, 100);
  }
}

// Lazy load MapView avec dynamic() pour réduire le bundle initial
// ssr: false car Leaflet nécessite le DOM et ne peut pas être rendu côté serveur
const MapView = dynamic(
  () => import('./MapView').then((mod) => ({ default: mod.MapView })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] rounded-lg border flex items-center justify-center bg-muted animate-pulse">
        <div className="flex flex-col items-center gap-3">
          <MapPin className="h-10 w-10 text-muted-foreground animate-pulse" />
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Chargement de la carte...</p>
            <p className="text-xs text-muted-foreground/70">Leaflet se charge</p>
          </div>
        </div>
      </div>
    ),
  }
);

/**
 * Composant client pour charger et afficher les données de la carte (Story 4.4)
 */
export function MapViewContent() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<MapListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>();

  // Différer la géolocalisation après le premier render (non critique pour TTI)
  useEffect(() => {
    deferNonCriticalTask(() => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          () => {
            // L'utilisateur a refusé ou erreur - on continue sans géolocalisation
          },
          {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 60000, // Cache pendant 1 minute
          }
        );
      }
    });
  }, []);

  // Charger les listings pour la carte (différé après premier render pour améliorer TTI)
  useEffect(() => {
    deferNonCriticalTask(() => {
      const loadMapListings = async () => {
        setLoading(true);
        setError(null);

        try {
          // Construire les paramètres de recherche depuis l'URL
          const params = new URLSearchParams();
          const location = searchParams.get('location');
          const minPrice = searchParams.get('minPrice');
          const maxPrice = searchParams.get('maxPrice');
          const vibes = searchParams.get('vibes');

          if (location) params.set('location', location);
          if (minPrice) params.set('minPrice', minPrice);
          if (maxPrice) params.set('maxPrice', maxPrice);
          if (vibes) params.set('vibes', vibes);

          const response = await fetch(`/api/listings/map?${params.toString()}`);
          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'Erreur lors du chargement de la carte');
          }

          setListings(result.data || []);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
          setLoading(false);
        }
      };

      loadMapListings();
    });
  }, [searchParams]);

  if (loading) {
    return (
      <div className="w-full h-[600px] rounded-lg border flex items-center justify-center bg-muted">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[600px] rounded-lg border flex items-center justify-center bg-destructive/10">
        <div className="text-center space-y-2">
          <p className="text-destructive font-medium">Erreur</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="w-full h-[600px] rounded-lg border flex items-center justify-center bg-muted">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground font-medium">Aucune annonce trouvée</p>
          <p className="text-sm text-muted-foreground">
            Aucune annonce avec coordonnées géographiques ne correspond à vos critères.
          </p>
        </div>
      </div>
    );
  }

  return <MapView listings={listings} userLocation={userLocation} />;
}
