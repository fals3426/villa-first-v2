import { requireSupport } from '@/lib/middleware/support-guard';
import { prisma } from '@/lib/prisma';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';

// Lazy load IncidentDetail - composant admin qui ne doit pas être dans le bundle initial
// Note: ssr: true par défaut car c'est un Server Component
const IncidentDetail = dynamic(
  () => import('@/components/admin/IncidentDetail').then((mod) => ({ default: mod.IncidentDetail })),
  {
    loading: () => (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="h-12 w-12 border-4 border-muted border-t-primary rounded-full animate-spin" />
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Chargement des détails de l'incident...</p>
        </div>
      </div>
    ),
  }
);

/**
 * Page de détail d'un incident (Story 9.2, 9.3)
 */
export default async function AdminIncidentDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  await requireSupport();

  const { id } = await props.params;

  const incident = await prisma.incident.findUnique({
    where: { id },
    include: {
      booking: {
        include: {
          tenant: {
            select: {
              id: true,
              email: true,
              profilePictureUrl: true,
              createdAt: true,
            },
          },
          listing: {
            select: {
              id: true,
              title: true,
              address: true,
              host: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
          checkIns: {
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
  });

  if (!incident) {
    notFound();
  }

  return <IncidentDetail incident={incident} />;
}
