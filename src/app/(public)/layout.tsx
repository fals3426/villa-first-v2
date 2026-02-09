import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MainNavigation } from '@/components/navigation/MainNavigation';

/**
 * Layout pour les routes publiques
 * Affiche la navigation principale si l'utilisateur est connecté
 */
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-black">
      {/* Afficher la navigation seulement si l'utilisateur est connecté */}
      {session && <MainNavigation />}
      <main>{children}</main>
    </div>
  );
}
