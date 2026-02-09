import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calendarService } from '@/server/services/listings/calendar.service';
import { BookingForm } from '@/components/features/booking/BookingForm';
import { Loader2 } from 'lucide-react';

interface BookingPageProps {
  params: Promise<{
    listingId: string;
  }>;
}

async function BookingContent({ params }: BookingPageProps) {
  const { listingId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Charger l'annonce
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      title: true,
      status: true,
      hostId: true,
    },
  });

  if (!listing) {
    redirect('/listings');
  }

  if (listing.status !== 'published') {
    redirect('/listings');
  }

  // Vérifier que l'utilisateur n'est pas le propriétaire
  if (listing.hostId === session.user.id) {
    redirect(`/listings/${listingId}`);
  }

  // Charger les créneaux de disponibilité pour les 3 prochains mois
  const now = new Date();
  const slots = [];
  
  for (let i = 0; i < 3; i++) {
    const month = now.getMonth() + 1 + i;
    const year = now.getFullYear();
    const monthSlots = await calendarService.getCalendarForListing(listingId, month, year);
    slots.push(...monthSlots);
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto max-w-2xl p-6 md:p-8">
        <div className="mb-8 animate-fade-in">
          <p className="text-xs font-semibold text-emerald-400/90 uppercase tracking-widest mb-1">
            Réservation
          </p>
          <p className="text-zinc-400 text-sm">
            {listing.title}
          </p>
        </div>
        <BookingForm
          listingId={listingId}
          listingTitle={listing.title}
          availableSlots={slots.map((slot) => ({
            startDate: slot.startDate.toISOString(),
            endDate: slot.endDate.toISOString(),
            isAvailable: slot.isAvailable,
          }))}
        />
      </div>
    </div>
  );
}

export default async function BookingPage(props: BookingPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        </div>
      }
    >
      <BookingContent {...props} />
    </Suspense>
  );
}
