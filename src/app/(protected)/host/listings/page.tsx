import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { listingService } from '@/server/services/listings/listing.service';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * Page pour lister les annonces de l'hôte
 */
export default async function HostListingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  if (session.user.userType !== 'host') {
    redirect('/dashboard');
  }

  const listings = await listingService.getListingsByHost(session.user.id);

  return (
    <div className="min-h-screen bg-black pb-20 md:pb-0">
      <div className="container mx-auto max-w-6xl p-4 md:p-6">
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-label mb-2">MES ANNONCES</p>
            <h1 className="text-heading-2 mb-2">Mes annonces</h1>
            <p className="text-sm md:text-base text-white/90">
              Gère tes annonces de coloc
            </p>
          </div>
          <Link href="/host/listings/new" className="w-full sm:w-auto">
            <Button variant="v1-primary" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Créer une annonce
            </Button>
          </Link>
        </div>

        {listings.length === 0 ? (
          <Card variant="v1-default" className="p-8 md:p-12 text-center">
            <p className="text-zinc-400 mb-4">
              Tu n'as pas encore créé d'annonce.
            </p>
            <Link href="/host/listings/new" className="inline-block w-full sm:w-auto">
              <Button variant="v1-primary" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Créer ta première annonce
              </Button>
            </Link>
          </Card>
      ) : (
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <Card key={listing.id} variant="v1-default" interactive>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start justify-between mb-3 md:mb-4 gap-2">
                  <h3 className="text-base md:text-lg font-semibold text-white line-clamp-2 flex-1">
                    {listing.title}
                  </h3>
                  <Badge
                    variant={
                      listing.status === 'published'
                        ? 'default'
                        : listing.status === 'suspended'
                          ? 'destructive'
                          : 'secondary'
                    }
                    className="shrink-0"
                  >
                    {listing.status === 'published'
                      ? 'Publiée'
                      : listing.status === 'suspended'
                        ? 'Suspendue'
                        : 'Brouillon'}
                  </Badge>
                </div>

                <p className="text-sm text-zinc-400 mb-3 md:mb-4 line-clamp-2">
                  {listing.address}
                </p>

                <div className="flex items-center justify-between text-sm mb-3 md:mb-4">
                  <span className="text-zinc-400">
                    {listing.capacity} place{listing.capacity > 1 ? 's' : ''}
                  </span>
                  <span className="font-semibold text-white">
                    {listing.pricePerPlace
                      ? `${(listing.pricePerPlace / 100).toFixed(2)} €/mois`
                      : 'Prix non défini'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Link
                    href={`/host/listings/${listing.id}/edit`}
                    className="flex-1"
                  >
                    <Button variant="v1-outline" size="sm" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                  </Link>
                  {listing.status === 'published' && (
                    <Link href={`/listings/${listing.id}`} className="flex-1">
                      <Button variant="v1-outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Voir
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
