'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { VerifiedBadge } from '@/components/features/verification/VerifiedBadge';
import { Button } from '@/components/ui/button';
import { MapPin, CheckCircle2 } from 'lucide-react';
import type { MapListing } from '@/server/services/listings/geolocation.service';
import Image from 'next/image';

// Fix pour les icônes Leaflet avec Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

// Icône personnalisée pour les annonces vérifiées (vert)
const verifiedIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Icône par défaut pour les annonces non vérifiées (bleu)
const defaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapViewProps {
  listings: MapListing[];
  onListingClick?: (listingId: string) => void;
  userLocation?: { lat: number; lng: number };
}

/**
 * Composant pour centrer la carte sur la position utilisateur
 */
function MapCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [map, center]);
  return null;
}

/**
 * Composant MapView pour afficher les listings sur une carte interactive (Story 4.4)
 */
export function MapView({ listings, onListingClick, userLocation }: MapViewProps) {
  const [mounted, setMounted] = useState(false);

  // Éviter les erreurs SSR avec Leaflet
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[600px] bg-muted animate-pulse rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Chargement de la carte...</p>
      </div>
    );
  }

  // Mémoriser le calcul du centre de la carte (évite recalcul à chaque render)
  const center = useMemo<[number, number]>(() => {
    if (userLocation) {
      return [userLocation.lat, userLocation.lng];
    }
    if (listings.length > 0) {
      const avgLat = listings.reduce((sum, l) => sum + l.latitude, 0) / listings.length;
      const avgLng = listings.reduce((sum, l) => sum + l.longitude, 0) / listings.length;
      return [avgLat, avgLng];
    }
    return [-8.3405, 115.0920]; // Bali par défaut
  }, [userLocation, listings]);

  // Mémoriser callback pour éviter re-création à chaque render
  const handleListingClick = useCallback((listingId: string) => {
    if (onListingClick) {
      onListingClick(listingId);
    } else {
      // Par défaut, rediriger vers la page de détail
      window.location.href = `/listings/${listingId}`;
    }
  }, [onListingClick]);

  return (
    <div className="w-full h-[600px] rounded-lg border overflow-hidden">
      <MapContainer
        center={center}
        zoom={listings.length > 0 ? 12 : 10}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {userLocation && <MapCenter center={[userLocation.lat, userLocation.lng]} />}

        {listings.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.latitude, listing.longitude]}
            icon={listing.isVerified ? verifiedIcon : defaultIcon}
          >
            <Popup>
              <div className="w-64 p-2">
                <div className="space-y-2">
                  {/* Photo principale */}
                  {listing.mainPhotoUrl && (
                    <div className="relative w-full h-32 rounded overflow-hidden">
                      <Image
                        src={listing.mainPhotoUrl}
                        alt={listing.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Titre et badge vérifié */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm flex-1">{listing.title}</h3>
                    {listing.isVerified && (
                      <VerifiedBadge status="verified" variant="compact" showDetails={false} />
                    )}
                  </div>

                  {/* Prix */}
                  {listing.pricePerPlace && (
                    <p className="text-lg font-bold text-primary">
                      {listing.pricePerPlace.toFixed(0)}€/mois
                    </p>
                  )}

                  {/* Localisation */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{listing.location || listing.address}</span>
                  </div>

                  {/* Bouton pour voir les détails */}
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleListingClick(listing.id)}
                  >
                    Voir les détails
                  </Button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
