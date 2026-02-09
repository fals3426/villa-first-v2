import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { onboardingService } from '@/server/services/user/onboarding.service';
import { VIBES_CATEGORIES, type VibesCategory, type VibesPreferences } from '@/types/vibes.types';

export default async function DashboardPage() {
  const startTime = Date.now();
  const session = await getServerSession(authOptions);
  const sessionTime = Date.now() - startTime;

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Lire le userType depuis la BDD (le JWT peut être obsolète)
  let userType = session.user.userType;
  const userId = session.user.id;
  if (userId) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { userType: true },
      });
      if (dbUser?.userType) userType = dbUser.userType;
    } catch {
      // En cas d'erreur, garder le userType de la session
    }
  }

  // Rediriger selon userType
  if (userType === 'host') {
    redirect('/host/dashboard');
  }
  if (userType === 'support') {
    redirect('/admin/dashboard');
  }

  let vibesPreferences: VibesPreferences | null = null;

  // Vérifier onboarding pour les locataires : lire depuis la BDD pour avoir la valeur à jour
  // (le JWT n'est pas mis à jour après complétion de l'onboarding)
  if (userType === 'tenant') {
    const status = await onboardingService.getOnboardingStatus(session.user.id);
    if (!status.completed) {
      redirect('/onboarding');
    }
    vibesPreferences = status.vibesPreferences ?? null;
  }

  const totalTime = Date.now() - startTime;
  
  // Log performance en développement uniquement
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Dashboard] Session: ${sessionTime}ms, Total: ${totalTime}ms`);
  }

  // Dashboard tenant par défaut
  return (
    <div className="min-h-screen bg-black pb-20 md:pb-0">
      <div className="container mx-auto p-4 md:p-6">
        <div className="space-y-6 md:space-y-8">
          <div>
            <p className="text-label mb-2">TABLEAU DE BORD</p>
            <h1 className="text-heading-2 mb-2">Dashboard</h1>
            <p className="text-sm md:text-base text-white/90">
              Bienvenue, {session.user.email}
            </p>
          </div>

          {/* Actions rapides */}
          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/listings">
              <Card variant="v1-default" interactive className="h-full">
                <CardHeader>
                  <CardTitle className="text-white">Rechercher une coloc</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-400">
                    Explore les colocations disponibles à Bali
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link href="/bookings">
              <Card variant="v1-default" interactive className="h-full">
                <CardHeader>
                  <CardTitle className="text-white">Mes réservations</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-400">
                    Gère tes réservations et suis leur statut
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link href="/profile">
              <Card variant="v1-default" interactive className="h-full">
                <CardHeader>
                  <CardTitle className="text-white">Mon profil</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-400">
                    Modifie tes informations et préférences
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Informations utilisateur */}
          <Card variant="v1-default">
            <CardHeader>
              <CardTitle className="text-white">Tes informations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-3">
                  <p className="text-white/90">
                    <span className="font-medium text-white">Email:</span> {session.user.email}
                  </p>
                  <p className="text-white/90">
                    <span className="font-medium text-white">Type:</span> Locataire
                  </p>
                </div>

                {/* Préférences vibes (onboarding) */}
                {vibesPreferences && (
                  <div className="pt-3 border-t border-white/10">
                    <p className="font-medium text-white mb-3">Tes préférences (profil)</p>
                    <div className="space-y-3">
                      {(Object.keys(VIBES_CATEGORIES) as VibesCategory[]).map((category) => {
                        const selected = vibesPreferences?.[category];
                        if (!selected?.length) return null;
                        const config = VIBES_CATEGORIES[category];
                        const labels = selected
                          .map((v) => config.options.find((o) => o.value === v)?.label ?? v)
                          .filter(Boolean);
                        return (
                          <div key={category} className="text-white/90">
                            <span className="font-medium text-white/90">{config.label}:</span>{' '}
                            {labels.join(', ')}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-zinc-500 text-sm mt-2">
                      Tu peux modifier ces préférences sur ta{' '}
                      <Link href="/profile" className="text-primary underline">
                        page profil
                      </Link>
                      .
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
