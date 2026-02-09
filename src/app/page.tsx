import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Sparkles, ShieldCheck, Zap, Users, MapPin, Clock, CheckCircle2, Star } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-black">
      {/* Navigation Améliorée */}
      <nav className="border-b border-white/10 bg-black/95 backdrop-blur-md sticky top-0 z-50 safe-area-top">
        <div className="container mx-auto flex h-14 md:h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-white tracking-tight">
              Villa first
            </h1>
            <span className="text-sm text-zinc-300 hidden md:inline">
              Colocations vérifiées à Bali
            </span>
          </div>
          <div className="flex items-center space-x-2 md:space-x-3">
            <Link href="/listings">
              <Button variant="v1-ghost" size="sm" className="hidden sm:flex">
                Explorer
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="v1-ghost" size="sm" className="text-xs md:text-sm">Connexion</Button>
            </Link>
            <Link href="/register">
              <Button variant="v1-primary" size="sm" className="text-xs md:text-sm">Créer un compte</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section Améliorée */}
      <main className="flex-1">
        <section className="relative min-h-[95vh] flex items-center overflow-hidden">
          {/* Gradient de fond subtil */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-950 to-black">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.03),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.02),transparent_50%)]" />
          </div>
          
          <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 relative z-10">
            <div className="max-w-5xl mx-auto">
              {/* Badge de confiance amélioré */}
              <div className="flex justify-center mb-6 md:mb-8 animate-fade-in">
                <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                  <span className="text-xs md:text-sm font-medium text-white">
                    Toutes les annonces vérifiées
                  </span>
                </div>
              </div>
              
              {/* Titre principal - Hiérarchie améliorée */}
              <h1 className="text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-semibold leading-[1.1] text-center mb-6 md:mb-8 animate-slide-up">
                Trouve ta{' '}
                <span className="text-white">coloc idéale</span>
                <br />
                <span className="text-white/80">à Bali</span>
              </h1>
              
              {/* Sous-titre simplifié */}
              <p className="text-lg md:text-xl lg:text-2xl text-center text-white/90 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up px-4">
                La plateforme sécurisée qui matche tes vibes avec des villas vérifiées.
              </p>
              
              {/* CTAs améliorés */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-12 md:mb-20 animate-scale-in px-4">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button 
                    variant="v1-primary" 
                    size="xl"
                    className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-5 md:py-6 shadow-lg shadow-white/10 hover:shadow-white/20 transition-all"
                  >
                    Commencer maintenant
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/listings" className="w-full sm:w-auto">
                  <Button 
                    variant="v1-outline" 
                    size="xl"
                    className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-5 md:py-6"
                  >
                    Explorer les villas
                  </Button>
                </Link>
              </div>
              
              {/* Stats améliorées avec icônes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 max-w-4xl mx-auto animate-fade-in px-4">
                <div className="text-center p-4 md:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 mb-3 md:mb-4">
                    <Users className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">120+</div>
                  <div className="text-xs md:text-sm text-zinc-300">Colocs créées avec succès</div>
                </div>
                <div className="text-center p-4 md:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 mb-3 md:mb-4">
                    <MapPin className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">5</div>
                  <div className="text-xs md:text-sm text-zinc-300">Zones principales à Bali</div>
                </div>
                <div className="text-center p-4 md:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 mb-3 md:mb-4">
                    <Clock className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">&lt;72h</div>
                  <div className="text-xs md:text-sm text-zinc-400">Pour trouver ta villa</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Preview - Exemples de villas */}
        <section className="py-24 bg-zinc-950 border-y border-white/5">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <p className="text-label mb-4">DÉCOUVRIR</p>
              <h2 className="text-heading-2 mb-6">
                Des villas vérifiées qui matchent tes vibes
              </h2>
              <p className="text-lg text-white/90 leading-relaxed">
                Explore des exemples de colocations disponibles sur la plateforme.
              </p>
            </div>
            
            {/* Grid d'exemples de villas */}
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
              {/* Villa exemple 1 */}
              <Card variant="v1-villa" interactive className="group overflow-hidden">
                <div className="relative h-48 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                  <div className="absolute top-3 left-3">
                    <div className="px-2 py-1 rounded bg-white/10 backdrop-blur-sm border border-white/20">
                      <span className="text-xs font-medium text-white">✓ Vérifiée</span>
                    </div>
                  </div>
                  <Sparkles className="h-16 w-16 text-white/20" />
                </div>
                <CardHeader>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs">Calme</span>
                    <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs">Télétravail</span>
                  </div>
                  <CardTitle className="text-white text-lg">Villa Zen Ubud</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-zinc-300">
                    <span>3 places disponibles</span>
                    <span>•</span>
                    <span className="font-semibold text-white">2.5M IDR/mois</span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Villa exemple 2 */}
              <Card variant="v1-villa" interactive className="group overflow-hidden">
                <div className="relative h-48 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                  <div className="absolute top-3 left-3">
                    <div className="px-2 py-1 rounded bg-white/10 backdrop-blur-sm border border-white/20">
                      <span className="text-xs font-medium text-white">✓ Vérifiée</span>
                    </div>
                  </div>
                  <Users className="h-16 w-16 text-white/20" />
                </div>
                <CardHeader>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs">Social</span>
                    <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs">Spiritualité</span>
                  </div>
                  <CardTitle className="text-white text-lg">Villa Canggu Beach</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-zinc-300">
                    <span>5 places disponibles</span>
                    <span>•</span>
                    <span className="font-semibold text-white">3M IDR/mois</span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Villa exemple 3 */}
              <Card variant="v1-villa" interactive className="group overflow-hidden">
                <div className="relative h-48 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                  <div className="absolute top-3 left-3">
                    <div className="px-2 py-1 rounded bg-white/10 backdrop-blur-sm border border-white/20">
                      <span className="text-xs font-medium text-white">✓ Vérifiée</span>
                    </div>
                  </div>
                  <Zap className="h-16 w-16 text-white/20" />
                </div>
                <CardHeader>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs">Télétravail</span>
                    <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs">Calme</span>
                  </div>
                  <CardTitle className="text-white text-lg">Villa Seminyak Workspace</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-zinc-300">
                    <span>2 places disponibles</span>
                    <span>•</span>
                    <span className="font-semibold text-white">4M IDR/mois</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-center">
              <Link href="/listings">
                <Button variant="v1-outline" size="lg">
                  Voir toutes les villas
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section Améliorée */}
        <section id="features" className="py-24 bg-black">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <p className="text-label mb-4">POURQUOI VILLA FIRST</p>
              <h2 className="text-heading-2 mb-6">
                On a pensé à tout pour que tu trouves ta coloc idéale
              </h2>
              <p className="text-lg text-white/90 leading-relaxed">
                Sans stress et en toute confiance.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Feature 1 : Vibes First - Plus grande */}
              <Card variant="v1-default" interactive className="group md:col-span-1">
                <CardHeader>
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="h-10 w-10 text-blue-300" />
                  </div>
                  <CardTitle className="text-white text-xl mb-3">
                    Matching par vibes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-400 leading-relaxed">
                    Parce que vivre ensemble, c'est partager plus qu'un toit. 
                    Filtre par <strong className="text-white">calme</strong>, <strong className="text-white">social</strong>, 
                    <strong className="text-white">spiritualité</strong> ou <strong className="text-white">télétravail</strong> pour trouver 
                    des colocataires alignés avec ton mode de vie.
                  </CardDescription>
                </CardContent>
              </Card>
              
              {/* Feature 2 : Vérification - Centrale */}
              <Card variant="v1-default" interactive className="group md:col-span-1 md:-mt-4">
                <CardHeader>
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <ShieldCheck className="h-10 w-10 text-green-300" />
                  </div>
                  <CardTitle className="text-white text-xl mb-3">
                    Vérification garantie
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-400 leading-relaxed">
                    On vérifie chaque annonce : <strong className="text-white">identité de l'hôte confirmée</strong>, 
                    <strong className="text-white">logement contrôlé</strong>, <strong className="text-white">règles transparentes</strong>. 
                    Tu peux réserver l'esprit tranquille.
                  </CardDescription>
                </CardContent>
              </Card>
              
              {/* Feature 3 : Simplicité */}
              <Card variant="v1-default" interactive className="group md:col-span-1">
                <CardHeader>
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="h-10 w-10 text-yellow-300" />
                  </div>
                  <CardTitle className="text-white text-xl mb-3">
                    Simple et transparent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-400 leading-relaxed">
                    Frais fixes de <strong className="text-white">25€</strong>, paiement sécurisé, chat débloqué après réservation. 
                    Pas de surprises, tout est clair dès le départ.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Section Preuve Sociale */}
        <section className="py-24 bg-zinc-950 border-y border-white/5">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <p className="text-label mb-4">COMMUNAUTÉ</p>
              <h2 className="text-heading-2 mb-6">
                Rejoins 200+ digital nomads à Bali
              </h2>
              <p className="text-lg text-white/90 leading-relaxed">
                Ils ont trouvé leur coloc idéale grâce à Villa First.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
              {/* Témoignage 1 */}
              <Card variant="v1-overlay" className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center">
                    <span className="text-white font-semibold">SM</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold">Sarah M.</div>
                    <div className="text-sm text-zinc-300">Digital Nomad</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-zinc-300 leading-relaxed">
                  "J'ai trouvé ma coloc en 2 jours ! Le matching par vibes fonctionne vraiment. 
                  Je me sens en sécurité avec les annonces vérifiées."
                </p>
              </Card>
              
              {/* Témoignage 2 */}
              <Card variant="v1-overlay" className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center">
                    <span className="text-white font-semibold">MJ</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold">Marc J.</div>
                    <div className="text-sm text-zinc-300">Yoga Teacher</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-zinc-300 leading-relaxed">
                  "Fini le chaos Facebook ! La plateforme est claire, les règles sont transparentes. 
                  Je recommande à 100%."
                </p>
              </Card>
              
              {/* Témoignage 3 */}
              <Card variant="v1-overlay" className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/30 to-red-500/30 flex items-center justify-center">
                    <span className="text-white font-semibold">AL</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold">Alex L.</div>
                    <div className="text-sm text-zinc-300">Developer</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-zinc-300 leading-relaxed">
                  "Le système de vérification me rassure complètement. J'ai réservé en toute confiance 
                  et tout s'est passé parfaitement."
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section Améliorée */}
        <section className="py-20 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 border-y border-white/10">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6">
                Prêt à trouver ta coloc idéale ?
              </h2>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                Rejoins notre communauté de digital nomads et voyageurs à Bali. 
                <span className="block mt-2 text-lg text-zinc-300">
                  Crée ton compte gratuitement et commence à explorer.
                </span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button variant="v1-primary" size="xl" className="text-lg px-10 py-6 shadow-lg shadow-white/10">
                    Créer mon compte gratuit
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/listings">
                  <Button variant="v1-outline" size="xl" className="text-lg px-10 py-6">
                    Explorer sans compte
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer V1 */}
      <footer className="border-t border-white/10 py-8 bg-black">
        <div className="container mx-auto px-4 text-center text-sm text-zinc-300">
          <p>Villa first - Trouve ta coloc idéale à Bali</p>
        </div>
      </footer>
    </div>
  );
}
