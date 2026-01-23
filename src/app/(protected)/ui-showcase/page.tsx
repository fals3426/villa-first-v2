'use client';

import { VerifiedBadge } from '@/components/features/verification/VerifiedBadge';
import { VibeTag } from '@/components/features/vibes/VibeTag';

/**
 * Page de démonstration des composants UX
 * À utiliser pour tester et valider les composants avant intégration
 */
export default function UIShowcasePage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">Composants UX - Showcase</h1>
          <p className="text-muted-foreground">
            Démonstration des composants custom selon spécifications UX
          </p>
        </div>

        {/* Badge Vérifié */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Badge Vérifié</h2>
          <p className="text-muted-foreground">
            Composant critique pour différenciation visuelle des annonces vérifiées
          </p>

          <div className="space-y-4 rounded-lg border p-6">
            <div className="space-y-2">
              <h3 className="font-medium">Variants</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <VerifiedBadge status="verified" variant="compact" />
                <VerifiedBadge status="verified" variant="detailed" />
                <VerifiedBadge status="partially_verified" variant="compact" />
                <VerifiedBadge status="not_verified" variant="compact" />
                <VerifiedBadge status="pending" variant="compact" />
                <VerifiedBadge status="suspended" variant="compact" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Avec détails (modal)</h3>
              <VerifiedBadge
                status="verified"
                variant="detailed"
                details={{
                  idVerified: true,
                  titleVerified: true,
                  mandateVerified: true,
                  calendarSynced: true,
                }}
              />
            </div>
          </div>
        </section>

        {/* Système de Vibes */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Système de Vibes</h2>
          <p className="text-muted-foreground">
            Tags visuels pour matching immédiat des préférences
          </p>

          <div className="space-y-4 rounded-lg border p-6">
            <div className="space-y-2">
              <h3 className="font-medium">Variants</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <VibeTag vibe="calm" variant="compact" />
                <VibeTag vibe="social" variant="standard" />
                <VibeTag vibe="spiritual" variant="standard" />
                <VibeTag vibe="remote" variant="large" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">États sélectionnés</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <VibeTag vibe="calm" variant="standard" selected />
                <VibeTag vibe="social" variant="standard" selected />
                <VibeTag vibe="spiritual" variant="standard" selected />
                <VibeTag vibe="remote" variant="standard" selected />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Interactifs (cliquables)</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <VibeTag
                  vibe="calm"
                  variant="standard"
                  onClick={() => alert('Calme cliqué')}
                />
                <VibeTag
                  vibe="social"
                  variant="standard"
                  selected
                  onClick={() => alert('Social cliqué')}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Design Tokens - Couleurs */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Design Tokens - Couleurs</h2>
          <p className="text-muted-foreground">
            Palette de couleurs selon spécifications UX
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-3">Couleur Confiance</h3>
              <div className="space-y-2">
                <div
                  className="h-12 rounded-md flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: '#57bd92' }}
                >
                  Trust #57bd92
                </div>
                <div
                  className="h-12 rounded-md flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: '#4aa87c' }}
                >
                  Trust Light #4aa87c
                </div>
                <div
                  className="h-12 rounded-md flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: '#3d9167' }}
                >
                  Trust Dark #3d9167
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-3">Couleurs Vibes</h3>
              <div className="space-y-2">
                <div
                  className="h-12 rounded-md flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: '#6BA2FF' }}
                >
                  Calme #6BA2FF
                </div>
                <div
                  className="h-12 rounded-md flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: '#FF886B' }}
                >
                  Social #FF886B
                </div>
                <div
                  className="h-12 rounded-md flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: '#B68CFF' }}
                >
                  Spiritualité #B68CFF
                </div>
                <div
                  className="h-12 rounded-md flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: '#4FD4C8' }}
                >
                  Télétravail #4FD4C8
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
