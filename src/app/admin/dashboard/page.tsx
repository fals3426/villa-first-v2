import { requireSupport } from '@/lib/middleware/support-guard';
import { supportService } from '@/server/services/support/support.service';
import dynamic from 'next/dynamic';

// Lazy load DashboardStats - composant admin qui ne doit pas être dans le bundle initial
// Note: ssr: true car nous passons des props depuis le serveur
const DashboardStats = dynamic(
  () => import('@/components/admin/DashboardStats').then((mod) => ({ default: mod.DashboardStats })),
  {
    ssr: true, // Garder SSR car nous passons des props serveur
    loading: () => (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="h-12 w-12 border-4 border-muted border-t-primary rounded-full animate-spin" />
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Chargement des statistiques...</p>
        </div>
      </div>
    ),
  }
);

/**
 * Page dashboard du back-office support (Story 9.1)
 */
export default async function AdminDashboardPage() {
  await requireSupport();

  const stats = await supportService.getDashboardStats();

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto p-6 space-y-8">
        <div>
          <p className="text-label mb-2">ADMIN</p>
          <h1 className="text-heading-2 mb-2">Dashboard Support</h1>
          <p className="text-white/90">
            Vue d'ensemble de la plateforme
          </p>
        </div>

        <DashboardStats stats={stats} />
      </div>
    </div>
  );
}
