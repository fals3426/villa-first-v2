import { requireSupport } from '@/lib/middleware/support-guard';
import dynamic from 'next/dynamic';

// Lazy load AuditLogsList - composant admin qui ne doit pas être dans le bundle initial
// Note: ssr: true par défaut car c'est un Server Component
const AuditLogsList = dynamic(
  () => import('@/components/admin/AuditLogsList').then((mod) => ({ default: mod.AuditLogsList })),
  {
    loading: () => (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="h-12 w-12 border-4 border-muted border-t-primary rounded-full animate-spin" />
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Chargement des logs d'audit...</p>
        </div>
      </div>
    ),
  }
);

/**
 * Page de visualisation des logs d'audit (Story 9.4, 9.9)
 */
export default async function AdminAuditLogsPage() {
  await requireSupport();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Logs d'audit</h1>
        <p className="text-muted-foreground mt-2">
          Historique complet de toutes les actions sur la plateforme
        </p>
      </div>

      <AuditLogsList />
    </div>
  );
}
