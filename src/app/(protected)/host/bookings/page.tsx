import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

// Lazy load les composants de réservation pour réduire le bundle initial
// Note: ssr: true par défaut car ce sont des Server Components
const HostBookingsList = dynamic(
  () => import('@/components/features/booking/HostBookingsList').then((mod) => ({ default: mod.HostBookingsList })),
  {
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    ),
  }
);

const BookingRequestsList = dynamic(
  () => import('@/components/features/booking/BookingRequestsList').then((mod) => ({ default: mod.BookingRequestsList })),
  {
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    ),
  }
);

/**
 * Page de gestion des réservations pour les hôtes (Story 5.6, 7.1)
 */
export default async function HostBookingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  if (session.user.userType !== 'host') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto max-w-6xl p-6">
        <div className="mb-8">
          <p className="text-label mb-2">RÉSERVATIONS</p>
          <h1 className="text-heading-2 mb-2">Gestion des réservations</h1>
          <p className="text-white/90">
            Gère les demandes de réservation et les réservations confirmées
          </p>
        </div>

        <Tabs defaultValue="requests" className="w-full">
          <TabsList>
            <TabsTrigger value="requests">Demandes de réservation</TabsTrigger>
            <TabsTrigger value="bookings">Réservations confirmées</TabsTrigger>
          </TabsList>
          <TabsContent value="requests">
            <BookingRequestsList />
          </TabsContent>
          <TabsContent value="bookings">
            <HostBookingsList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
