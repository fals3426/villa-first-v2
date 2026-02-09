import { Suspense } from 'react';
import { SearchBar } from '@/components/features/search/SearchBar';
import { BudgetFilter } from '@/components/features/search/BudgetFilter';
import { VibesFilter } from '@/components/features/search/VibesFilter';
import { ListingList } from '@/components/features/listings/ListingList';
import { ViewToggle } from '@/components/features/search/ViewToggle';
import { MapViewContent } from '@/components/features/search/MapViewContent';
import { ComparisonBadge } from '@/components/features/search/ComparisonBadge';
import { ComparisonProvider } from '@/contexts/ComparisonContext';
import { Card } from '@/components/ui/card';
import { listingService } from '@/server/services/listings/listing.service';

interface ListingsPageProps {
  searchParams: Promise<{
    location?: string;
    minPrice?: string;
    maxPrice?: string;
    vibes?: string;
    page?: string;
    limit?: string;
    view?: string;
  }>;
}

async function ListingsContent({ searchParams }: ListingsPageProps) {
  const params = await searchParams;
  
  const filters = {
    location: params.location,
    minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
    vibes: params.vibes ? params.vibes.split(',').filter(Boolean) : undefined,
    page: params.page ? parseInt(params.page) : 1,
    limit: params.limit ? parseInt(params.limit) : 20,
  };

  try {
    const result = await listingService.searchListings(filters);

    return (
      <ListingList 
        listings={result.listings} 
        total={result.pagination.total}
        activeVibes={filters.vibes || []}
      />
    );
  } catch (error) {
    console.error('Error loading listings:', error);
    return (
      <Card variant="v1-default" className="p-6">
        <h2 className="text-lg font-semibold text-red-400 mb-2">
          Erreur de chargement
        </h2>
        <p className="text-sm text-zinc-400">
          {error instanceof Error 
            ? error.message 
            : 'Une erreur est survenue lors du chargement des annonces. Réessaye.'}
        </p>
        <p className="text-xs text-zinc-500 mt-2">
          Vérifie que la base de données est démarrée (npx prisma dev ls)
        </p>
      </Card>
    );
  }
}

export default async function ListingsPage(props: ListingsPageProps) {
  const params = await props.searchParams;
  const view = params.view || 'list';

  return (
    <ComparisonProvider>
    <div className="min-h-screen bg-black pb-20 md:pb-0">
      <div className="container mx-auto max-w-7xl p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-label mb-2">EXPLORER</p>
            <h1 className="text-heading-2">Villas disponibles</h1>
            <p className="mt-2 text-sm md:text-base text-white/90">
              Filtre par vibe, zone et budget pour trouver une coloc qui matche ton rythme.
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Coche les annonces (✓ en haut à droite) puis clique sur « Comparer » pour les comparer.
            </p>
          </div>
          <Suspense fallback={<div className="h-10 w-32 bg-zinc-900 animate-pulse rounded-lg border border-white/10" />}>
            <ViewToggle />
          </Suspense>
        </div>

        <div className="grid gap-4 md:gap-6 lg:grid-cols-4">
          {/* Filtres - Mobile: plein écran, Desktop: sidebar */}
          <div className="lg:col-span-1 space-y-4 md:space-y-6">
            <Card variant="v1-default" className="p-4 md:p-6">
              <Suspense fallback={<div className="h-10 bg-zinc-800 animate-pulse rounded-lg" />}>
                <SearchBar />
              </Suspense>
            </Card>
            <Card variant="v1-default" className="p-4 md:p-6">
              <Suspense fallback={<div className="h-32 bg-zinc-800 animate-pulse rounded-lg" />}>
                <BudgetFilter min={0} max={5000} defaultMin={0} defaultMax={5000} />
              </Suspense>
            </Card>
            <Card variant="v1-default" className="p-4 md:p-6">
              <Suspense fallback={<div className="h-40 bg-zinc-800 animate-pulse rounded-lg" />}>
                <VibesFilter />
              </Suspense>
            </Card>
          </div>

          {/* Résultats - Mobile: plein largeur, Desktop: 3 colonnes */}
          <div className="lg:col-span-3">
            {view === 'map' ? (
              <Suspense fallback={<div className="h-[400px] md:h-[600px] bg-zinc-900 animate-pulse rounded-lg border border-white/10" />}>
                <MapViewContent />
              </Suspense>
            ) : (
              <Suspense fallback={<ListingList listings={[]} isLoading={true} />}>
                <ListingsContent {...props} />
              </Suspense>
            )}
          </div>
        </div>
      </div>

      {/* Badge de comparaison */}
      <ComparisonBadge />
    </div>
    </ComparisonProvider>
  );
}
