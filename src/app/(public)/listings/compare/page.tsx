import { Suspense } from 'react';
import { listingService } from '@/server/services/listings/listing.service';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { ComparisonViewWrapper } from '@/components/features/listings/ComparisonViewWrapper';
import { ComparisonProvider } from '@/contexts/ComparisonContext';
import type { Listing } from '@/types/listing.types';

interface ComparePageProps {
  searchParams: Promise<{
    ids?: string;
  }>;
}

async function ComparisonContent({ searchParams }: ComparePageProps) {
  const params = await searchParams;
  const idsParam = params.ids;

  if (!idsParam) {
    redirect('/listings');
  }

  const ids = idsParam.split(',').map((id) => id.trim()).filter(Boolean);

  if (ids.length < 2) {
    redirect('/listings');
  }

  const listings = await listingService.getListingsByIds(ids);
  const validListings = listings.filter(
    (listing): listing is NonNullable<typeof listing> => listing !== null && listing !== undefined
  );

  if (validListings.length < 2) {
    redirect('/listings');
  }

  return (
    <ComparisonProvider initialIds={ids}>
      <ComparisonViewWrapper listings={validListings} />
    </ComparisonProvider>
  );
}

export default async function ComparePage(props: ComparePageProps) {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto max-w-7xl p-6">
        <div className="mb-8">
          <p className="text-label mb-2">COMPARAISON</p>
          <h1 className="text-heading-2">Comparer les villas</h1>
        </div>
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
          }
        >
          <ComparisonContent {...props} />
        </Suspense>
      </div>
    </div>
  );
}
