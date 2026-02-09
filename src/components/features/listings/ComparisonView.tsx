'use client';

import Link from 'next/link';
import Image from 'next/image';
import { VerifiedBadge } from '@/components/features/verification/VerifiedBadge';
import { VibeTag, type VibeType } from '@/components/features/vibes/VibeTag';
import { MapPin, Users, Euro, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useComparison } from '@/hooks/useComparison';
import type { Listing } from '@/types/listing.types';

interface ComparisonViewProps {
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

// Fonction helper pour extraire les vibes d'une annonce
function extractVibesFromListing(listing: ComparisonViewProps['listings'][0]): VibeType[] {
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

/**
 * Composant pour afficher la vue de comparaison côte à côte (Story 4.6)
 */
export function ComparisonView({ listings }: ComparisonViewProps) {
  const { removeFromListing } = useComparison();

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Aucune annonce à comparer</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Comparaison de {listings.length} annonces</h2>
        <Button variant="outline" onClick={() => window.history.back()}>
          Retour
        </Button>
      </div>

      {/* Vue de comparaison - scroll horizontal sur mobile */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 min-w-max md:min-w-0">
          {listings.map((listing) => {
            const mainPhoto = listing.photos?.[0]?.url;
            const latestVerification = listing.verificationRequests?.[0];
            const listingVibes = extractVibesFromListing(listing);

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

            return (
              <div
                key={listing.id}
                className="flex flex-col rounded-lg border bg-card overflow-hidden min-w-[280px] max-w-[320px]"
              >
                {/* Bouton pour retirer de la comparaison */}
                <div className="flex justify-end p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromListing(listing.id)}
                    className="h-6 w-6 p-0"
                    aria-label={`Retirer ${listing.title} de la comparaison`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Photo */}
                <Link href={`/listings/${listing.id}`} className="block">
                  <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    {mainPhoto ? (
                      <Image
                        src={mainPhoto}
                        alt={listing.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 280px, 320px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
                        <span className="text-xs">Aucune photo</span>
                      </div>
                    )}
                    {/* Badge vérifié */}
                    {verificationStatus !== 'not_verified' && (
                      <div className="absolute right-2 top-2">
                        <VerifiedBadge status={verificationStatus} variant="compact" showDetails={false} />
                      </div>
                    )}
                  </div>
                </Link>

                {/* Contenu */}
                <div className="p-4 space-y-3 flex-1">
                  {/* Titre */}
                  <Link href={`/listings/${listing.id}`}>
                    <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
                      {listing.title}
                    </h3>
                  </Link>

                  {/* Prix */}
                  {listing.pricePerPlace && (
                    <div className="flex items-center gap-1 text-lg font-bold text-primary">
                      <Euro className="h-4 w-4" />
                      <span>{listing.pricePerPlace.toLocaleString('fr-FR')}€/mois</span>
                    </div>
                  )}

                  {/* Localisation */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="line-clamp-1">{listing.location || listing.address}</span>
                  </div>

                  {/* Capacité */}
                  {listing.capacity && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{listing.capacity} place{listing.capacity > 1 ? 's' : ''}</span>
                    </div>
                  )}

                  {/* Vibes */}
                  {listingVibes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {listingVibes.map((vibe) => (
                        <VibeTag key={vibe} vibe={vibe} variant="compact" />
                      ))}
                    </div>
                  )}

                  {/* Score de complétude */}
                  {listing.completenessScore !== null && listing.completenessScore !== undefined && listing.completenessScore > 0 && (
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Complétude : {listing.completenessScore}%
                    </div>
                  )}

                  {/* Bouton pour voir les détails */}
                  <Link href={`/listings/${listing.id}`} className="block">
                    <Button variant="outline" size="sm" className="w-full">
                      Voir les détails
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
