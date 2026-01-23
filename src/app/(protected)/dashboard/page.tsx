import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { onboardingService } from '@/server/services/user/onboarding.service';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Rediriger selon userType
  if (session.user.userType === 'host') {
    redirect('/host/dashboard');
  }

  // Vérifier onboarding pour les locataires
  if (session.user.userType === 'tenant') {
    const onboarding = await onboardingService.getOnboardingStatus(
      session.user.id
    );
    if (!onboarding.completed) {
      redirect('/onboarding');
    }
  }

  // Dashboard tenant par défaut
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Locataire</h1>
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
              <span className="font-medium">Type:</span> Locataire
            </p>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Fonctionnalités à venir</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Recherche de colocations</li>
            <li>Mes réservations</li>
            <li>Mes favoris</li>
            <li>Profil et préférences</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
