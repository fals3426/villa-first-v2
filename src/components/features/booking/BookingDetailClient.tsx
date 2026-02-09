'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  CreditCard,
  Camera,
} from 'lucide-react';
import { format } from 'date-fns';
import { ChatButton } from '@/components/features/chat/ChatButton';
import { Loader2 } from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  status: string;
  expiresAt: string | null;
}

interface BookingDetailClientProps {
  booking: {
    id: string;
    listingId: string;
    status: string;
    checkIn: string;
    checkOut: string;
    priceAtBooking: number | null;
    currentListingPrice: number | null;
    listing: { id: string; title: string };
    payments?: Payment[];
  };
  activePayment?: Payment | null;
}

export function BookingDetailClient({
  booking,
  activePayment,
}: BookingDetailClientProps) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);

  const getStatusBadge = () => {
    switch (booking.status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/40">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
      case 'confirmed':
        return (
          <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Confirmée
          </Badge>
        );
      case 'price_changed':
        return (
          <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/40">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Prix modifié
          </Badge>
        );
      case 'cancelled':
      case 'expired':
        return (
          <Badge variant="outline" className="bg-zinc-500/20 text-zinc-400 border-zinc-500/40">
            <X className="h-3 w-3 mr-1" />
            {booking.status === 'cancelled' ? 'Annulée' : 'Expirée'}
          </Badge>
        );
      default:
        return <Badge variant="outline">{booking.status}</Badge>;
    }
  };

  const handleCancel = async () => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return;

    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/cancel`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur');
      }
      router.push('/bookings');
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de l\'annulation');
    } finally {
      setCancelling(false);
    }
  };

  const formatPrice = (cents: number | null) =>
    cents != null ? `${(cents / 100).toFixed(2)} €` : 'N/A';

  const canCancel = ['pending', 'price_changed'].includes(booking.status);

  return (
    <div className="space-y-6">
      {/* Statut */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-500">Statut</span>
        {getStatusBadge()}
      </div>

      {/* Paiement / Préautorisation */}
      {activePayment && (
        <Alert
          className={
            activePayment.status === 'captured'
              ? 'border-emerald-500/30 bg-emerald-500/10'
              : 'border-blue-500/30 bg-blue-500/10'
          }
        >
          {activePayment.status === 'captured' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : (
            <CreditCard className="h-4 w-4 text-blue-400" />
          )}
          <AlertTitle className="text-white">
            {activePayment.status === 'captured' ? 'Paiement confirmé' : 'Préautorisation active'}
          </AlertTitle>
          <AlertDescription>
            <p className="text-zinc-300">
              {formatPrice(activePayment.amount)} —{' '}
              {activePayment.status === 'captured'
                ? 'Capturé après validation par l\'hôte'
                : 'En attente de validation'}
            </p>
            {activePayment.expiresAt && activePayment.status === 'pending' && (
              <p className="text-xs text-zinc-500 mt-1">
                Expire le {format(new Date(activePayment.expiresAt), 'd MMM yyyy')}
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Prix modifié */}
      {booking.status === 'price_changed' && (
        <Alert className="border-orange-500/30 bg-orange-500/10">
          <AlertTriangle className="h-4 w-4 text-orange-400" />
          <AlertTitle className="text-white">Prix modifié</AlertTitle>
          <AlertDescription>
            <p className="text-zinc-300">
              Ancien : {formatPrice(booking.priceAtBooking)} — Nouveau :{' '}
              {formatPrice(booking.currentListingPrice)}
            </p>
            <Link href={`/bookings/new/${booking.listingId}`}>
              <Button size="sm" className="mt-2">
                Confirmer avec le nouveau prix
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {booking.status === 'confirmed' && (
          <Link href={`/bookings/${booking.id}/checkin`}>
            <Button className="gap-2">
              <Camera className="h-4 w-4" />
              Check-in
            </Button>
          </Link>
        )}

        {/* Chat : disponible pour réservations en attente ou confirmées */}
        {['pending', 'confirmed', 'price_changed'].includes(booking.status) && (
          <ChatButton bookingId={booking.id} label="Contacter l'hôte" />
        )}

        {canCancel && (
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={cancelling}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            {cancelling ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Annulation...
              </>
            ) : (
              <>
                <X className="h-4 w-4 mr-2" />
                Annuler la réservation
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
