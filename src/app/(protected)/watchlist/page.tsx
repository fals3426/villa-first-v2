import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { watchlistService } from '@/server/services/listings/watchlist.service';
import { ListingCard } from '@/components/features/listings/ListingCard';
import { ListingList } from '@/components/features/listings/ListingList';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import Link from 'next/link';

/**
 * Page de favoris/watchlist (Story 6.8)
 */
export default async function WatchlistPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Vérifier que l'utilisateur est un locataire
  if (session.user.userType !== 'tenant') {
    redirect('/dashboard');
  }

  const watchlist = await watchlistService.getUserWatchlist(session.user.id);

  // Transformer les données watchlist en format Listing
  const listings = watchlist.map((watched) => ({
    ...watched.listing,
    photos: watched.listing.photos?.map((photo) => ({
      url: photo.url,
      category: 'main',
    })) || [],
  }));

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto max-w-7xl p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-white" />
            <div>
              <p className="text-label mb-1">FAVORIS</p>
              <h1 className="text-heading-2">Mes favoris</h1>
              <p className="text-white/90 mt-2">
                {listings.length === 0
                  ? 'Tu n\'as pas encore sauvegardé d\'annonces'
                  : `${listings.length} annonce${listings.length > 1 ? 's' : ''} sauvegardée${listings.length > 1 ? 's' : ''}`
                }
              </p>
            </div>
          </div>
        </div>

        {listings.length === 0 ? (
          <Card variant="v1-default" className="p-12 text-center">
            <Heart className="h-16 w-16 mx-auto text-zinc-500 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Aucun favori</h2>
            <p className="text-zinc-400 mb-6">
              Commence à explorer les annonces et sauvegarde celles qui t'intéressent.
            </p>
            <Link href="/listings">
              <Button variant="v1-primary">
                Explorer les annonces
              </Button>
            </Link>
          </Card>
        ) : (
          <ListingList listings={listings} total={listings.length} />
        )}
      </div>
    </div>
  );
}
