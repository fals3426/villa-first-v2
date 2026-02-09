# Design System Premium - Villa First

**Date :** 2026-01-28  
**Version :** 2.0  
**Statut :** ✅ Implémenté

---

## 🎨 Palette de Couleurs

### Couleurs Principales

```css
/* Primary (Confiance) */
--color-trust: #57bd92
--color-trust-light: #7dd3af
--color-trust-dark: #3d9167

/* Accents Tropicaux */
--color-accent-sunset: #FF6B6B (corail chaleureux)
--color-accent-ocean: #4ECDC4 (cyan océan)
--color-accent-sand: #FFE66D (jaune sable)

/* Vibes */
--color-vibe-calm: #6BA2FF (bleu calme)
--color-vibe-social: #FF886B (corail social)
--color-vibe-spiritual: #B68CFF (violet spirituel)
--color-vibe-remote: #4FD4C8 (cyan télétravail)
```

### Gradients Organiques

```css
/* Gradients disponibles */
.bg-gradient-primary    → Vert confiance (primary → primary-light)
.bg-gradient-ocean      → Océan (cyan → vert)
.bg-gradient-sunset     → Coucher de soleil (corail → jaune)
.bg-gradient-warm       → Chaud (jaune → corail)
.bg-gradient-vibes      → Multi-vibes (bleu → cyan → corail)

/* Gradient text (pour titres) */
.text-gradient-primary
.text-gradient-vibes
.text-gradient-sunset
```

---

## 🧩 Composants Premium

### Button Variants

```tsx
// Variants disponibles
<Button variant="default">      // Standard avec hover scale
<Button variant="gradient">      // Gradient primary avec glow
<Button variant="gradient-ocean"> // Gradient océan
<Button variant="gradient-sunset"> // Gradient coucher de soleil
<Button variant="glow">          // Primary avec shadow glow
<Button variant="outline">       // Amélioré avec border-2
<Button variant="ghost">         // Standard

// Tailles
<Button size="sm">      // h-8
<Button size="default"> // h-9
<Button size="lg">      // h-11 (amélioré)
<Button size="xl">      // h-14 (nouveau)
```

**Caractéristiques :**
- ✅ Transitions fluides (300ms)
- ✅ Hover effects : scale, shadow
- ✅ Focus states accessibles

### Card Variants

```tsx
// Variants disponibles
<Card variant="default">         // Standard
<Card variant="elevated">        // Shadow + hover lift
<Card variant="gradient">        // Gradient primary subtil
<Card variant="gradient-ocean">  // Gradient océan
<Card variant="gradient-sunset"> // Gradient coucher de soleil
<Card variant="glow">            // Shadow glow primary

// Interactive
<Card variant="gradient" interactive> // Ajoute hover lift automatique
```

**Caractéristiques :**
- ✅ Hover effects : translateY, shadow
- ✅ Transitions fluides
- ✅ Variants gradient avec bordures animées

---

## 🎭 Classes Utilitaires

### Backgrounds Organiques

```css
.bg-organic-primary  /* Gradient radial subtil primary */
.bg-organic-warm     /* Gradient radial subtil warm */
```

### Shadows Premium

```css
.shadow-glow-primary      /* Glow primary subtil */
.shadow-glow-primary-lg    /* Glow primary large */
```

### Animations

```css
.animate-fade-in      /* Fade in 0.6s */
.animate-slide-up     /* Slide up avec fade */
.animate-scale-in     /* Scale in avec fade */
```

### Hover Effects

```css
.hover-lift           /* TranslateY -4px + shadow au hover */
.hover-glow-primary   /* Glow primary au hover */
```

---

## 📐 Typographie

### Hiérarchie Renforcée

```css
/* Hero H1 */
text-5xl md:text-7xl font-extrabold tracking-tight

/* H2 Sections */
text-4xl md:text-5xl font-bold

/* H3 */
text-2xl font-bold

/* Body */
text-base md:text-lg leading-relaxed
```

### Gradient Text

```tsx
<h1 className="text-gradient-primary">
  Titre avec gradient
</h1>
```

---

## 🎯 Usage Recommandé

### Hero Section

```tsx
<section className="bg-organic-primary min-h-[90vh]">
  <h1 className="text-gradient-primary text-5xl md:text-7xl">
    Titre principal
  </h1>
  <Button variant="gradient" size="lg">
    CTA Principal
  </Button>
</section>
```

### Feature Cards

```tsx
<Card variant="gradient-ocean" interactive>
  <CardHeader>
    <CardTitle>Titre</CardTitle>
  </CardHeader>
  <CardContent>Contenu</CardContent>
</Card>
```

### Listing Cards

```tsx
<Card variant="elevated" interactive className="group">
  {/* Photo avec overlay gradient */}
  {/* Contenu */}
  <Button variant="gradient" className="w-full">
    Voir les détails
  </Button>
</Card>
```

---

## 📋 Checklist d'Implémentation

- [x] Couleurs et gradients ajoutés à globals.css
- [x] Classes utilitaires créées
- [x] Button variants premium implémentés
- [x] Card variants premium implémentés
- [x] Animations CSS créées
- [ ] Documentation composants (Storybook optionnel)
- [ ] Tests visuels sur différents écrans
- [ ] Validation accessibilité (contraste, focus)

---

## 🚀 Prochaines Étapes

1. **Appliquer aux pages existantes**
   - Page d'accueil (hero + features)
   - Liste d'annonces (cards)
   - Pages de détail

2. **Créer composants supplémentaires**
   - Badge premium
   - Input avec style premium
   - Modal avec gradients

3. **Optimiser performances**
   - Lazy load gradients si nécessaire
   - Optimiser animations

---

**Design System prêt à être utilisé !** 🎨✨
