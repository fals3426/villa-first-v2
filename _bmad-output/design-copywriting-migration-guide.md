# Guide de Migration Design & Copywriting - Villa First V1 → V2

**Date de création :** 2026-01-28  
**Dernière mise à jour :** 2026-01-28  
**Version :** 1.1  
**Projet source :** Villa First V1 (c:\Users\Falsone\Desktop\Villa first)  
**Projet cible :** Villa First V2 (c:\Users\Falsone\Desktop\Villa first v2)  
**Objectif :** Migrer le design épuré noir/blanc de la V1 vers la V2 tout en conservant l'architecture solide de la V2

---

## 📚 Documents de Référence

**⚠️ IMPORTANT :** Ce document est la référence originale. Pour une version consolidée et adaptée à Tailwind v4, consultez :

- **📘 Guide consolidé (RECOMMANDÉ) :** `_bmad-output/planning-artifacts/guide-migration-design-v1-v2-consolide.md`
  - Version adaptée pour Tailwind v4 (`@theme inline`)
  - Variants Radix UI plutôt que classes inline
  - Plan d'implémentation détaillé

- **📊 Analyse de migration :** `_bmad-output/implementation-artifacts/analyse-migration-design.md`
  - Évaluation complète du guide original
  - Points d'attention critiques
  - Recommandations d'adaptation

**Utilisez le guide consolidé pour l'implémentation, ce document sert de référence détaillée.**

---

## 🎯 Vue d'ensemble

Ce document sert de référence complète pour les agents IA travaillant sur le projet Villa First V2. Il contient tous les éléments nécessaires pour migrer le design visuel et le copywriting depuis la V1 vers la V2.

**Principe directeur :** Conserver l'esthétique épurée et moderne de la V1 (noir/blanc avec accents subtils) tout en utilisant l'architecture robuste et les composants Radix UI de la V2.

---

## 🎨 PARTIE 1 : DESIGN SYSTEM

### 1.1 Palette de Couleurs

#### Couleurs Principales (V1 → V2)

```css
/* FONDER SUR CES COULEURS - NE PAS UTILISER LES GRADIENTS ORGANIQUES DE LA V2 */

/* Backgrounds */
--bg-primary: #000000          /* bg-black */
--bg-secondary: #18181b        /* bg-zinc-900 */
--bg-tertiary: #09090b         /* bg-zinc-950 */
--bg-card: rgba(24, 24, 27, 0.6) /* bg-zinc-900/60 */
--bg-overlay: rgba(0, 0, 0, 0.8) /* bg-black/80 */

/* Text */
--text-primary: #ffffff         /* text-white */
--text-secondary: rgba(255, 255, 255, 0.9) /* text-white/90 */
--text-tertiary: rgba(161, 161, 170, 1) /* text-zinc-400 */
--text-muted: rgba(113, 113, 122, 1) /* text-zinc-500 */
--text-disabled: rgba(255, 255, 255, 0.5) /* text-white/50 */

/* Borders */
--border-primary: rgba(255, 255, 255, 0.1) /* border-white/10 */
--border-secondary: rgba(255, 255, 255, 0.15) /* border-white/15 */
--border-tertiary: rgba(255, 255, 255, 0.2) /* border-white/20 */
--border-dashed: rgba(255, 255, 255, 0.2) /* border-dashed border-white/20 */

/* Accents (pour les boutons primaires) */
--accent-primary: #ffffff       /* bg-white text-black */
--accent-hover: #e4e4e7        /* hover:bg-zinc-200 */
```

#### Mapping Tailwind V1 → V2

```typescript
// À utiliser dans tailwind.config.ts
const colors = {
  // Backgrounds
  black: '#000000',
  'zinc-900': '#18181b',
  'zinc-950': '#09090b',
  
  // Text
  white: '#ffffff',
  'zinc-400': '#a1a1aa',
  'zinc-500': '#71717a',
  
  // Opacities (utiliser avec /)
  // Exemple: bg-white/10, text-white/90, border-white/15
}
```

