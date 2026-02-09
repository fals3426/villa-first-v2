# Guide de Migration Design V1 → V2 - Document Consolidé

**Date :** 2026-01-28  
**Version :** 2.0  
**Statut :** ✅ Prêt pour implémentation

---

## 📚 Références

Ce document consolide et adapte les analyses existantes :

- **Guide de migration original :** `_bmad-output/design-copywriting-migration-guide.md`
- **Analyse de migration :** `_bmad-output/implementation-artifacts/analyse-migration-design.md`
- **Nouvelle direction design :** `_bmad-output/planning-artifacts/nouvelle-direction-design-copywriting.md`

**Objectif :** Migrer le design épuré noir/blanc de la V1 vers la V2 tout en conservant l'architecture solide de la V2.

---

## 🎯 Principe Directeur

**"Design épuré V1 + Architecture robuste V2"**

- ✅ **Conserver** : L'esthétique épurée et moderne de la V1 (noir/blanc avec accents subtils)
- ✅ **Conserver** : L'architecture robuste et les composants Radix UI de la V2
- ✅ **Adapter** : Les styles pour Tailwind v4 (`@theme inline`)
- ✅ **Préserver** : L'accessibilité des composants Radix UI

---

## 🔍 Analyse de l'État Actuel

### Conflits Identifiés (d'après `analyse-migration-design.md`)

| Aspect | V1 (Cible) | V2 (Actuel) | Solution |
|--------|------------|-------------|----------|
| **Thème** | Noir fixe | Light/Dark (oklch) | Créer thème dark par défaut |
| **Couleurs** | Noir/blanc/zinc | Gradients organiques | Remplacer par palette V1 |
| **Boutons** | Blanc sur noir | Gradients premium | Créer variants V1 |
| **Cartes** | Fond zinc-900 | Fond avec gradients | Adapter variants Card |
| **Tailwind** | Config classique | v4 avec `@theme inline` | Adapter pour v4 |

### Points d'Attention Critiques

1. **Thème Dark/Light** : Créer un thème dark par défaut avec possibilité de basculer
2. **Accessibilité** : Vérifier tous les contrastes sur fond noir
3. **Composants Radix UI** : Créer des variants plutôt que remplacer
4. **Tailwind v4** : Utiliser `@theme inline` dans `globals.css`

---

## 🎨 PARTIE 1 : Design System V1 (Adapté pour Tailwind v4)

### 1.1 Palette de Couleurs Noir/Blanc

**À intégrer dans `globals.css` avec `@theme inline` :**

```css
@theme inline {
  /* Couleurs V1 - Design épuré noir/blanc */
  
  /* Backgrounds */
  --color-bg-primary: #000000;
  --color-bg-secondary: #18181b;      /* zinc-900 */
  --color-bg-tertiary: #09090b;      /* zinc-950 */
  --color-bg-card: rgba(24, 24, 27, 0.6);
  --color-bg-overlay: rgba(0, 0, 0, 0.8);
  
  /* Text */
  --color-text-primary: #ffffff;
  --color-text-secondary: rgba(255, 255, 255, 0.9);
  --color-text-tertiary: rgba(161, 161, 170, 1);  /* zinc-400 */
  --color-text-muted: rgba(113, 113, 122, 1);     /* zinc-500 */
  --color-text-disabled: rgba(255, 255, 255, 0.5);
  
  /* Borders */
  --color-border-primary: rgba(255, 255, 255, 0.1);
  --color-border-secondary: rgba(255, 255, 255, 0.15);
  --color-border-tertiary: rgba(255, 255, 255, 0.2);
  
  /* Accents */
  --color-accent-primary: #ffffff;    /* Bouton blanc */
  --color-accent-hover: #e4e4e7;     /* hover:bg-zinc-200 */
  
  /* Vibes (adaptées pour contraste sur fond noir) */
  --color-vibe-calm: #6BA2FF;
  --color-vibe-social: #FF886B;
  --color-vibe-spiritual: #B68CFF;
  --color-vibe-remote: #4FD4C8;
}
```

**Thème Dark par défaut :**

```css
:root {
  --background: oklch(0.05 0 0);        /* Noir profond */
  --foreground: oklch(1 0 0);          /* Blanc */
  --card: oklch(0.11 0 0);             /* zinc-900 */
  --card-foreground: oklch(1 0 0);
  --primary: oklch(1 0 0);             /* Blanc pour boutons */
  --primary-foreground: oklch(0.05 0 0); /* Noir pour texte bouton */
  --secondary: oklch(0.11 0 0);
  --secondary-foreground: oklch(1 0 0);
  --muted: oklch(0.11 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.11 0 0);
  --accent-foreground: oklch(1 0 0);
  --border: rgba(255, 255, 255, 0.1);
  --input: rgba(255, 255, 255, 0.1);
  --ring: rgba(255, 255, 255, 0.2);
}
```

