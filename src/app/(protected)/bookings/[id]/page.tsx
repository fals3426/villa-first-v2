import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, Euro, Users } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { prisma } from '@/lib/prisma';
import { BookingDetailClient } from '@/components/features/booking/BookingDetailClient';

interface BookingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  if (session.user.userType !== 'tenant') {
    redirect('/dashboard');
  }

  const { id: bookingId } = await params;

  const bookingRaw = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          description: true,
          address: true,
          location: true,
          capacity: true,
          pricePerPlace: true,
          photos: {
            orderBy: { position: 'asc' },
            select: { url: true, category: true },
          },
        },
      },
      payments: {
        select: {
          id: true,
          amount: true,
          status: true,
          expiresAt: true,
        },
        orderBy: { createdAt: 'desc' as const },
      },
      checkIns: {
        select: { id: true, photoUrl: true, createdAt: true },
        orderBy: { createdAt: 'desc' as const },
      },
    },
  });

  if (!bookingRaw || bookingRaw.tenantId !== session.user.id) {
    redirect('/bookings');
  }

  const overlappingCount = await prisma.booking.count({
    where: {
      listingId: bookingRaw.listingId,
      status: 'confirmed',
      id: { not: bookingId },
      checkIn: { lt: bookingRaw.checkOut },
      checkOut: { gt: bookingRaw.checkIn },
    },
  });

  const booking = {
    ...bookingRaw,
    checkIn: bookingRaw.checkIn.toISOString(),
    checkOut: bookingRaw.checkOut.toISOString(),
    createdAt: bookingRaw.createdAt.toISOString(),
    updatedAt: bookingRaw.updatedAt.toISOString(),
    colocationCount: overlappingCount + 1,
    payments: bookingRaw.payments.map((p) => ({
      ...p,
      expiresAt: p.expiresAt?.toISOString() ?? null,
    })),
  };

  const mainPhoto = booking.listing.photos?.[0]?.url || '/placeholder-listing.jpg';
  const nights = Math.ceil(
    (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)
  );
  const activePayment = booking.payments?.find(
    (p: { status: string }) => p.status === 'pending' || p.status === 'captured'
  );

  return (
    <div className="min-h-screen bg-black pb-20 md:pb-0">
      <div className="container mx-auto max-w-2xl p-4 md:p-6">
        <Link
          href="/bookings"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux réservations
        </Link>

        <div className="mb-6">
          <p className="text-xs font-semibold text-emerald-400/90 uppercase tracking-widest mb-1">
            Réservation
          </p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {booking.listing.title}
          </h1>
        </div>

        {/* Photo */}
        <div className="rounded-xl overflow-hidden bg-zinc-900 mb-6 aspect-video">
          <img
            src={mainPhoto}
            alt={booking.listing.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Infos principales */}
        <div className="space-y-4 mb-8">
          <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-white/5">
              <Users className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Colocation</p>
              <p className="font-medium text-white">
                {booking.colocationCount ?? 1} / {booking.listing.capacity ?? '-'} places
              </p>
              <p className="text-sm text-zinc-400">
                Capacité totale : {booking.listing.capacity ?? '-'} colocataires
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-white/5">
              <Calendar className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Dates</p>
              <p className="font-medium text-white">
                {format(new Date(booking.checkIn), 'd MMMM yyyy', { locale: fr })} —{' '}
                {format(new Date(booking.checkOut), 'd MMMM yyyy', { locale: fr })}
              </p>
              <p className="text-sm text-zinc-400">{nights} nuit{nights > 1 ? 's' : ''}</p>
            </div>
          </div>

          {booking.listing.address && (
            <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-white/5">
                <MapPin className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Adresse</p>
                <p className="font-medium text-white">{booking.listing.address}</p>
                {booking.listing.location && (
                  <p className="text-sm text-zinc-400">{booking.listing.location}</p>
                )}
              </div>
            </div>
          )}

          {booking.priceAtBooking != null && (
            <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-white/5">
                <Euro className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Prix</p>
                <p className="font-medium text-white">
                  {(booking.priceAtBooking / 100).toFixed(2)} € / place
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Client component pour statut, paiement, actions */}
        <BookingDetailClient
          booking={booking}
          activePayment={activePayment}
        />
      </div>
    </div>
  );
}