### 1.2 Typographie

#### Hiérarchie Typographique (V1)

```css
/* Titres */
h1: text-5xl md:text-6xl font-semibold leading-tight
h2: text-2xl md:text-3xl font-semibold
h3: text-xl font-semibold
h4: text-lg font-semibold

/* Corps de texte */
body-large: text-2xl md:text-3xl font-semibold
body: text-base font-normal
body-small: text-sm
body-xs: text-xs

/* Labels & Captions */
label: text-sm uppercase tracking-[0.3em] text-zinc-500
caption: text-xs text-zinc-500
```

#### Classes Typographiques Réutilisables

```tsx
// À créer dans globals.css ou composants
.text-label {
  @apply text-sm uppercase tracking-[0.3em] text-zinc-500;
}

.text-heading-1 {
  @apply text-5xl md:text-6xl font-semibold leading-tight text-white;
}

.text-heading-2 {
  @apply text-2xl md:text-3xl font-semibold text-white;
}

.text-body-large {
  @apply text-2xl md:text-3xl font-semibold text-white/90 leading-snug;
}
```

### 1.3 Espacements & Layout

#### Système d'Espacement (V1)

```css
/* Padding */
--p-section: 1.5rem (px-6) / 4rem (py-16)
--p-card: 1.5rem (p-6)
--p-container: max-w-6xl mx-auto px-6 lg:px-12

/* Gaps */
--gap-small: 0.5rem (gap-2)
--gap-medium: 1rem (gap-4)
--gap-large: 1.5rem (gap-6)
--gap-section: 2.5rem (space-y-10)

/* Border Radius */
--radius-small: 0.5rem (rounded-lg)
--radius-medium: 1rem (rounded-2xl)
--radius-large: 1.5rem (rounded-3xl)
--radius-full: 9999px (rounded-full)
```

### 1.4 Composants Visuels Clés

#### Boutons (V1 Style)

```tsx
// Bouton Primaire (blanc sur noir)
<button className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-zinc-200 transition">
  Texte
</button>

// Bouton Secondaire (outline)
<button className="border border-white/40 px-6 py-3 rounded-full font-semibold text-white hover:border-white/60 transition">
  Texte
</button>

// Bouton Tertiaire (ghost)
<button className="px-6 py-3 rounded-full border border-white/30 text-white/80 hover:text-white transition">
  Texte
</button>

// Bouton Disabled
<button className="bg-white/20 text-zinc-500 cursor-not-allowed px-6 py-3 rounded-full font-semibold">
  Texte
</button>
```

#### Cartes (V1 Style)

```tsx
// Carte Standard
<div className="rounded-2xl bg-zinc-900 border border-white/10 p-6">
  {/* Contenu */}
</div>

// Carte avec Background Overlay
<div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md px-6 py-5">
  {/* Contenu */}
</div>

// Carte Villa (dans liste)
<div className="rounded-3xl border border-white/10 bg-zinc-900/60 overflow-hidden">
  {/* Image + Contenu */}
</div>
```

#### Badges & Tags (V1 Style)

```tsx
// Badge de Filtre Actif
<span className="rounded-full border border-white/15 px-4 py-1 text-xs text-zinc-300">
  Texte
</span>

// Badge Vibe
<span className="rounded-full border border-white/15 px-4 py-1 text-sm">
  {vibe}
</span>

// Badge Match Score
<div className="rounded-full bg-white text-black px-4 py-1 text-sm font-semibold">
  {score}% match
</div>
```

#### Inputs & Formulaires (V1 Style)

```tsx
// Input Standard
<input className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/40" />

// Select/Button Toggle (pour filtres)
<button className={`rounded-full border px-4 py-2 text-sm transition ${
  active 
    ? "bg-white text-black border-white" 
    : "border-white/15 text-white"
}`}>
  Option
</button>
```

### 1.5 Effets & Animations

