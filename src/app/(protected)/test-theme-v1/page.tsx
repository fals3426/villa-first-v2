import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Page de test du thème V1 - Design épuré noir/blanc
 */
export default function TestThemeV1Page() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-4xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-heading-1">
            Test Thème V1
          </h1>
          <p className="text-body-large">
            Design épuré noir/blanc
          </p>
          <p className="text-label">
            Vérification du rendu visuel
          </p>
        </div>

        {/* Buttons V1 */}
        <section className="space-y-6">
          <h2 className="text-heading-2">Boutons V1</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-white">Variants V1</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="v1-primary">Bouton Primaire</Button>
                <Button variant="v1-outline">Bouton Outline</Button>
                <Button variant="v1-ghost">Bouton Ghost</Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-white">Tailles</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="v1-primary" size="sm">Small</Button>
                <Button variant="v1-primary" size="default">Default</Button>
                <Button variant="v1-primary" size="lg">Large</Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-white">Comparaison avec variants existants</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Default (V2)</Button>
                <Button variant="outline">Outline (V2)</Button>
                <Button variant="v1-primary">V1 Primary</Button>
                <Button variant="v1-outline">V1 Outline</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Cards V1 */}
        <section className="space-y-6">
          <h2 className="text-heading-2">Cards V1</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card variant="v1-default">
              <CardHeader>
                <CardTitle>Card V1 Default</CardTitle>
                <CardDescription>Style épuré zinc-900 avec bordure</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Fond zinc-900 avec bordure white/10
                </p>
              </CardContent>
            </Card>

            <Card variant="v1-overlay">
              <CardHeader>
                <CardTitle>Card V1 Overlay</CardTitle>
                <CardDescription>Style avec backdrop blur</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Fond white/10 avec backdrop-blur-md
                </p>
              </CardContent>
            </Card>

            <Card variant="v1-villa" interactive>
              <CardHeader>
                <CardTitle>Card V1 Villa</CardTitle>
                <CardDescription>Style pour cartes villa dans liste</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Fond zinc-900/60 avec rounded-3xl
                </p>
              </CardContent>
            </Card>

            <Card variant="default" interactive>
              <CardHeader>
                <CardTitle>Card Default (V2)</CardTitle>
                <CardDescription>Pour comparaison</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Style V2 actuel
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Typographie */}
        <section className="space-y-6">
          <h2 className="text-heading-2">Typographie V1</h2>
          
          <div className="space-y-4">
            <h1 className="text-heading-1">
              Heading 1 - Titre Principal
            </h1>
            <h2 className="text-heading-2">
              Heading 2 - Titre Section
            </h2>
            <p className="text-body-large">
              Body Large - Texte important avec style large
            </p>
            <p className="text-base text-white/90">
              Body - Texte normal avec opacité 90%
            </p>
            <p className="text-sm text-muted-foreground">
              Small - Texte secondaire avec couleur muted
            </p>
            <p className="text-label">
              Label - Texte label avec tracking large
            </p>
          </div>
        </section>

        {/* Backgrounds */}
        <section className="space-y-6">
          <h2 className="text-heading-2">Backgrounds V1</h2>
          
          <div className="space-y-4">
            <div className="bg-v1-card p-6 rounded-2xl">
              <h3 className="text-xl font-semibold mb-2 text-white">bg-v1-card</h3>
              <p className="text-muted-foreground">Card avec style V1</p>
            </div>

            <div className="bg-v1-overlay p-6 rounded-2xl">
              <h3 className="text-xl font-semibold mb-2 text-white">bg-v1-overlay</h3>
              <p className="text-muted-foreground">Overlay avec backdrop blur</p>
            </div>

            <div className="bg-v1-villa p-6 rounded-3xl">
              <h3 className="text-xl font-semibold mb-2 text-white">bg-v1-villa</h3>
              <p className="text-muted-foreground">Style villa avec opacité</p>
            </div>
          </div>
        </section>

        {/* Contraste et Accessibilité */}
        <section className="space-y-6">
          <h2 className="text-heading-2">Test de Contraste</h2>
          
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-white/10 p-4 rounded-lg">
              <p className="text-white">Texte blanc sur zinc-900</p>
              <p className="text-white/90">Texte blanc/90 sur zinc-900</p>
              <p className="text-zinc-400">Texte zinc-400 sur zinc-900</p>
              <p className="text-zinc-500">Texte zinc-500 sur zinc-900</p>
            </div>

            <div className="bg-black border border-white/10 p-4 rounded-lg">
              <p className="text-white">Texte blanc sur noir</p>
              <p className="text-white/90">Texte blanc/90 sur noir</p>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <p className="text-black">Texte noir sur blanc (bouton primaire)</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
