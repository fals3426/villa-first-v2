import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

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
    <div className="min-h-screen bg-black">
      <div className="container mx-auto p-6">
        <div className="space-y-8">
          <div>
            <p className="text-label mb-2">TABLEAU DE BORD</p>
            <h1 className="text-heading-2 mb-2">Dashboard Hôte</h1>
            <p className="text-white/90">
              Bienvenue, {session.user.email}
            </p>
          </div>

          {/* Actions rapides */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/host/listings/new">
              <Card variant="v1-default" interactive className="h-full">
                <CardHeader>
                  <CardTitle className="text-white">Créer une annonce</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-400">
                    Publie ta coloc sur la plateforme
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link href="/host/bookings">
              <Card variant="v1-default" interactive className="h-full">
                <CardHeader>
                  <CardTitle className="text-white">Demandes de réservation</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-400">
                    Gère les demandes de réservation reçues
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
              <div className="space-y-3">
                <p className="text-white/90">
                  <span className="font-medium text-white">Email:</span> {session.user.email}
                </p>
                <p className="text-white/90">
                  <span className="font-medium text-white">Type:</span> Hôte / Propriétaire
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