```css
/* Transitions */
transition: transition (300ms par défaut)
hover:scale: scale-105 (pour boutons avec hover)
hover:bg: hover:bg-zinc-200 (pour boutons blancs)

/* Backdrop Blur */
backdrop-blur-md: backdrop-blur-md (pour overlays)

/* Opacités */
bg-black/80: rgba(0, 0, 0, 0.8)
bg-white/10: rgba(255, 255, 255, 0.1)
text-white/90: rgba(255, 255, 255, 0.9)
border-white/15: rgba(255, 255, 255, 0.15)
```

---

## 📝 PARTIE 2 : COPYWRITING

### 2.1 Ton & Style

**Principe général :** Ton décontracté mais professionnel, direct et rassurant. Utilisation du "tu" pour créer proximité. Phrases courtes et impactantes.

**Éviter :** Langage trop formel, jargon technique, phrases trop longues.

### 2.2 Vocabulaire Clé

#### Termes à Utiliser (V1)

- **"Coloc"** (pas "colocation" sauf contexte formel)
- **"Vibe"** (pas "ambiance" ou "atmosphère")
- **"Matche"** / **"Match"** (pour compatibilité)
- **"Booke"** / **"Réserver"** (action de réservation)
- **"Colocs"** (pour les colocataires)
- **"Villa"** (toujours au singulier sauf liste)

#### Termes à Éviter

- ❌ "Colocation" (trop formel)
- ❌ "Appartement" (utiliser "villa")
- ❌ "Logement" (trop générique)
- ❌ "Réservation" (préférer "réserver" ou "booker")

### 2.3 Messages Clés par Page

#### Page d'Accueil

```markdown
# Hero Section
Titre: "Trouve ta coloc idéale à Bali"
Sous-titre: "Colocation ou villa entière, selon ton style de vie, ton budget et ton rythme."

CTA Principal: "Commencer maintenant"
CTA Secondaire: "Voir les villas"

# Message de Valeur (bas de hero)
"Fini les recherches interminables sur Facebook et les discussions sans fin sur WhatsApp. Villa First est la solution sécurisée qui trouve la villa qui te correspond."

# Stats
- "120+ colocs créées avec succès"
- "5 zones principales couvertes à Bali"
- "<72h pour trouver ta villa"

# Section "Pourquoi Villa First ?"
Titre: "Pourquoi Villa First ?"
Description: "On gère la pré-sélection, la compatibilité des colocs et la paperasse. Tu te concentres sur ton aventure à Bali."

Étapes:
1. "Partage ton profil" - "Renseigne tes dates, ton budget et ton ambiance pour que l'on connaisse ta vibe."
2. "On te matche" - "Notre algorithme filtre les villas compatibles et t'indique les colocs qui y vivent."
3. "Visite et booke" - "Visite virtuellement, parle au groupe puis confirme ta place en quelques clics."

# Section Villas Populaires
Label: "Villas populaires"
Titre: "Nos coups de cœur du moment"
CTA: "Voir toutes les villas"

# Section CTA Finale
Titre: "Prêt à rencontrer ta future coloc ?"
Description: "En trois étapes, tu passes de 'je pense venir à Bali' à 'je vis dans une villa qui me ressemble avec des colocs alignés sur mes envies'."

CTAs:
- "Lancer mon matching"
- "Parler à un conseiller"
- "Publier ma villa"
```

#### Page Liste des Villas