### 1.2 Classes Utilitaires Typographiques

**À ajouter dans `globals.css` :**

```css
@layer utilities {
  /* Typographie V1 */
  .text-heading-1 {
    @apply text-5xl md:text-6xl font-semibold leading-tight text-white;
  }
  
  .text-heading-2 {
    @apply text-2xl md:text-3xl font-semibold text-white;
  }
  
  .text-body-large {
    @apply text-2xl md:text-3xl font-semibold text-white/90 leading-snug;
  }
  
  .text-label {
    @apply text-sm uppercase tracking-[0.3em] text-zinc-500;
  }
  
  /* Backgrounds V1 */
  .bg-v1-card {
    @apply rounded-2xl bg-zinc-900 border border-white/10;
  }
  
  .bg-v1-overlay {
    @apply bg-white/10 backdrop-blur-md border border-white/20;
  }
  
  /* Boutons V1 */
  .btn-v1-primary {
    @apply bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-zinc-200 transition;
  }
  
  .btn-v1-outline {
    @apply border border-white/40 px-6 py-3 rounded-full font-semibold text-white hover:border-white/60 transition;
  }
  
  .btn-v1-ghost {
    @apply px-6 py-3 rounded-full border border-white/30 text-white/80 hover:text-white transition;
  }
}
```

### 1.3 Variants Composants Radix UI

**Adapter `button.tsx` pour ajouter variants V1 :**

```tsx
// Ajouter dans buttonVariants
variants: {
  variant: {
    // ... variants existants
    "v1-primary": "bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-zinc-200 transition",
    "v1-outline": "border border-white/40 px-6 py-3 rounded-full font-semibold text-white hover:border-white/60 transition",
    "v1-ghost": "px-6 py-3 rounded-full border border-white/30 text-white/80 hover:text-white transition",
  }
}
```

**Adapter `card.tsx` pour ajouter variants V1 :**

```tsx
// Ajouter dans cardVariants
variants: {
  variant: {
    // ... variants existants
    "v1-default": "rounded-2xl bg-zinc-900 border border-white/10",
    "v1-overlay": "rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md",
    "v1-villa": "rounded-3xl border border-white/10 bg-zinc-900/60 overflow-hidden",
  }
}
```

---

## 📝 PARTIE 2 : Copywriting V1

### 2.1 Ton & Vocabulaire

**Ton :** Décontracté mais professionnel, direct et rassurant. Utilisation du "tu".

**Vocabulaire clé :**
- ✅ "Coloc" (pas "colocation")
- ✅ "Vibe" (pas "ambiance")
- ✅ "Matche" / "Match" (pour compatibilité)
- ✅ "Booke" / "Réserver"
- ✅ "Colocs" (pour colocataires)
- ✅ "Villa" (singulier sauf liste)

**À éviter :**
- ❌ "Colocation" (trop formel)
- ❌ "Appartement" (utiliser "villa")
- ❌ "Logement" (trop générique)

### 2.2 Messages Clés par Page

#### Page d'Accueil

```markdown
Hero Section:
Titre: "Trouve ta coloc idéale à Bali"
Sous-titre: "Colocation ou villa entière, selon ton style de vie, ton budget et ton rythme."

CTA Principal: "Commencer maintenant"
CTA Secondaire: "Voir les villas"

Message de Valeur:
"Fini les recherches interminables sur Facebook et les discussions sans fin sur WhatsApp. 
Villa First est la solution sécurisée qui trouve la villa qui te correspond."

Stats:
- "120+ colocs créées avec succès"
- "5 zones principales couvertes à Bali"
- "<72h pour trouver ta villa"
```

#### Page Liste Villas

```markdown
Header:
Label: "Explorer"
Titre: "Villas disponibles"
Description: "Filtre par vibe, zone et budget pour trouver une coloc qui matche ton rythme."

Compteur: "{nombre} villas matchent"

Carte Villa:
Badge Match: "{score}% match" (en haut à gauche)
Zone: Texte small uppercase tracking-wide
Titre: Nom de la villa
Vibe: Badge avec couleur
Places: "{X} place(s) restante(s) - Cap {Y} colocs"
Prix: Format IDR "par personne / mois"
CTA: "Voir la villa"
```

