import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Lazy load BookingsList pour réduire le bundle initial
// Note: ssr: true car c'est un Server Component (par défaut dans Next.js App Router)
const BookingsList = dynamic(
  () => import('@/components/features/booking/BookingsList').then((mod) => ({ default: mod.BookingsList })),
  {
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    ),
  }
);

/**
 * Page "Mes réservations" (Story 5.2)
 * Affiche toutes les réservations de l'utilisateur connecté
 */
export default async function BookingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Vérifier que l'utilisateur est un locataire
  if (session.user.userType !== 'tenant') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-black pb-20 md:pb-0">
      <div className="container mx-auto max-w-4xl p-4 md:p-6">
        <div className="mb-6 md:mb-8">
          <p className="text-label mb-2">RÉSERVATIONS</p>
          <h1 className="text-heading-2 mb-2">Mes réservations</h1>
          <p className="text-sm md:text-base text-white/90">
            Gère tes réservations et suis leur statut
          </p>
        </div>

        <BookingsList />
      </div>
    </div>
  );
}