```markdown
# Header
Label: "Explorer"
Titre: "Villas disponibles"
Description: "Filtre par vibe, zone et budget pour trouver une coloc qui matche ton rythme. Tes prefs d'onboarding sont déjà chargées."

Compteur: "{nombre} villas matchent"

# Filtres
Zone:
- Options: "Toutes" + zones dynamiques
- Reset: "réinitialiser"

Vibe:
- Options: "Toutes", "Work", "Chill", "Party", "Mix"

Budget:
- Label: "Budget max"
- Range: 5M - 18M IDR
- Affichage: Format IDR avec currency

Places disponibles:
- Label: "Places disponibles"
- Description: "Mets en pause les villas déjà complètes"
- Toggle: On/Off

# Carte Villa
Badge Match: "{score}% match" (en haut à gauche de l'image)
Zone: Texte small uppercase tracking-wide
Titre: Nom de la villa
Vibe: Badge avec couleur
Places: "{X} place(s) restante(s) - Cap {Y} colocs"
Prix Total: "Total mensuel" + montant
Prix Par Personne: "Par personne" + montant
Tags: "Piscine & wifi", "Group chat actif", "Frais booking inclus"
CTA: "Voir la villa"
Action secondaire: "Partager"

# État Vide
Titre: "Aucun match pour ces filtres"
Description: "Ajuste ton budget ou ajoute une nouvelle zone pour voir plus de villas."
```

#### Page Détail Villa

```markdown
# Header
Breadcrumb: "<- Retour aux villas"
Label: "Villa #{id}"

# Informations Principales
Zone: Label uppercase tracking-wide
Titre: Nom de la villa
Vibe: Badge
Score de compatibilité: "{score}% match avec ton profil"
Prix: Format IDR "par personne / mois"

# Sections
- Photos (carousel)
- Description
- Colocataires actuels: "Ils vivent déjà là" + liste avec âge et vibe
- Règles: "Règles de la maison" + liste
- Adresse: Format complet

# CTA
"Réserver cette place" (bouton principal blanc)
```

#### Page Onboarding

```markdown
# Page 1 - Profil
Label: "Step 1/2"
Titre: "Trouve la coloc qui te ressemble"
Description: "Choisis ta vibe et ton style de vie pour que l'on personnalise ton arrivée et tes futurs colocs."

## Section Vibe
Label: "Vibe"
Note: "Sélection obligatoire"
Options:
- "Work friendly" - "Wifi solide, ambiance studieuse"
- "Chill" - "Brunch, sunset et rythme tranquille"
- "Party" - "Clubs, events et sorties régulières"

## Section Style de vie
Label: "Style de vie"
Note: "Multi-choix"
Options: "Remote worker", "Sportif", "Social", "Créatif", "Casanier"

## Section Rythme
Label: "Rythme"
Options: "Très calme", "Équilibre", "Festif"

## Sidebar
Titre: "Ton brief"
Affichage dynamique des sélections
Note: "On partage ce brief avec nos villa managers pour matcher ton style."

Aide: "Besoin d'aide ? On peut te recommander la vibe et la zone idéale selon ton rythme."
Lien: "Book un call express"

CTA: "Continuer" (disabled si champs manquants)

# Page 2 - Dates & Budget
[À compléter selon structure V1]
```

#### Page Réservation

```markdown
# Header
Titre: "Réserve ta place"
Villa: Nom + zone

# Informations Réservation
Dates: Sélecteur de date
Message: Textarea optionnel

# Récapitulatif
Prix par personne: Format IDR
Frais de booking: "25 EUR" (ou équivalent IDR)
Total: Calcul

# Paiement
Section: "Due aujourd'hui"
Montant: "25 EUR"
Note: "Solde à régler à ton arrivée: {montant IDR}"
Note conversion: "Conversion approximative. Le solde restera en IDR."

Checkbox: "J'accepte les conditions générales"

CTA: "Payer et rejoindre le groupe" (disabled si pas de date ou pas d'acceptation)
Note sécurité: "Paiement sécurisé via Stripe. Aucune carte n'est débitée après le montant indiqué."
```

### 2.4 Messages d'Erreur & États

```markdown
# États de Chargement
"Chargement..." (générique)
"Chargement des détails..." (page détail)

# États Vides
"Aucun match pour ces filtres"
"Ajuste ton budget ou ajoute une nouvelle zone pour voir plus de villas."

# Messages de Confirmation
"Supprimer cette villa ? Elle ne sera plus visible dans ton inventaire."
"Erreur lors de la suppression. Réessaie ou contacte-nous."

# Validation
Champs obligatoires: "Sélection obligatoire"
Multi-choix: "Choisis 1 ou +"
À définir: "À définir"
```