**Référence complète :** Voir `design-copywriting-migration-guide.md` Partie 2 pour tous les messages détaillés.

---

## 🔧 PARTIE 3 : Plan d'Implémentation Adapté

### Phase 1 : Configuration Tailwind v4 (1 jour)

**Étape 1.1 : Adapter `globals.css`**

```css
@theme inline {
  /* Ajouter les couleurs V1 ici */
  /* Voir section 1.1 ci-dessus */
}

:root {
  /* Thème dark par défaut */
  /* Voir section 1.1 ci-dessus */
}

@layer utilities {
  /* Ajouter les classes utilitaires V1 */
  /* Voir section 1.2 ci-dessus */
}
```

**Étape 1.2 : Vérifier les contrastes**

- [ ] Tester avec axe DevTools
- [ ] Vérifier WCAG AA (4.5:1 minimum)
- [ ] Adapter les couleurs vibes si nécessaire

### Phase 2 : Composants de Base (2 jours)

**Étape 2.1 : Adapter Button**

```tsx
// src/components/ui/button.tsx
// Ajouter variants V1 dans buttonVariants
variant: {
  // ... existants
  "v1-primary": "bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-zinc-200 transition",
  "v1-outline": "border border-white/40 px-6 py-3 rounded-full font-semibold text-white hover:border-white/60 transition",
  "v1-ghost": "px-6 py-3 rounded-full border border-white/30 text-white/80 hover:text-white transition",
}
```

**Étape 2.2 : Adapter Card**

```tsx
// src/components/ui/card.tsx
// Ajouter variants V1 dans cardVariants
variant: {
  // ... existants
  "v1-default": "rounded-2xl bg-zinc-900 border border-white/10",
  "v1-overlay": "rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md",
  "v1-villa": "rounded-3xl border border-white/10 bg-zinc-900/60 overflow-hidden",
}
```

**Étape 2.3 : Créer Badge V1**

```tsx
// src/components/ui/badge.tsx (si n'existe pas)
// Créer composant Badge avec style V1
```

### Phase 3 : Migration des Pages (3-5 jours)

**Ordre recommandé :**

1. **Page d'accueil** (`src/app/page.tsx`)
   - Remplacer hero section avec style V1
   - Adapter features avec cards V1
   - Remplacer copywriting

2. **Page liste villas** (`src/app/(public)/listings/page.tsx`)
   - Adapter filtres avec style V1
   - Migrer ListingCard avec style V1
   - Remplacer copywriting

3. **Page détail villa** (si existe)
   - Adapter layout V1
   - Remplacer copywriting

4. **Pages onboarding**
   - Migrer toutes les étapes
   - Adapter formulaires V1
   - Remplacer copywriting

### Phase 4 : Ajustements Finaux (1-2 jours)

- [ ] Vérifier cohérence visuelle
- [ ] Uniformiser espacements
- [ ] Valider contrastes
- [ ] Tests responsive
- [ ] Tests accessibilité

---

## 📋 Checklist de Migration Complète

### Configuration
- [ ] Couleurs V1 ajoutées dans `globals.css` (`@theme inline`)
- [ ] Thème dark par défaut configuré
- [ ] Classes utilitaires créées
- [ ] Contrastes vérifiés (WCAG AA)

### Composants UI
- [ ] Button variants V1 créés
- [ ] Card variants V1 créés
- [ ] Badge V1 créé (si nécessaire)
- [ ] Input V1 adapté
- [ ] Accessibilité préservée

### Pages
- [ ] Page d'accueil migrée
- [ ] Page liste villas migrée
- [ ] Page détail villa migrée (si existe)
- [ ] Pages onboarding migrées
- [ ] Pages propriétaire migrées

### Copywriting
- [ ] Tous les textes remplacés
- [ ] Ton uniformisé ("tu")
- [ ] Vocabulaire cohérent ("coloc", "vibe", "matche")
- [ ] Messages d'erreur adaptés
- [ ] Formatage prix IDR (si applicable)

### Tests
- [ ] Responsive mobile
- [ ] Responsive desktop
- [ ] États interactifs (hover, focus, disabled)
- [ ] Accessibilité (screen reader, clavier)
- [ ] Performance (pas de régression)

---

## ⚠️ Règles de Migration Critiques

### ✅ À FAIRE

1. **Conserver l'architecture V2**
   - Ne pas modifier la logique métier
   - Ne pas modifier la structure de données
   - Ne pas modifier les routes API

2. **Préserver l'accessibilité**
   - Garder tous les attributs ARIA des composants Radix UI
   - Utiliser les variants plutôt que remplacer les composants
   - Tester avec screen readers

