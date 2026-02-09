import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CheckInInstructions } from '@/components/features/checkin/CheckInInstructions';
import { CheckInFormWrapper } from '@/components/features/checkin/CheckInFormWrapper';

interface CheckInPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Page de check-in pour une réservation (Story 8.1, 8.2)
 */
export default async function CheckInPage(props: CheckInPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const { id: bookingId } = await props.params;

  // Récupérer la réservation avec les détails de l'annonce
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          address: true,
          latitude: true,
          longitude: true,
        },
      },
      tenant: {
        select: {
          id: true,
        },
      },
      checkIns: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!booking) {
    redirect('/bookings');
  }

  // Vérifier que l'utilisateur est le locataire
  if (booking.tenantId !== session.user.id) {
    redirect('/bookings');
  }

  // Vérifier que la réservation est confirmée ou acceptée
  if (booking.status !== 'confirmed' && booking.status !== 'accepted') {
    redirect('/bookings');
  }

  // Vérifier qu'un check-in n'a pas déjà été effectué
  if (booking.checkIns.length > 0) {
    redirect(`/bookings`);
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto max-w-2xl p-6">
        <div className="mb-8">
          <p className="text-label mb-2">CHECK-IN</p>
          <h1 className="text-heading-2 mb-2">Check-in</h1>
          <p className="text-white/90">
            {booking.listing.title} - {booking.listing.address}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <CheckInFormWrapper
              bookingId={bookingId}
              listingAddress={booking.listing.address}
              listingLatitude={booking.listing.latitude}
              listingLongitude={booking.listing.longitude}
              onSuccess={() => {
                redirect('/bookings');
              }}
            />
          </div>
          <div>
            <CheckInInstructions bookingId={bookingId} />
          </div>
        </div>
      </div>
    </div>
  );
}
