import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Villa first</h1>
            <span className="text-sm text-muted-foreground">
              Colocations vérifiées à Bali
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link href="/register">
              <Button>Créer un compte</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
              Trouvez votre colocation vérifiée à Bali
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Marketplace de mise en relation pour colocations vérifiées avec
              badge de confiance. Rejoignez notre communauté de digital nomads
              et voyageurs.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/register">
                <Button size="lg">Commencer</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Se connecter
                </Button>
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="mx-auto mt-24 max-w-5xl">
            <h2 className="mb-12 text-center text-2xl font-semibold">
              Fonctionnalités
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-lg border p-6">
                <h3 className="mb-2 text-lg font-semibold">
                  Vérification systématique
                </h3>
                <p className="text-muted-foreground">
                  Toutes les annonces sont vérifiées manuellement avec badge de
                  confiance.
                </p>
              </div>
              <div className="rounded-lg border p-6">
                <h3 className="mb-2 text-lg font-semibold">
                  Matching par vibes
                </h3>
                <p className="text-muted-foreground">
                  Trouvez des colocations qui correspondent à votre style de
                  vie et vos préférences.
                </p>
              </div>
              <div className="rounded-lg border p-6">
                <h3 className="mb-2 text-lg font-semibold">
                  Paiement sécurisé
                </h3>
                <p className="text-muted-foreground">
                  Frais de mise en relation unique de 25€ avec validation
                  propriétaire.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mx-auto mt-16 max-w-2xl">
            <h2 className="mb-8 text-center text-2xl font-semibold">
              Pages disponibles
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Link href="/register">
                <div className="rounded-lg border p-4 hover:bg-accent">
                  <h3 className="font-semibold">Inscription</h3>
                  <p className="text-sm text-muted-foreground">
                    Créer un compte utilisateur
                  </p>
                </div>
              </Link>
              <Link href="/login">
                <div className="rounded-lg border p-4 hover:bg-accent">
                  <h3 className="font-semibold">Connexion</h3>
                  <p className="text-sm text-muted-foreground">
                    Se connecter à son compte
                  </p>
                </div>
              </Link>
              <Link href="/dashboard">
                <div className="rounded-lg border p-4 hover:bg-accent">
                  <h3 className="font-semibold">Dashboard</h3>
                  <p className="text-sm text-muted-foreground">
                    Tableau de bord locataire (nécessite connexion)
                  </p>
                </div>
              </Link>
              <Link href="/profile">
                <div className="rounded-lg border p-4 hover:bg-accent">
                  <h3 className="font-semibold">Profil</h3>
                  <p className="text-sm text-muted-foreground">
                    Gérer son profil utilisateur (nécessite connexion)
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Villa first v2 - En développement</p>
        </div>
      </footer>
    </div>
  );
}
