# Alignement UX ↔ Implémentation Technique

**Date :** 2026-01-23  
**Objectif :** Documenter l'alignement entre les spécifications UX et l'implémentation technique actuelle

---

## ✅ Points d'Alignement Actuels

### 1. Design System
**Spécification UX :** Tailwind CSS + Headless UI (Radix UI)  
**Implémentation :** ✅ **ALIGNÉ**
- Tailwind CSS v4 installé
- shadcn/ui configuré (basé sur Radix UI)
- Composants Radix UI installés : `@radix-ui/react-checkbox`, `@radix-ui/react-label`, `@radix-ui/react-select`, `@radix-ui/react-slot`
- Composants shadcn/ui créés : Button, Input, Label, Select, Checkbox

**Note :** shadcn/ui est une excellente implémentation de Radix UI + Tailwind, parfaitement alignée avec les spécifications UX.

### 2. Stack Technique
**Spécification UX :** React/Next.js avec Tailwind CSS  
**Implémentation :** ✅ **ALIGNÉ**
- Next.js 16.1.4 avec App Router
- React 19.2.3
- TypeScript avec strict mode
- PWA avec @serwist/next

### 3. Structure de Base
**Spécification UX :** Mobile-first, PWA, Accessibilité WCAG AA  
**Implémentation :** ✅ **PARTIELLEMENT ALIGNÉ**
- PWA configuré ✅
- Mobile-first : À vérifier dans les composants
- Accessibilité : ARIA labels à compléter

---

## ⚠️ Écarts Identifiés

### 1. Composants Custom UX Manquants (Priorité Critique)

#### 1.1 Badge Vérifié (Priorité Absolue)
**Spécification UX :**
- Composant complètement custom
- États : Vérifié complet, Partiellement vérifié, Non vérifié, En attente, Suspendu
- Modal détails vérification (ID, Titre, Mandat, Calendrier)
- Position : haut à gauche de la photo annonce
- ARIA labels complets

**Implémentation actuelle :** ❌ **NON IMPLÉMENTÉ**
- Le système KYC existe (Story 1.6, 1.7) mais pas de composant Badge visuel
- Pas de modal détails vérification
- Pas de badge pour annonces vérifiées

**Action requise :** Créer composant `VerifiedBadge` selon spécifications UX

#### 1.2 Card Annonce (Core Experience)
**Spécification UX :**
- Structure : Photo (150px mobile), Badge vérifié, Like/Favoris, Titre, Prix, Localisation, Vibes, CTA
- Hiérarchie visuelle : Confiance > Vibes > Prix
- Responsive : Full-width mobile, 2-3 colonnes desktop
- États : Default, Hover, Selected/Favoris, Indisponible, Loading (skeleton)

**Implémentation actuelle :** ❌ **NON IMPLÉMENTÉ**
- Pas de liste d'annonces encore (Epic 3 à venir)
- Pas de composant Card annonce

**Action requise :** Créer composant `ListingCard` selon spécifications UX (quand Epic 3 sera implémenté)

#### 1.3 Système de Vibes (Tags/Icônes)
**Spécification UX :**
- Tags avec icônes : 🌙 Calme, 🎉 Social, 🧘 Spiritualité, 💻 Télétravail
- Multi-select dans filtres
- Affichage inline sur cartes annonces
- Couleurs distinctives par vibe

**Implémentation actuelle :** ⚠️ **PARTIELLEMENT IMPLÉMENTÉ**
- Types et schémas vibes créés (`src/types/vibes.types.ts`)
- Questionnaire vibes créé (`VibesQuestionnaire.tsx`)
- **MANQUE :** Composant visuel `VibeTag` avec icônes et couleurs selon UX
- **MANQUE :** Affichage des vibes sur les cartes annonces

**Action requise :** 
- Créer composant `VibeTag` avec icônes et couleurs UX
- Intégrer dans `VibesQuestionnaire` et futures cartes annonces

#### 1.4 Filtres (Affinement Recherche)
**Spécification UX :**
- Panneau slide-in mobile, sidebar desktop
- Filtres : Budget (slider), Zone (liste/map), Vibes (multi-select), Vérification (toggle)
- Application temps réel (pas de bouton "Appliquer")
- Chips actifs affichés en haut

