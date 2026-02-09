import { notFound } from 'next/navigation';
import Link from 'next/link';
import { listingService } from '@/server/services/listings/listing.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VerifiedBadge } from '@/components/features/verification/VerifiedBadge';
import { VibeTag, type VibeType } from '@/components/features/vibes/VibeTag';
import { ListingPhotoSwiper } from '@/components/features/listings/ListingPhotoSwiper';
import { ListingLocationMap } from '@/components/features/listings/ListingLocationMap';
import { MapPin, Users, Euro, ArrowLeft, User, FileText, Scale, Calendar, UserCircle } from 'lucide-react';
import Image from 'next/image';

type VibesFromListing = (listing: {
  rules?: Record<string, unknown> | null;
  charter?: string | null;
}) => VibeType[];

const extractVibesFromListing: VibesFromListing = (listing) => {
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
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const listing = await listingService.getListingById(id);

  if (!listing) {
    notFound();
  }

  if (listing.status !== 'published') {
    notFound();
  }

  const latestVerification = listing.verificationRequests?.[0];
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

  const listingVibes = extractVibesFromListing({
    rules: listing.rules as Record<string, unknown> | null,
    charter: listing.charter,
  });
  const photos = listing.photos ?? [];
  const hostName = [listing.host?.firstName, listing.host?.lastName].filter(Boolean).join(' ') || 'Hôte';

  const locationLabel = listing.location || listing.address || '';
  
  // Calculer la disponibilité
  const confirmedBookings = listing.bookings?.filter(
    (b) => b.status === 'confirmed' || b.status === 'accepted'
  ) ?? [];
  const occupiedPlaces = confirmedBookings.length;
  const availablePlaces = Math.max(0, (listing.capacity ?? 0) - occupiedPlaces);

  return (
    <div className="min-h-screen bg-black pb-24 md:pb-0">
      <div className="container mx-auto max-w-4xl p-4 md:p-6 space-y-6">
        {/* Retour */}
        <Link
          href="/listings"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux annonces
        </Link>

        {/* Bloc titre / prix / lieu AU-DESSUS de l’image (visible sans scroll) */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {verificationStatus !== 'not_verified' && (
              <VerifiedBadge status={verificationStatus} variant="compact" />
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {listing.title}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/90">
            {listing.pricePerPlace != null && (
              <span className="flex items-center gap-1.5 font-semibold text-lg text-white">
                <Euro className="h-5 w-5" />
                {listing.pricePerPlace.toLocaleString('fr-FR')} €/mois{' '}
                <span className="text-sm font-normal text-zinc-400">par personne</span>
              </span>
            )}
            {locationLabel ? (
              <span className="flex items-center gap-1.5 text-zinc-400">
                <MapPin className="h-4 w-4" />
                {locationLabel}
              </span>
            ) : null}
            {listing.capacity ? (
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Users className="h-4 w-4" />
                {listing.capacity} place{listing.capacity > 1 ? 's' : ''}
              </span>
            ) : null}
          </div>
          {listingVibes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {listingVibes.map((vibe) => (
                <VibeTag key={vibe} vibe={vibe} variant="standard" />
              ))}
            </div>
          )}
        </div>

        {/* Galerie photos swipeable (carousel) */}
        <ListingPhotoSwiper
          photos={photos.map((p) => ({ id: p.id, url: p.url, category: p.category }))}
          title={listing.title}
          className="w-full"
        />

        {/* Extrait description (visible sans scroll) */}
        {listing.description && (
          <p className="text-white/90 line-clamp-3">
            {listing.description}
          </p>
        )}

        {/* Description */}
        <Card variant="v1-default">
          <CardHeader>
            <CardTitle className="text-white">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/90 whitespace-pre-wrap">
              {listing.description || 'Aucune description.'}
            </p>
          </CardContent>
        </Card>

        {/* Localisation - Carte */}
        {listing.latitude != null && listing.longitude != null ? (
          <Card variant="v1-default">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
                  <MapPin className="h-5 w-5" />
                </span>
                Localisation
              </CardTitle>
            </CardHeader>
            <CardContent>
              {locationLabel && (
                <p className="text-white/90 mb-4">{locationLabel}</p>
              )}
              <ListingLocationMap
                latitude={listing.latitude}
                longitude={listing.longitude}
                title={listing.title}
                address={listing.address}
                location={listing.location}
              />
            </CardContent>
          </Card>
        ) : locationLabel ? (
          <Card variant="v1-default">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
                  <MapPin className="h-5 w-5" />
                </span>
                Localisation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/90">{locationLabel}</p>
              <p className="text-sm text-zinc-500 mt-2">
                La carte n&apos;est pas disponible pour cette annonce.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {/* Disponibilité et colocataires */}
        <Card variant="v1-default">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
                <Calendar className="h-5 w-5" />
              </span>
              Disponibilité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-zinc-400">Capacité totale</p>
                <p className="text-2xl font-bold text-white">{listing.capacity ?? 0}</p>
                <p className="text-xs text-zinc-500">place{listing.capacity !== 1 ? 's' : ''}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-zinc-400">Places disponibles</p>
                <p className="text-2xl font-bold text-primary">{availablePlaces}</p>
                <p className="text-xs text-zinc-500">place{availablePlaces !== 1 ? 's' : ''}</p>
              </div>
              <div className="space-y-1 col-span-2 md:col-span-1">
                <p className="text-sm text-zinc-400">Colocataires inscrits</p>
                <p className="text-2xl font-bold text-white">{occupiedPlaces}</p>
                <p className="text-xs text-zinc-500">personne{occupiedPlaces !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Liste des colocataires */}
            {confirmedBookings.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-white/10">
                <p className="text-sm font-medium text-zinc-400">Colocataires actuels</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {confirmedBookings.map((booking) => {
                    const tenant = booking.tenant;
                    const tenantName = [tenant.firstName, tenant.lastName]
                      .filter(Boolean)
                      .join(' ') || 'Colocataire';
                    return (
                      <Link
                        key={booking.id}
                        href={`/profile/${tenant.id}`}
                        className="flex items-center gap-3 p-3 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors group"
                      >
                        <div className="relative h-12 w-12 shrink-0 rounded-full overflow-hidden bg-zinc-800 border-2 border-white/10">
                          {tenant.profilePictureUrl ? (
                            <Image
                              src={tenant.profilePictureUrl}
                              alt={tenantName}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <UserCircle className="h-6 w-6 text-zinc-500" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-white group-hover:text-primary transition-colors truncate">
                            {tenantName}
                          </p>
                          <p className="text-xs text-zinc-500">
                            Voir le profil
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {confirmedBookings.length === 0 && (
              <p className="text-sm text-zinc-500 italic pt-2">
                Aucun colocataire inscrit pour le moment. Sois le premier !
              </p>
            )}
          </CardContent>
        </Card>

        {/* Règles et charte – Comment on vit ici */}
        {(listing.rules && Object.keys(listing.rules).length > 0) || listing.charter ? (
          <Card variant="v1-default" className="overflow-hidden border-white/10">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-white flex items-center gap-3 text-xl">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
                  <Scale className="h-5 w-5" />
                </span>
                Comment on vit ici
              </CardTitle>
              <p className="text-zinc-400 text-sm mt-1 pl-[3.25rem]">
                La charte et les règles de la coloc pour que tout le monde s&apos;y retrouve.
              </p>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
              {listing.charter && (
                <section className="space-y-3">
                  <div className="flex items-center gap-2 text-white/90 font-medium">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <span>Charte de la coloc</span>
                  </div>
                  <p className="text-white/90 whitespace-pre-wrap text-[15px] leading-relaxed pl-6 border-l-2 border-white/10">
                    {listing.charter}
                  </p>
                </section>
              )}
              {listing.rules && Object.keys(listing.rules).length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center gap-2 text-white/90 font-medium">
                    <Scale className="h-4 w-4 text-primary shrink-0" />
                    <span>Règles de vie</span>
                  </div>
                  <ul className="space-y-3 pl-6 border-l-2 border-white/10">
                    {Object.entries(listing.rules).map(([key, value]) => {
                      const label = key
                        .replace(/([A-Z])/g, ' $1')
                        .trim()
                        .replace(/^\w/, (c) => c.toUpperCase());
                      const displayValue =
                        typeof value === 'string'
                          ? value
                          : Array.isArray(value)
                            ? value.join(', ')
                            : String(value);
                      return (
                        <li key={key} className="text-[15px] leading-relaxed">
                          <span className="font-medium text-zinc-300">{label}</span>
                          <span className="text-white/90"> — {displayValue}</span>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}
            </CardContent>
          </Card>
        ) : null}

        {/* Hôte */}
        {listing.host && (
          <Card variant="v1-default">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                Hôte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/90 font-medium">{hostName}</p>
              <p className="text-sm text-zinc-500 mt-1">
                Tu pourras contacter l&apos;hôte après avoir réservé ou via la messagerie.
              </p>
            </CardContent>
          </Card>
        )}

        {/* CTA réservation (desktop) */}
        <div className="hidden md:flex flex-col sm:flex-row gap-3 pt-4">
          <Link
            href={`/bookings/new/${listing.id}`}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Voir les disponibilités
          </Link>
          <Link
            href="/listings"
            className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3 text-sm font-medium text-white hover:bg-white/5 transition-colors"
          >
            Autres annonces
          </Link>
        </div>
      </div>

      {/* Barre CTA sticky (mobile) – toujours visible sans scroll */}
      <div className="fixed bottom-0 left-0 right-0 z-20 md:hidden border-t border-white/10 bg-black/95 backdrop-blur-sm p-4 pb-4 safe-area-bottom">
        <div className="container mx-auto max-w-4xl flex items-center justify-between gap-4">
          <div className="flex flex-col min-w-0">
            {listing.pricePerPlace != null && (
              <span className="text-lg font-semibold text-white">
                {listing.pricePerPlace.toLocaleString('fr-FR')} €/mois
              </span>
            )}
            <span className="text-xs text-zinc-500 truncate">
              {locationLabel || listing.title}
            </span>
          </div>
          <Link
            href={`/bookings/new/${listing.id}`}
            className="shrink-0 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Réserver
          </Link>
        </div>
      </div>
    </div>
  );
}
