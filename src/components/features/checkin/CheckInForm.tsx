'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Camera, Upload, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { IncidentReportForm } from './IncidentReportForm';

interface CheckInFormProps {
  bookingId: string;
  listingAddress?: string;
  listingLatitude?: number | null;
  listingLongitude?: number | null;
  onSuccess?: () => void;
}

/**
 * Formulaire de check-in avec photo et GPS (Story 8.1, 8.2)
 */
export function CheckInForm({
  bookingId,
  listingAddress,
  listingLatitude,
  listingLongitude,
  onSuccess,
}: CheckInFormProps) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Demander la géolocalisation (Story 8.2)
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lon);
        setGpsError(null);

        // Calculer la distance si on a les coordonnées de l'annonce (Story 8.2)
        if (listingLatitude && listingLongitude) {
          const dist = calculateDistance(lat, lon, listingLatitude, listingLongitude);
          setDistance(dist);
        }
      },
      (err) => {
        setGpsError('Impossible d\'obtenir votre position. Le check-in peut être effectué sans GPS.');
        console.error('Erreur géolocalisation:', err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Calculer la distance (formule de Haversine) (Story 8.2)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Rayon de la Terre en mètres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance en mètres
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Valider le format
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Format de photo invalide. Formats acceptés: JPG, PNG');
      return;
    }

    // Valider la taille (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('La photo est trop volumineuse. Taille maximale: 10MB');
      return;
    }

    setPhoto(file);
    setError(null);

    // Créer une prévisualisation
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!photo) {
      setError('La photo est obligatoire');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('photo', photo);
      if (latitude !== null && longitude !== null) {
        formData.append('latitude', latitude.toString());
        formData.append('longitude', longitude.toString());
      }

      const response = await fetch(`/api/bookings/${bookingId}/checkin`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors du check-in');
      }

      setSuccess(true);
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du check-in');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Check-in effectué avec succès !</AlertTitle>
        <AlertDescription className="text-green-700">
          Votre check-in a été enregistré. L'hôte a été notifié.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Check-in</h2>
        <p className="text-muted-foreground">
          Prenez ou uploadez une photo pour confirmer votre arrivée
        </p>
      </div>

      {/* Photo obligatoire */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Photo *</label>
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          {photoPreview ? (
            <div className="space-y-4">
              <div className="relative w-full h-64 rounded-lg overflow-hidden">
                <Image
                  src={photoPreview}
                  alt="Aperçu"
                  fill
                  className="object-cover"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPhoto(null);
                  setPhotoPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                Changer la photo
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-2">
                <Camera className="h-12 w-12 text-muted-foreground" />
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Prendre/Uploader une photo
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Formats acceptés: JPG, PNG (max 10MB)
                </p>
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Géolocalisation GPS (optionnel) */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Géolocalisation GPS (optionnel)</label>
        {latitude && longitude ? (
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Position capturée</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Latitude: {latitude.toFixed(6)}, Longitude: {longitude.toFixed(6)}
            </p>
            {distance !== null && (
              <div className="mt-2">
                {distance > 500 ? (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800 text-xs">
                      Vous êtes à {Math.round(distance)}m de l'adresse de l'annonce.
                      Vous pouvez quand même confirmer le check-in.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <p className="text-xs text-green-700">
                    ✓ Vous êtes à {Math.round(distance)}m de l'adresse de l'annonce
                  </p>
                )}
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setLatitude(null);
                setLongitude(null);
                setDistance(null);
              }}
              className="mt-2"
            >
              Réinitialiser
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={requestLocation}
            disabled={loading}
          >
            <MapPin className="mr-2 h-4 w-4" />
            Capturer ma position GPS
          </Button>
        )}
        {gpsError && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 text-xs">
              {gpsError}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        <Button type="submit" disabled={!photo || loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            'Confirmer le check-in'
          )}
        </Button>

        {/* Signalement d'incident (Story 8.5) */}
        <div className="text-center">
          <IncidentReportForm bookingId={bookingId} onSuccess={() => {}} />
        </div>
      </div>
    </form>
  );
}
