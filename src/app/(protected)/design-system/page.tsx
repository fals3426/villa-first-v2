import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';

/**
 * Page de démonstration du Design System Premium
 */
export default function DesignSystemPage() {
  return (
    <div className="container mx-auto max-w-7xl p-6 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold">
          Design System <span className="text-gradient-primary">Premium</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          Tous les composants et styles disponibles
        </p>
      </div>

      {/* Buttons */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Buttons</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-3">Variants</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="default">Default</Button>
              <Button variant="gradient">Gradient</Button>
              <Button variant="gradient-ocean">Gradient Ocean</Button>
              <Button variant="gradient-sunset">Gradient Sunset</Button>
              <Button variant="glow">Glow</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Tailles</h3>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Avec Icônes</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="gradient" size="lg">
                Explorer les annonces
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg">
                Comment ça marche ?
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Cards</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>Card standard avec bordure</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Contenu de la card standard
              </p>
            </CardContent>
          </Card>

          <Card variant="elevated" interactive>
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
              <CardDescription>Card avec shadow et hover lift</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Survolez pour voir l'effet
              </p>
            </CardContent>
          </Card>

          <Card variant="gradient" interactive>
            <CardHeader>
              <CardTitle>Gradient Card</CardTitle>
              <CardDescription>Card avec gradient primary subtil</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Background gradient organique
              </p>
            </CardContent>
          </Card>

          <Card variant="gradient-ocean" interactive>
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-ocean to-primary flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Gradient Ocean</CardTitle>
              <CardDescription>Card avec gradient océan</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Parfait pour les features
              </p>
            </CardContent>
          </Card>

          <Card variant="gradient-sunset" interactive>
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-sunset to-primary flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Gradient Sunset</CardTitle>
              <CardDescription>Card avec gradient coucher de soleil</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Style chaleureux et accueillant
              </p>
            </CardContent>
          </Card>

          <Card variant="glow" interactive>
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent-ocean flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Glow Card</CardTitle>
              <CardDescription>Card avec shadow glow primary</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Effet lumineux premium
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Gradients */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Gradients</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl p-8 bg-gradient-primary text-white">
            <h3 className="text-2xl font-bold mb-2">Gradient Primary</h3>
            <p>Vert confiance avec effet premium</p>
          </div>

          <div className="rounded-2xl p-8 bg-gradient-ocean text-white">
            <h3 className="text-2xl font-bold mb-2">Gradient Ocean</h3>
            <p>Cyan océan vers vert</p>
          </div>

          <div className="rounded-2xl p-8 bg-gradient-sunset text-white">
            <h3 className="text-2xl font-bold mb-2">Gradient Sunset</h3>
            <p>Corail vers jaune sable</p>
          </div>

          <div className="rounded-2xl p-8 bg-gradient-vibes text-white">
            <h3 className="text-2xl font-bold mb-2">Gradient Vibes</h3>
            <p>Multi-vibes (bleu → cyan → corail)</p>
          </div>
        </div>
      </section>

      {/* Gradient Text */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Gradient Text</h2>
        
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-extrabold text-gradient-primary">
            Trouve une villa qui correspond à tes vibes
          </h1>
          <h2 className="text-4xl font-bold text-gradient-vibes">
            Matching par vibes
          </h2>
          <h3 className="text-3xl font-bold text-gradient-sunset">
            Vérification garantie
          </h3>
        </div>
      </section>

      {/* Backgrounds Organiques */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Backgrounds Organiques</h2>
        
        <div className="space-y-4">
          <div className="rounded-2xl p-12 bg-organic-primary">
            <h3 className="text-2xl font-bold mb-2">Organic Primary</h3>
            <p className="text-muted-foreground">
              Gradient radial subtil pour sections hero
            </p>
          </div>

          <div className="rounded-2xl p-12 bg-organic-warm">
            <h3 className="text-2xl font-bold mb-2">Organic Warm</h3>
            <p className="text-muted-foreground">
              Gradient radial chaleureux pour sections features
            </p>
          </div>
        </div>
      </section>

      {/* Animations */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Animations</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Fade In</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Animation fade-in</p>
            </CardContent>
          </Card>

          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle>Slide Up</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Animation slide-up</p>
            </CardContent>
          </Card>

          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle>Scale In</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Animation scale-in</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
