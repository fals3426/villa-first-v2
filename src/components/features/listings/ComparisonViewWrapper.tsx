'use client';

import dynamic from 'next/dynamic';
import { GitCompare } from 'lucide-react';
import type { Listing } from '@/types/listing.types';

// Lazy load ComparisonView pour réduire le bundle initial
const ComparisonView = dynamic(
  () => import('./ComparisonView').then((mod) => ({ default: mod.ComparisonView })),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <GitCompare className="h-12 w-12 text-muted-foreground animate-pulse" />
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Chargement de la comparaison...</p>
          <p className="text-xs text-muted-foreground/70">Préparation des données</p>
        </div>
      </div>
    ),
  }
);

interface ComparisonViewWrapperProps {
  listings: Array<{
    id: string;
    title: string;
    description: string;
    address: string;
    location: string | null;
    capacity: number;
    listingType: string;
    status: string;
    pricePerPlace: number | null;
    rules: unknown;
    charter: string | null;
    completenessScore: number | null;
    videoUrl: string | null;
    host?: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      profilePictureUrl: string | null;
    };
    photos?: Array<{ url: string; category: string }>;
    verificationRequests?: Array<{ status: string }>;
  }>;
}

export function ComparisonViewWrapper({ listings }: ComparisonViewWrapperProps) {
  return <ComparisonView listings={listings} />;
}