3. **Adapter pour Tailwind v4**
   - Utiliser `@theme inline` dans `globals.css`
   - Créer des classes utilitaires avec `@layer utilities`
   - Ne pas créer de `tailwind.config.ts` (v4 n'en a pas besoin)

### ❌ À NE PAS FAIRE

1. **Ne pas supprimer** les composants Radix UI
2. **Ne pas modifier** la logique métier
3. **Ne pas utiliser** les gradients organiques de la V2
4. **Ne pas créer** de `tailwind.config.ts` (utiliser `@theme inline`)

---

## 🎯 Exemples Concrets de Migration

### Exemple 1 : Bouton Primaire

```tsx
// ❌ AVANT (V2 avec gradient)
<Button variant="gradient" size="lg">
  Commencer
</Button>

// ✅ APRÈS (V1 style avec variant)
<Button variant="v1-primary" size="lg">
  Commencer maintenant
</Button>
```

### Exemple 2 : Carte Villa

```tsx
// ❌ AVANT (V2 avec gradient)
<Card variant="gradient-ocean" interactive>
  <CardContent>...</CardContent>
</Card>

// ✅ APRÈS (V1 style avec variant)
<Card variant="v1-villa" interactive>
  <CardContent>...</CardContent>
</Card>
```

### Exemple 3 : Hero Section

```tsx
// ❌ AVANT (V2 avec gradients organiques)
<section className="bg-organic-primary min-h-[90vh]">
  <h1 className="text-gradient-primary">...</h1>
</section>

// ✅ APRÈS (V1 style épuré)
<section className="bg-black min-h-[90vh]">
  <h1 className="text-heading-1">Trouve ta coloc idéale à Bali</h1>
</section>
```

---

## 📊 Mapping Pages V1 → V2

| Page V1 | Page V2 | Statut |
|---------|---------|--------|
| `/` (accueil) | `src/app/page.tsx` | ✅ À migrer |
| `/villas` (liste) | `src/app/(public)/listings/page.tsx` | ✅ À migrer |
| `/villa/[id]` (détail) | `src/app/(public)/listings/[id]/page.tsx` | ⚠️ À vérifier |
| `/onboarding/page1` | `src/app/(protected)/onboarding/page.tsx` | ✅ À migrer |
| `/reservation` | `src/app/(protected)/bookings/new/[listingId]/page.tsx` | ✅ À migrer |

---

## 🚀 Démarrage Rapide

### Commencer par la Page d'Accueil

**Étape 1 : Configurer le thème dark**

```css
// Dans globals.css
:root {
  --background: oklch(0.05 0 0);  /* Noir profond */
  --foreground: oklch(1 0 0);      /* Blanc */
  /* ... voir section 1.1 */
}
```

**Étape 2 : Créer les variants Button V1**

```tsx
// Dans button.tsx
// Ajouter variants "v1-primary", "v1-outline", "v1-ghost"
```

**Étape 3 : Migrer la page d'accueil**

```tsx
// Dans page.tsx
// Remplacer le hero avec style V1
// Utiliser les nouveaux variants
// Remplacer le copywriting
```

**Étape 4 : Tester**

- [ ] Vérifier le rendu visuel
- [ ] Tester les contrastes
- [ ] Valider responsive
- [ ] Tester accessibilité

---

## 📚 Documentation Complémentaire

Pour plus de détails :

- **Palette complète V1 :** `design-copywriting-migration-guide.md` Partie 1.1
- **Copywriting complet :** `design-copywriting-migration-guide.md` Partie 2
- **Analyse détaillée :** `analyse-migration-design.md`
- **Exemples complets :** `design-copywriting-migration-guide.md` Partie 3.4

---

## ✅ Validation Finale

### Critères de Succès

1. **Cohérence Visuelle**
   - ✅ Toutes les pages utilisent la palette V1 (noir/blanc)
   - ✅ Typographie uniforme
   - ✅ Espacements cohérents

2. **Copywriting**
   - ✅ Tous les textes utilisent le vocabulaire V1
   - ✅ Ton uniforme et décontracté ("tu")
   - ✅ Messages clairs et directs

3. **Fonctionnalité**
   - ✅ Toutes les fonctionnalités V2 conservées
   - ✅ Performance maintenue
   - ✅ Accessibilité préservée

---

**Document consolidé créé le :** 2026-01-28  
**Basé sur :** `design-copywriting-migration-guide.md` + `analyse-migration-design.md`  
**Adapté pour :** Tailwind v4 + Composants Radix UI
