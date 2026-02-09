'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Loader2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Euro,
  User,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns/format';
import Link from 'next/link';
import { ChatButton } from '@/components/features/chat/ChatButton';

interface Payment {
  id: string;
  amount: number;
  status: string;
  expiresAt: string | null;
}

interface Booking {
  id: string;
  listingId: string;
  checkIn: string;
  checkOut: string;
  status: string;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    location: string | null;
    capacity: number;
    validationRule: string | null;
    validationThreshold: number | null;
  };
  tenant: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  payments: Payment[];
}

interface GroupedBookings {
  listing: Booking['listing'];
  bookings: Booking[];
}

/**
 * Composant pour afficher et gérer les réservations pour les hôtes (Story 5.6)
 */
export function HostBookingsList() {
  const [groupedBookings, setGroupedBookings] = useState<GroupedBookings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validatingListingId, setValidatingListingId] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/host/bookings');
      if (!response.ok) throw new Error('Erreur lors du chargement');
      const data = await response.json();
      setGroupedBookings(data.grouped || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (listingId: string) => {
    if (
      !confirm(
        'Êtes-vous sûr de vouloir valider cette colocation ? Tous les paiements préautorisés seront capturés immédiatement.'
      )
    ) {
      return;
    }

    try {
      setValidatingListingId(listingId);
      setError(null);

      const response = await fetch(`/api/listings/${listingId}/validate`, {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la validation');
      }

      // Recharger la liste
      await loadBookings();

      // Afficher un message de succès
      alert(
        `Colocation validée avec succès ! ${result.data.bookingsCount} réservation(s) confirmée(s).`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la validation');
    } finally {
      setValidatingListingId(null);
    }
  };

  const formatPrice = (cents: number) => {
    return `${(cents / 100).toFixed(2)} €`;
  };

  const getStatusBadge = (status: string) => {
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

  if (groupedBookings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Vous n'avez aucune réservation pour le moment.</p>
        <Link href="/host/listings">
          <Button className="mt-4">Gérer mes annonces</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groupedBookings.map((group) => {
        const pendingBookings = group.bookings.filter((b) => b.status === 'pending');
        const hasPendingBookings = pendingBookings.length > 0;

        return (
          <div key={group.listing.id} className="rounded-lg border p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">{group.listing.title}</h2>
                {group.listing.location && (
                  <p className="text-sm text-muted-foreground">{group.listing.location}</p>
                )}
                <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Capacité : {group.listing.capacity} places</span>
                  {group.listing.validationRule && (
                    <Badge variant="outline" className="text-xs">
                      {group.listing.validationRule === 'FULL_ONLY'
                        ? 'Villa complète uniquement'
                        : group.listing.validationRule === 'PARTIAL'
                          ? `Validation partielle (${group.listing.validationThreshold}%)`
                          : 'Validation manuelle'}
                    </Badge>
                  )}
                </div>
              </div>
              {hasPendingBookings && (
                <Button
                  onClick={() => handleValidate(group.listing.id)}
                  disabled={validatingListingId === group.listing.id}
                  className="ml-4"
                >
                  {validatingListingId === group.listing.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Validation...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Valider la colocation
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {group.bookings.map((booking) => {
                const activePayment = booking.payments.find(
                  (p) => p.status === 'pending' || p.status === 'captured'
                );

                return (
                  <div
                    key={booking.id}
                    className="rounded-lg border bg-card p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {booking.tenant.firstName} {booking.tenant.lastName}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({booking.tenant.email})
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {format(new Date(booking.checkIn), 'd MMM yyyy')} -{' '}
                              {format(new Date(booking.checkOut), 'd MMM yyyy')}
                            </span>
                          </div>
                          {activePayment && (
                            <div className="flex items-center gap-1">
                              <Euro className="h-4 w-4" />
                              <span>
                                Préautorisation : {formatPrice(activePayment.amount)} (
                                {activePayment.status === 'pending' ? 'En attente' : 'Capturé'})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>{getStatusBadge(booking.status)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