### 2.5 Formatage des Prix

```typescript
// Format IDR (Roupie Indonésienne)
const formatIdr = (value: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

// Exemples d'affichage
"8 000 000 IDR" (grand nombre)
"par personne / mois" (suffixe)
"Total mensuel" (label)
```

---

## 🔧 PARTIE 3 : INSTRUCTIONS DE MIGRATION

### 3.1 Étapes de Migration

#### Phase 1 : Configuration Tailwind

1. **Modifier `tailwind.config.ts`**
   - Remplacer la palette de couleurs par celle de la V1
   - Supprimer les gradients organiques de la V2
   - Ajouter les custom colors (zinc-900, zinc-950, etc.)

2. **Modifier `app/globals.css`**
   - Ajouter les variables CSS de la V1
   - Créer les classes utilitaires typographiques
   - Conserver les imports Radix UI nécessaires

#### Phase 2 : Migration des Composants

1. **Composants de Base (UI)**
   - Adapter les composants Radix UI avec les styles V1
   - Créer des variants pour boutons selon V1
   - Adapter les cartes avec les styles V1

2. **Composants Métier**
   - Migrer les composants Villa avec le style V1
   - Adapter les formulaires avec les styles V1
   - Migrer les badges et tags

#### Phase 3 : Migration des Pages

1. **Page d'Accueil**
   - Remplacer le contenu par le copywriting V1
   - Adapter les styles selon V1
   - Conserver la structure responsive

2. **Page Liste Villas**
   - Migrer les filtres avec styles V1
   - Adapter les cartes villas
   - Conserver la logique de filtrage V2

3. **Page Détail Villa**
   - Migrer le layout V1
   - Adapter les sections
   - Conserver les fonctionnalités V2

4. **Pages Onboarding**
   - Migrer le copywriting V1
   - Adapter les styles
   - Conserver la logique V2

#### Phase 4 : Ajustements Finaux

1. **Cohérence Visuelle**
   - Vérifier tous les espacements
   - Uniformiser les bordures et radius
   - Vérifier les contrastes

2. **Copywriting**
   - Remplacer tous les textes par ceux de la V1
   - Vérifier le ton et le style
   - Uniformiser le vocabulaire

3. **Tests**
   - Tester sur mobile et desktop
   - Vérifier les états (hover, focus, disabled)
   - Valider l'accessibilité

### 3.2 Checklist de Migration

```markdown
## Design System
- [ ] Palette de couleurs migrée
- [ ] Typographie configurée
- [ ] Espacements définis
- [ ] Composants de base adaptés

## Pages
- [ ] Page d'accueil
- [ ] Page liste villas
- [ ] Page détail villa
- [ ] Page onboarding (toutes les étapes)
- [ ] Page réservation
- [ ] Pages propriétaire

## Composants
- [ ] Boutons
- [ ] Cartes
- [ ] Formulaires
- [ ] Badges & Tags
- [ ] Navigation

## Copywriting
- [ ] Tous les textes remplacés
- [ ] Ton uniformisé
- [ ] Vocabulaire cohérent
- [ ] Messages d'erreur adaptés

## Tests
- [ ] Responsive mobile
- [ ] Responsive desktop
- [ ] États interactifs
- [ ] Accessibilité
```

### 3.3 Règles de Migration

1. **NE PAS modifier** la logique métier de la V2
2. **NE PAS modifier** la structure de données
3. **NE PAS modifier** les routes API
4. **SEULEMENT modifier** les styles CSS et le copywriting
5. **CONSERVER** tous les composants Radix UI (accessibilité)
6. **ADAPTER** les styles Radix UI avec les couleurs V1

### 3.4 Exemples de Migration

#### Exemple 1 : Bouton Primaire

```tsx
// AVANT (V2 avec gradient)
<Button variant="gradient" size="lg">
  Commencer
</Button>

// APRÈS (V1 style)
<Button className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-zinc-200 transition">
  Commencer maintenant
</Button>
```

