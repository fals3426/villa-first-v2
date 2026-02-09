'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, memo, useCallback } from 'react';
import { VerifiedBadge } from '@/components/features/verification/VerifiedBadge';
import { VibeTag, type VibeType } from '@/components/features/vibes/VibeTag';
import { MapPin, Users, Euro } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useComparison } from '@/hooks/useComparison';
import { cn } from '@/lib/utils';
import type { Listing } from '@/types/listing.types';

interface ListingCardProps {
  listing: Listing & {
    host?: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      profilePictureUrl: string | null;
    };
    photos?: Array<{ url: string; category: string }>;
    verificationRequests?: Array<{ status: string }>;
  };
  activeVibes?: VibeType[];
}

// Fonction helper pour extraire les vibes d'une annonce depuis rules et charter
function extractVibesFromListing(listing: ListingCardProps['listing']): VibeType[] {
  const vibes: VibeType[] = [];
  const rulesStr = listing.rules ? JSON.stringify(listing.rules).toLowerCase() : '';
  const charterStr = (listing.charter || '').toLowerCase();
  const combinedText = `${rulesStr} ${charterStr}`;

  if (combinedText.includes('calme') || combinedText.includes('tranquille') || combinedText.includes('zen')) {
    vibes.push('calm');
  }
  if (combinedText.includes('social') || combinedText.includes('festif') || combinedText.includes('fête')) {
    vibes.push('social');
  }
  if (combinedText.includes('spiritualité') || combinedText.includes('méditation') || combinedText.includes('yoga')) {
    vibes.push('spiritual');
  }
  if (combinedText.includes('télétravail') || combinedText.includes('remote') || combinedText.includes('work')) {
    vibes.push('remote');
  }

  return vibes;
}

function ListingCardComponent({ listing, activeVibes = [] }: ListingCardProps) {
  const mainPhoto = listing.photos?.[0]?.url;
  const latestVerification = listing.verificationRequests?.[0];
  const isVerified = latestVerification?.status === 'approved';
  const { toggleListing, isSelected, canAddMore } = useComparison();
  const selected = isSelected(listing.id);
  
  // Mapper le statut pour VerifiedBadge
  let verificationStatus: 'verified' | 'pending' | 'suspended' | 'not_verified' = 'not_verified';
  if (latestVerification) {
    switch (latestVerification.status) {
      case 'approved':
        verificationStatus = 'verified';
        break;
      case 'pending':
      case 'in_review':
        verificationStatus = 'pending';
        break;
      case 'suspended':
      case 'revoked':
        verificationStatus = 'suspended';
        break;
      default:
        verificationStatus = 'not_verified';
    }
  }

  // Extraire les vibes de l'annonce
  const listingVibes = extractVibesFromListing(listing);

  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selected && !canAddMore) {
      return; // Ne pas ajouter si limite atteinte
    }
    toggleListing(listing.id);
  };

  return (
    <div className="group relative">
      <Link href={`/listings/${listing.id}`} className="block">
        <div
          className={cn(
            'overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/60 transition-all hover:shadow-lg hover:-translate-y-1',
            selected && 'ring-2 ring-white/30'
          )}
        >
          {/* Image */}
          <div className="relative aspect-video w-full overflow-hidden bg-zinc-800">
            {mainPhoto ? (
              <Image
                src={mainPhoto}
                alt={listing.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-zinc-800 text-zinc-400">
                <span className="text-sm">Aucune photo</span>
              </div>
            )}
            
            {/* Badge vérifié - EN HAUT À GAUCHE (priorité visuelle) */}
            {verificationStatus !== 'not_verified' && (
              <div className="absolute left-2 top-2 z-10">
                <VerifiedBadge status={verificationStatus} variant="compact" />
              </div>
            )}
            
            {/* Checkbox pour comparaison - EN HAUT À DROITE */}
            <div
              className={cn(
                'absolute right-2 top-2 z-10 rounded bg-black/80 p-2 md:p-1 backdrop-blur-sm border border-white/10 touch-target-min flex items-center justify-center cursor-pointer',
                selected && 'bg-white/20'
              )}
              onClick={handleCheckboxChange}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCheckboxChange(e as any);
                }
              }}
              aria-label={`${selected ? 'Désélectionner' : 'Sélectionner'} ${listing.title} pour comparaison`}
            >
              <Checkbox
                checked={selected}
                disabled={!selected && !canAddMore}
                onCheckedChange={() => toggleListing(listing.id)}
                className="h-5 w-5 md:h-5 md:w-5 pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </div>

        {/* Contenu - Hiérarchie : Badge → Vibes → Prix → Localisation */}
        <div className="p-3 md:p-4 space-y-2">
          {/* Titre */}
          <h3 className="font-semibold line-clamp-2 text-base md:text-lg text-white group-hover:text-white/90 transition-colors">
            {listing.title}
          </h3>

          {/* Vibes - PRIORITAIRE après titre (matching immédiat) */}
          {listingVibes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 py-1">
              {listingVibes.map((vibe) => {
                const isActive = activeVibes.includes(vibe);
                return (
                  <VibeTag
                    key={vibe}
                    vibe={vibe}
                    variant="compact"
                    selected={isActive}
                    className={isActive ? 'ring-2 ring-primary' : ''}
                  />
                );
              })}
            </div>
          )}

          {/* Prix - ENSUITE (hiérarchie confiance > vibes > prix) */}
          {listing.pricePerPlace && (
            <div className="flex items-center gap-1 font-semibold text-base md:text-lg text-white">
              <Euro className="h-4 w-4 md:h-5 md:w-5" />
              <span>{listing.pricePerPlace.toLocaleString('fr-FR')}€/mois</span>
            </div>
          )}

          {/* Localisation - EN DERNIER */}
          <div className="flex items-center gap-1 text-xs md:text-sm text-zinc-400">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">
              {listing.location || listing.address}
            </span>
          </div>

          {/* Capacité (optionnel, après localisation) */}
          {listing.capacity && (
            <div className="flex items-center gap-1 text-xs md:text-sm text-zinc-400">
              <Users className="h-3 w-3 md:h-4 md:w-4" />
              <span>{listing.capacity} place{listing.capacity > 1 ? 's' : ''}</span>
            </div>
          )}

          {/* Score de complétude (optionnel) */}
          {listing.completenessScore !== undefined && listing.completenessScore > 0 && (
            <div className="text-xs text-zinc-500">
              Complétude : {listing.completenessScore}%
            </div>
          )}
        </div>
      </div>
      </Link>
    </div>
  );
}

// Envelopper avec React.memo pour éviter re-renders inutiles
export const ListingCard = memo(ListingCardComponent);
ListingCard.displayName = 'ListingCard';
