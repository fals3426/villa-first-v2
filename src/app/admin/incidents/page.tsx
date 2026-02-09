import { requireSupport } from '@/lib/middleware/support-guard';
import dynamic from 'next/dynamic';

// Lazy load IncidentsList - composant admin qui ne doit pas être dans le bundle initial
// Note: ssr: true par défaut car c'est un Server Component
const IncidentsList = dynamic(
  () => import('@/components/admin/IncidentsList').then((mod) => ({ default: mod.IncidentsList })),
  {
    loading: () => (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="h-12 w-12 border-4 border-muted border-t-primary rounded-full animate-spin" />
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Chargement des incidents...</p>
        </div>
      </div>
    ),
  }
);

/**
 * Page de gestion des incidents (Story 9.2)
 */
export default async function AdminIncidentsPage() {
  await requireSupport();

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto p-6 space-y-8">
        <div>
          <p className="text-label mb-2">ADMIN</p>
          <h1 className="text-heading-2 mb-2">Gestion des incidents</h1>
          <p className="text-white/90">
            Visualise et gère les incidents de check-in signalés
          </p>
        </div>

        <IncidentsList />
      </div>
    </div>
  );
}
