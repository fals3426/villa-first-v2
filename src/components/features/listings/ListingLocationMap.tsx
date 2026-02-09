'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

interface ListingLocationMapProps {
  latitude: number;
  longitude: number;
  title: string;
  address?: string | null;
  location?: string | null;
}

/**
 * Composant pour centrer la carte sur la position du listing
 */
function MapCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [map, center]);
  return null;
}

export function ListingLocationMap({
  latitude,
  longitude,
  title,
  address,
  location,
}: ListingLocationMapProps) {
  const [mounted, setMounted] = useState(false);

  // Éviter les erreurs SSR avec Leaflet
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[400px] bg-zinc-800 rounded-xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-zinc-500">
          <MapPin className="h-8 w-8 animate-pulse" />
          <p className="text-sm">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  const center: [number, number] = [latitude, longitude];
  const locationLabel = location || address || title;
  
  // Rayon du cercle en mètres (environ 300m pour une zone approximative)
  const circleRadius = 300;

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden border border-white/10">
      <MapContainer
        center={center}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapCenter center={center} />
        <Circle
          center={center}
          radius={circleRadius}
          pathOptions={{
            color: '#6BA2FF',
            fillColor: '#6BA2FF',
            fillOpacity: 0.2,
            weight: 2,
            opacity: 0.6,
          }}
        >
          <Popup>
            <div className="p-2">
              <p className="font-semibold text-sm mb-1">{title}</p>
              {locationLabel && (
                <p className="text-xs text-zinc-600">{locationLabel}</p>
              )}
              <p className="text-xs text-zinc-500 mt-1 italic">
                Zone approximative pour préserver la confidentialité
              </p>
            </div>
          </Popup>
        </Circle>
      </MapContainer>
    </div>
  );
}
