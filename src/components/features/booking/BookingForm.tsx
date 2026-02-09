'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Calendar as CalendarIcon, CreditCard } from 'lucide-react';
import { format } from 'date-fns/format';
import { fr } from 'date-fns/locale/fr';
import { BookingCalendar } from './BookingCalendar';

// Lazy load PaymentFlow (Stripe) - composant très lourd (~150-200KB)
// Chargé uniquement quand l'utilisateur fait une réservation
const PaymentFlow = dynamic(
  () => import('@/components/features/booking/PaymentFlow').then((mod) => ({ default: mod.PaymentFlow })),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <CreditCard className="h-12 w-12 text-muted-foreground animate-pulse" />
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Chargement du formulaire de paiement...</p>
          <p className="text-xs text-muted-foreground/70">Stripe se charge</p>
        </div>
      </div>
    ),
  }
);

interface BookingFormProps {
  listingId: string;
  listingTitle: string;
  availableSlots?: Array<{
    startDate: string;
    endDate: string;
    isAvailable: boolean;
  }>;
}

/**
 * Formulaire de réservation pour un locataire (Story 5.1)
 */
export function BookingForm({ listingId, listingTitle, availableSlots = [] }: BookingFormProps) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState<string>('');
  const [checkOut, setCheckOut] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  // Calculer la date minimale (aujourd'hui)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = format(today, 'yyyy-MM-dd');

  // Calculer les dates disponibles pour désactiver les dates indisponibles
  const getDisabledDates = () => {
    const disabled: string[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Désactiver les dates passées
    for (let i = 1; i < 365; i++) {
      const pastDate = new Date(today);
      pastDate.setDate(pastDate.getDate() - i);
      disabled.push(format(pastDate, 'yyyy-MM-dd'));
    }

    // Désactiver les dates indisponibles selon les slots
    availableSlots.forEach((slot) => {
      if (!slot.isAvailable) {
        const start = new Date(slot.startDate);
        const end = new Date(slot.endDate);
        const current = new Date(start);
        
        while (current <= end) {
          disabled.push(format(current, 'yyyy-MM-dd'));
          current.setDate(current.getDate() + 1);
        }
      }
    });

    return disabled;
  };

  const disabledDates = getDisabledDates();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validation côté client
      if (!checkIn || !checkOut) {
        throw new Error('Veuillez sélectionner les dates de check-in et check-out');
      }

      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      if (checkInDate >= checkOutDate) {
        throw new Error('La date de check-out doit être postérieure à la date de check-in');
      }

      if (checkInDate < today) {
        throw new Error('La date de check-in ne peut pas être dans le passé');
      }

      // Appel API
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId,
          checkIn: checkInDate.toISOString(),
          checkOut: checkOutDate.toISOString(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la création de la réservation');
      }

      // Stocker l'ID de la réservation et afficher le formulaire de paiement
      setBookingId(result.data.id);
      setShowPayment(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Afficher le flux de paiement après création de la réservation (Story 5.3)
  if (showPayment && bookingId) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CalendarIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold">Réservation créée !</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Votre réservation a été créée. Veuillez maintenant sécuriser votre place avec une préautorisation de 25€.
          </p>
        </div>
        <PaymentFlow
          bookingId={bookingId}
          amount={2500} // 25€ en centimes
          onSuccess={() => {
            setSuccess(true);
            setTimeout(() => {
              router.push('/bookings');
            }, 2000);
          }}
          onCancel={() => {
            // Si l'utilisateur annule, rediriger quand même vers les réservations
            router.push('/bookings');
          }}
        />
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center">
        <div className="mb-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CalendarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2">Réservation sécurisée !</h3>
        <p className="text-muted-foreground mb-4">
          Votre réservation est en attente de validation par l'hôte.
        </p>
        <p className="text-sm text-muted-foreground">Redirection en cours...</p>
      </div>
    );
  }

  const nights = checkIn && checkOut
    ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="animate-fade-in">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">
          Réserver : {listingTitle}
        </h2>
        <p className="text-zinc-400">
          Choisissez vos dates sur le calendrier ou saisissez-les manuellement
        </p>
      </div>

      {/* Calendrier principal */}
      <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <BookingCalendar
          listingId={listingId}
          checkIn={checkIn}
          checkOut={checkOut}
          onDatesChange={(ci, co) => {
            setCheckIn(ci);
            setCheckOut(co);
            setError(null);
          }}
          disabled={isSubmitting}
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 animate-fade-in">
          <p className="text-red-400 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Dates manuelles + résumé compact */}
      <div className="grid gap-6 md:grid-cols-2 animate-fade-in">
        <div className="space-y-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Dates de séjour
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkIn" className="text-zinc-300">Arrivée</Label>
              <Input
                id="checkIn"
                type="date"
                value={checkIn}
                onChange={(e) => {
                  setCheckIn(e.target.value);
                  setError(null);
                  if (checkOut && e.target.value && new Date(e.target.value) >= new Date(checkOut)) {
                    setCheckOut('');
                  }
                }}
                min={minDate}
                required
                disabled={isSubmitting}
                className="bg-white/5 border-white/10 focus:ring-emerald-500/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkOut" className="text-zinc-300">Départ</Label>
              <Input
                id="checkOut"
                type="date"
                value={checkOut}
                onChange={(e) => {
                  setCheckOut(e.target.value);
                  setError(null);
                }}
                min={checkIn || minDate}
                required
                disabled={isSubmitting || !checkIn}
                className="bg-white/5 border-white/10 focus:ring-emerald-500/30"
              />
            </div>
          </div>
        </div>

        {checkIn && checkOut && (
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-transparent p-5 flex flex-col justify-center animate-scale-in">
            <span className="text-4xl font-bold text-white tabular-nums">{nights}</span>
            <span className="text-zinc-400 text-sm mt-1">
              nuit{nights > 1 ? 's' : ''} de séjour
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-4 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="flex-1 md:flex-initial border-white/10 hover:bg-white/5"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !checkIn || !checkOut}
          className="flex-1 md:flex-1 bg-white text-black hover:bg-zinc-200 font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Création en cours...
            </>
          ) : (
            'Réserver'
          )}
        </Button>
      </div>
    </form>
  );
}
