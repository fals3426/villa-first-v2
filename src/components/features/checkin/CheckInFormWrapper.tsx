'use client';

import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';

// Lazy load CheckInForm - composant lourd avec upload photo et géolocalisation
const CheckInForm = dynamic(
  () => import('./CheckInForm').then((mod) => ({ default: mod.CheckInForm })),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <MapPin className="h-12 w-12 text-muted-foreground animate-pulse" />
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Chargement du formulaire de check-in...</p>
          <p className="text-xs text-muted-foreground/70">Préparation de la géolocalisation</p>
        </div>
      </div>
    ),
  }
);

interface CheckInFormWrapperProps {
  bookingId: string;
  listingAddress: string;
  listingLatitude: number | null;
  listingLongitude: number | null;
  onSuccess: () => void;
}

export function CheckInFormWrapper(props: CheckInFormWrapperProps) {
  return <CheckInForm {...props} />;
}
