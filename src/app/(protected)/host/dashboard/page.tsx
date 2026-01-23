import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function HostDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Vérifier que l'utilisateur est bien un hôte
  if (session.user.userType !== 'host') {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Hôte</h1>
          <p className="text-muted-foreground mt-2">
            Bienvenue, {session.user.email}
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Vos informations</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Email:</span> {session.user.email}
            </p>
            <p>
              <span className="font-medium">Type:</span> Hôte / Propriétaire
            </p>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Fonctionnalités à venir</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Créer une annonce</li>
            <li>Gérer mes annonces</li>
            <li>Demandes de réservation</li>
            <li>Vérification et badge</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