#### Exemple 2 : Carte Villa

```tsx
// AVANT (V2 avec gradient)
<Card variant="gradient-ocean" interactive>
  {/* Contenu */}
</Card>

// APRÈS (V1 style)
<div className="rounded-3xl border border-white/10 bg-zinc-900/60 overflow-hidden">
  {/* Contenu */}
</div>
```

#### Exemple 3 : Badge Match

```tsx
// AVANT (V2)
<div className="badge-match-gradient">
  {score}% match
</div>

// APRÈS (V1)
<div className="absolute top-4 left-4 rounded-full bg-white text-black px-4 py-1 text-sm font-semibold">
  {score}% match
</div>
```

---

## 📚 PARTIE 4 : RÉFÉRENCES

### 4.1 Fichiers Source V1

```
c:\Users\Falsone\Desktop\Villa first\
├── app\
│   ├── page.tsx                    # Page d'accueil (référence design)
│   ├── villas\page.tsx            # Liste villas (référence design)
│   ├── villa\[id]\page.tsx         # Détail villa (référence design)
│   ├── onboarding\page1\page.tsx  # Onboarding (référence design)
│   └── globals.css                 # Styles globaux
├── components\
│   └── owner\VillaCard.tsx         # Exemple composant carte
└── tailwind.config.ts              # Configuration Tailwind
```

### 4.2 Fichiers Cibles V2

```
c:\Users\Falsone\Desktop\Villa first v2\
├── app\
│   ├── (routes)\                   # Pages à migrer
│   └── globals.css                 # À modifier
├── components\
│   ├── ui\                         # Composants Radix UI (à adapter)
│   └── features\                   # Composants métier (à migrer)
└── tailwind.config.ts              # À modifier
```

### 4.3 Documentation V2 à Consulter

- `_bmad-output/architecture.md` - Architecture technique
- `_bmad-output/planning-artifacts/ux-design-specification.md` - Spécifications UX V2
- `_bmad-output/planning-artifacts/design-system-premium.md` - Design system V2 (à remplacer)

---

## ✅ PARTIE 5 : VALIDATION

### 5.1 Critères de Succès

1. **Cohérence Visuelle**
   - Toutes les pages utilisent la palette V1
   - Typographie uniforme
   - Espacements cohérents

2. **Copywriting**
   - Tous les textes utilisent le vocabulaire V1
   - Ton uniforme et décontracté
   - Messages clairs et directs

3. **Fonctionnalité**
   - Toutes les fonctionnalités V2 conservées
   - Performance maintenue
   - Accessibilité préservée

### 5.2 Points d'Attention

⚠️ **Ne pas perdre** :
- L'accessibilité des composants Radix UI
- La structure responsive
- Les fonctionnalités métier de la V2

⚠️ **À surveiller** :
- Les contrastes de couleurs (accessibilité)
- La lisibilité sur mobile
- La cohérence entre pages

---

## 🎯 Conclusion

Ce document doit servir de référence absolue pour toute migration de design et copywriting. En cas de doute, toujours privilégier :

1. **Design V1** pour l'esthétique
2. **Architecture V2** pour la structure
3. **Copywriting V1** pour le ton et le vocabulaire
4. **Composants Radix UI V2** pour l'accessibilité

**Objectif final :** Une application avec l'esthétique épurée de la V1 et la robustesse technique de la V2.

---

**Document créé le :** 2026-01-28  
**Dernière mise à jour :** 2026-01-28  
**Version :** 1.1

---

## 📌 Note Importante

**Pour l'implémentation, utilisez le guide consolidé :**
👉 `_bmad-output/planning-artifacts/guide-migration-design-v1-v2-consolide.md`

Ce document original reste comme référence détaillée du design V1 et du copywriting, mais le guide consolidé contient :
- ✅ Adaptations pour Tailwind v4
- ✅ Variants Radix UI plutôt que classes inline
- ✅ Plan d'implémentation étape par étape
- ✅ Références à l'analyse existante
