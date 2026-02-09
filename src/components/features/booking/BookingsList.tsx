'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, X, CheckCircle2, Clock, Euro, MessageSquare, Camera } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns/format';
import { useOffline } from '@/hooks/useOffline';
import { OfflineIndicator } from '@/components/ui/offline-indicator';
import { ChatButton } from '@/components/features/chat/ChatButton';

interface Payment {
  id: string;
  amount: number;
  status: string;
  expiresAt: string | null;
  stripePaymentIntentId: string;
}

interface Booking {
  id: string;
  listingId: string;
  checkIn: string;
  checkOut: string;
  status: string;
  priceAtBooking: number | null;
  currentListingPrice: number | null;
  payments?: Payment[]; // Préautorisations (Story 5.4)
  listing: {
    id: string;
    title: string;
    location: string | null;
    capacity?: number;
    pricePerPlace: number;
    photos: Array<{ url: string }>;
  };
}

/**
 * Composant pour afficher la liste des réservations (Story 5.2)
 */
export function BookingsList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const isOffline = useOffline();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/bookings');
      if (!response.ok) throw new Error('Erreur lors du chargement');
      const data = await response.json();
      setBookings(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return;
    }

    try {
      setCancellingId(bookingId);
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de l\'annulation');
      }

      // Recharger la liste
      await loadBookings();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de l\'annulation');
    } finally {
      setCancellingId(null);
    }
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return `${(price / 100).toFixed(2)} €`;
  };

  const getStatusBadge = (status: string): React.ReactElement => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
      case 'confirmed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Confirmée
          </Badge>
        );
      case 'price_changed':
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Prix modifié
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            <X className="h-3 w-3 mr-1" />
            Annulée
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Expirée
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Vous n'avez aucune réservation.</p>
        <Link href="/listings">
          <Button className="mt-4">Parcourir les annonces</Button>
        </Link>
      </div>
    );
  }

  // Séparer les réservations par statut (Story 5.9)
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const priceChangedBookings = bookings.filter((b) => b.status === 'price_changed');
  const otherBookings = bookings.filter(
    (b) => b.status !== 'price_changed' && b.status !== 'confirmed'
  );

  return (
    <div className="space-y-6">
      {/* Indicateur mode hors ligne (Story 5.10) */}
      <OfflineIndicator />

      {/* Réservations confirmées (Story 5.9) */}
      {confirmedBookings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Réservations confirmées
          </h2>
          {confirmedBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancel}
              cancelling={cancellingId === booking.id}
              formatPrice={formatPrice}
              getStatusBadge={getStatusBadge}
            />
          ))}
        </div>
      )}

      {/* Réservations avec prix modifié */}
      {priceChangedBookings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Réservations avec prix modifié
          </h2>
          {priceChangedBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancel}
              cancelling={cancellingId === booking.id}
              formatPrice={formatPrice}
              getStatusBadge={getStatusBadge}
            />
          ))}
        </div>
      )}

      {/* Autres réservations */}
      {otherBookings.length > 0 && (
        <div className="space-y-4">
          {(priceChangedBookings.length > 0 || confirmedBookings.length > 0) && (
            <h2 className="text-xl font-semibold">Autres réservations</h2>
          )}
          {otherBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancel}
              cancelling={cancellingId === booking.id}
              formatPrice={formatPrice}
              getStatusBadge={getStatusBadge}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface BookingCardProps {
  booking: Booking;
  onCancel: (id: string) => void;
  cancelling: boolean;
  formatPrice: (price: number | null) => string;
  getStatusBadge: (status: string) => React.ReactElement;
}

function BookingCard({
  booking,
  onCancel,
  cancelling,
  formatPrice,
  getStatusBadge,
}: BookingCardProps) {
  const mainPhoto = booking.listing.photos[0]?.url || '/placeholder-listing.jpg';
  const isPriceChanged = booking.status === 'price_changed';
  const priceDifference =
    booking.priceAtBooking !== null && booking.currentListingPrice !== null
      ? booking.currentListingPrice - booking.priceAtBooking
      : null;

  // Trouver la préautorisation active (Story 5.4)
  const activePayment = booking.payments?.find(
    (p) => p.status === 'pending' || p.status === 'captured'
  );
  const isPendingPayment = activePayment?.status === 'pending';

  return (
    <Link
      href={`/bookings/${booking.id}`}
      className="group block border rounded-lg p-4 hover:shadow-md hover:border-white/20 transition-all cursor-pointer"
    >
      <div className="flex gap-4">
        {/* Photo */}
        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={mainPhoto}
            alt={booking.listing.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate group-hover:text-white transition-colors">
                {booking.listing.title}
              </h3>
              {booking.listing.location && (
                <p className="text-sm text-muted-foreground">{booking.listing.location}</p>
              )}
              {booking.listing.capacity != null && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {booking.listing.capacity} place{booking.listing.capacity > 1 ? 's' : ''}
                </p>
              )}

              {/* Dates */}
              <div className="mt-2 text-sm">
                <p>
                  <span className="font-medium">Arrivée :</span>{' '}
                  {format(new Date(booking.checkIn), 'd MMMM yyyy')}
                </p>
                <p>
                  <span className="font-medium">Départ :</span>{' '}
                  {format(new Date(booking.checkOut), 'd MMMM yyyy')}
                </p>
              </div>

              {/* Prix modifié - Alerte spéciale */}
              {isPriceChanged && (
                <Alert className="mt-3 bg-orange-50 border-orange-200">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertTitle className="text-orange-800">Prix modifié</AlertTitle>
                  <AlertDescription className="text-orange-700">
                    <div className="mt-2 space-y-1">
                      <p>
                        <span className="font-medium">Ancien prix :</span>{' '}
                        {formatPrice(booking.priceAtBooking)}
                      </p>
                      <p>
                        <span className="font-medium">Nouveau prix :</span>{' '}
                        {formatPrice(booking.currentListingPrice)}
                      </p>
                      {priceDifference !== null && (
                        <p className="text-sm">
                          {priceDifference > 0 ? (
                            <span className="text-red-600">
                              +{formatPrice(priceDifference)} (augmentation)
                            </span>
                          ) : (
                            <span className="text-green-600">
                              {formatPrice(priceDifference)} (réduction)
                            </span>
                          )}
                        </p>
                      )}
                      <p className="text-sm mt-2">
                        Vous devez confirmer la nouvelle réservation avec le nouveau prix.
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Prix normal */}
              {!isPriceChanged && booking.priceAtBooking !== null && (
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <Euro className="h-4 w-4" />
                  <span className="font-medium">{formatPrice(booking.priceAtBooking)}</span>
                  <span className="text-muted-foreground">/ place</span>
                </div>
              )}

              {/* Statut de préautorisation (Story 5.4) */}
              {isPendingPayment && (
                <Alert className="mt-3 bg-blue-50 border-blue-200">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">En attente de validation</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    <div className="mt-2 space-y-1">
                      <p className="text-sm">
                        Une préautorisation de <strong>{formatPrice(activePayment?.amount || 0)}</strong> a été effectuée sur votre carte.
                      </p>
                      <p className="text-sm">
                        Le paiement sera capturé uniquement après validation par le propriétaire.
                        Aucun débit n'a été effectué pour le moment.
                      </p>
                      {activePayment?.expiresAt && (
                        <p className="text-xs mt-2 text-muted-foreground">
                          Expire le : {format(new Date(activePayment.expiresAt), 'd MMMM yyyy à HH:mm')}
                        </p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Préautorisation capturée (Story 5.9) */}
              {activePayment && activePayment.status === 'captured' && (
                <Alert className="mt-3 bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Paiement confirmé</AlertTitle>
                  <AlertDescription className="text-green-700">
                    <div className="mt-2 space-y-1">
                      <p className="text-sm">
                        Votre paiement de <strong>{formatPrice(activePayment.amount)}</strong> a été capturé.
                        Votre réservation est confirmée.
                      </p>
                      {booking.status === 'confirmed' && (
                        <div className="mt-3 pt-3 border-t border-green-200">
                          <p className="text-sm font-medium text-green-800 mb-2">
                            Informations de check-in :
                          </p>
                          <p className="text-sm text-green-700">
                            Arrivée : {format(new Date(booking.checkIn), 'd MMMM yyyy')}
                          </p>
                          <p className="text-sm text-green-700">
                            Départ : {format(new Date(booking.checkOut), 'd MMMM yyyy')}
                          </p>
                          <p className="text-sm text-green-700 mt-2">
                            Adresse : {booking.listing.location || booking.listing.title}
                          </p>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Statut et actions */}
            <div className="flex flex-col items-end gap-2">
              {getStatusBadge(booking.status)}

              <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                {['pending', 'confirmed', 'price_changed'].includes(booking.status) && (
                  <ChatButton bookingId={booking.id} label="Contacter l'hôte" />
                )}
                {isPriceChanged && (
                  <Link href={`/bookings/new/${booking.listingId}`} onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="default">
                      Confirmer avec nouveau prix
                    </Button>
                  </Link>
                )}
                {(booking.status === 'pending' || booking.status === 'price_changed') && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onCancel(booking.id);
                    }}
                    disabled={cancelling}
                  >
                    {cancelling ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Annulation...
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3 mr-1" />
                        Annuler
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