**Implémentation actuelle :** ❌ **NON IMPLÉMENTÉ**
- Pas de système de recherche/filtres encore (Epic 4 à venir)

**Action requise :** Créer composants filtres selon spécifications UX (quand Epic 4 sera implémenté)

#### 1.5 Chat Masqué
**Spécification UX :**
- Chat visible mais bloqué avant réservation
- Overlay avec message + CTA "Réserver"
- Déblocage automatique après réservation
- Coordonnées partiellement masquées avant validation

**Implémentation actuelle :** ❌ **NON IMPLÉMENTÉ**
- Pas de système de chat encore (Epic 5+ à venir)

**Action requise :** Créer composant `ChatBlocked` selon spécifications UX (quand chat sera implémenté)

---

### 2. Design Tokens & Couleurs

**Spécification UX :**
- Palette confiance : vert #57bd92 pour badge vérifié
- Palette calme : neutres chauds/gris doux
- Accents vibes : Calme=#6BA2FF, Social=#FF886B, Spiritualité=#B68CFF, Télétravail=#4FD4C8
- Contraste WCAG AA (4.5:1 minimum)

**Implémentation actuelle :** ⚠️ **PARTIELLEMENT ALIGNÉ**
- Tailwind configuré mais pas de design tokens personnalisés définis
- Couleurs par défaut de shadcn/ui utilisées
- Pas de couleurs spécifiques pour badge vérifié et vibes

**Action requise :**
- Définir design tokens dans `tailwind.config.ts`
- Ajouter couleurs personnalisées (confiance, vibes)
- Vérifier contraste WCAG AA

---

### 3. Mobile-First & Responsive

**Spécification UX :**
- Mobile-first (prioritaire)
- Breakpoints : sm:640px, md:768px, lg:1024px, xl:1280px
- Touch targets ≥44px
- Navigation bottom bar mobile

**Implémentation actuelle :** ⚠️ **À VÉRIFIER**
- Tailwind responsive configuré
- Composants utilisent classes responsive
- **À vérifier :** Touch targets, navigation mobile

**Action requise :**
- Auditer tous les composants pour touch targets ≥44px
- Vérifier navigation mobile (bottom bar si nécessaire)
- Tester sur vrais appareils mobiles

---

### 4. Accessibilité WCAG AA

**Spécification UX :**
- Contraste 4.5:1 minimum
- Navigation clavier complète
- Screen reader support (ARIA labels, roles, states)
- Focus visible (outline 2px #57bd92)
- Touch targets ≥44px

**Implémentation actuelle :** ⚠️ **PARTIELLEMENT ALIGNÉ**
- Radix UI fournit accessibilité de base ✅
- **MANQUE :** ARIA labels explicites sur composants custom
- **MANQUE :** Focus management dans modals
- **MANQUE :** Vérification contraste couleurs

**Action requise :**
- Ajouter ARIA labels sur tous les composants interactifs
- Implémenter focus management dans modals
- Vérifier contraste avec outils (axe DevTools, Lighthouse)
- Tests screen reader (VoiceOver, NVDA)

---

### 5. Copywriting & Messages

**Spécification UX :**
- Ton rassurant, jamais anxiogène
- Messages actionnables et pédagogiques
- Style moderne, clair, professionnel
- Pas de jargon technique

**Implémentation actuelle :** ⚠️ **À VALIDER**
- Messages d'erreur existants dans validations Zod
- Messages API existants
- **À valider :** Conformité avec guidelines UX

**Action requise :**
- Valider tous les textes selon `ux-copywriting-validation-guide.md`
- Corriger messages non conformes
- S'assurer ton rassurant partout

---

## 📋 Plan d'Alignement Priorisé

### Phase 1 : Fondations UX (Immédiat)

1. **Design Tokens** (1-2h)
   - Définir couleurs dans `tailwind.config.ts`
   - Ajouter couleurs confiance (#57bd92) et vibes
   - Vérifier contraste WCAG AA

2. **Composant VibeTag** (2-3h)
   - Créer `src/components/features/vibes/VibeTag.tsx`
   - Implémenter icônes et couleurs selon UX
   - Intégrer dans `VibesQuestionnaire`

3. **Accessibilité Base** (2-3h)
   - Ajouter ARIA labels sur composants existants
   - Vérifier contraste couleurs
   - Tests screen reader basiques

4. **Validation Copywriting** (1-2h)
   - Valider tous les textes selon guidelines UX
   - Corriger messages non conformes

**Timeline :** Semaine actuelle

---

### Phase 2 : Composants Core UX (Quand Epic 3/4)

5. **Badge Vérifié** (4-6h)
   - Créer `src/components/features/verification/VerifiedBadge.tsx`
   - Implémenter tous les états
   - Modal détails vérification
   - ARIA labels complets

6. **Card Annonce** (4-6h)
   - Créer `src/components/features/listings/ListingCard.tsx`
   - Hiérarchie visuelle : Confiance > Vibes > Prix
   - Responsive mobile-first
   - États (hover, selected, loading)

7. **Filtres** (6-8h)
   - Créer `src/components/features/search/FiltersPanel.tsx`
   - Panneau slide-in mobile, sidebar desktop
   - Application temps réel
   - Chips actifs

**Timeline :** Quand Epic 3 (Création & Gestion d'Annonces) et Epic 4 (Recherche) seront implémentés

---

### Phase 3 : Composants Avancés (Quand Epic 5+)

8. **Chat Masqué** (4-6h)
   - Créer `src/components/features/chat/ChatBlocked.tsx`
   - Overlay avec message + CTA
   - Logique déblocage après réservation

**Timeline :** Quand système de chat sera implémenté

---

## 🎯 Actions Immédiates Recommandées

### 1. Créer Design Tokens
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Couleur confiance (badge vérifié)
        trust: {
          DEFAULT: '#57bd92',
          light: '#4aa87c',
          dark: '#3d9167',
        },
        // Couleurs vibes
        vibe: {
          calm: '#6BA2FF',      // Calme
          social: '#FF886B',    // Social
          spiritual: '#B68CFF', // Spiritualité
          remote: '#4FD4C8',    // Télétravail
        },
      },
    },
  },
}
```

### 2. Créer Composant VibeTag
```typescript
// src/components/features/vibes/VibeTag.tsx
// Avec icônes et couleurs selon UX
```

### 3. Valider Copywriting
- Utiliser `ux-copywriting-validation-guide.md`
- Valider tous les messages existants
- Corriger si nécessaire

---

## 📊 État d'Alignement Global

| Catégorie | État | Priorité |
|-----------|------|----------|
| Design System | ✅ Aligné | - |
| Stack Technique | ✅ Aligné | - |
| Design Tokens | ⚠️ Partiel | Haute |
| Badge Vérifié | ❌ Manquant | Critique |
| Card Annonce | ❌ Manquant | Critique (Epic 3) |
| Système Vibes | ⚠️ Partiel | Haute |
| Filtres | ❌ Manquant | Critique (Epic 4) |
| Chat Masqué | ❌ Manquant | Critique (Epic 5+) |
| Mobile-First | ⚠️ À vérifier | Moyenne |
| Accessibilité | ⚠️ Partiel | Haute |
| Copywriting | ⚠️ À valider | Haute |

---

## 📝 Notes Importantes

1. **shadcn/ui est parfait** : L'utilisation de shadcn/ui (Radix UI + Tailwind) est parfaitement alignée avec les spécifications UX. Pas besoin de changer.

2. **Composants custom nécessaires** : Les composants UX prioritaires (Badge vérifié, Card annonce, Vibes) doivent être créés en custom avec Tailwind, ce qui est cohérent avec l'approche actuelle.

3. **Timing** : Certains composants (Card annonce, Filtres, Chat) ne peuvent être créés que quand les fonctionnalités correspondantes seront implémentées (Epic 3, 4, 5+).

4. **Priorité immédiate** : Design tokens, VibeTag, Accessibilité, Copywriting peuvent être faits maintenant.

---

## ✅ Conclusion

L'implémentation technique est **globalement alignée** avec les spécifications UX au niveau de la stack et de l'architecture. Les écarts principaux concernent :

1. **Composants custom UX** qui doivent être créés (Badge vérifié, Card annonce, etc.)
2. **Design tokens** à définir explicitement
3. **Accessibilité** à compléter (ARIA labels, focus management)
4. **Copywriting** à valider selon guidelines UX

**Recommandation :** Commencer par Phase 1 (Fondations UX) immédiatement, puis créer les composants custom au fur et à mesure que les fonctionnalités correspondantes seront implémentées.
