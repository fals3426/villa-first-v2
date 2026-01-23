---
migration_name: 'Messaging Strategy Update - Vibes First'
version: '1.0'
date: '2026-01-23'
priority: 'HIGH'
status: 'ready-for-dev'
target: 'Dev Agent'
---

# Guide de Migration : Mise à Jour du Messaging

## 🎯 Objectif

Mettre à jour tous les textes de l'application pour refléter le nouveau positionnement : **"Trouve une villa qui correspond à tes vibes"** au lieu de mettre l'accent sur la vérification.

---

## ⚠️ Changement Critique

### Ancien Positionnement (À REMPLACER)
- Message principal centré sur la vérification
- Exemples : "Trouve ta villa vérifiée à Bali", "Villas vérifiées à Bali"

### Nouveau Positionnement (À IMPLÉMENTER)
- **Message principal :** "Trouve une villa qui correspond à tes vibes"
- **Focus :** Matching vibes/critères personnels en PRIORITÉ #1
- **Vérification :** Présentée comme garantie de confiance (PRIORITÉ #2)

---

## 📋 Checklist de Migration

### 1. Page d'Accueil / Hero Section

**Fichiers à vérifier :**
- `src/app/page.tsx` (page d'accueil)
- `src/components/layout/Hero.tsx` (si existe)
- `src/components/features/home/HeroSection.tsx` (si existe)

**Changements à faire :**

```typescript
// ❌ ANCIEN (à remplacer)
<h1>Trouve ta villa vérifiée à Bali</h1>
<p>Des colocations vérifiées pour ta sécurité</p>

// ✅ NOUVEAU (à implémenter)
<h1>Trouve une villa qui correspond à tes vibes</h1>
<p>Des colocations vérifiées à Bali, filtrées par tes critères : 
calme, social, télétravail, spiritualité...</p>
```

**CTA Principal :**
- ❌ Ancien : "Voir les villas vérifiées"
- ✅ Nouveau : "Explorer les annonces" ou "Trouver ma coloc"

---

### 2. Composants de Liste d'Annonces

**Fichiers à vérifier :**
- `src/components/features/listings/ListingCard.tsx`
- `src/components/features/listings/ListingList.tsx`
- `src/app/(public)/listings/page.tsx`

**Changements à faire :**

**Hiérarchie visuelle (dans ListingCard) :**
```typescript
// ✅ Ordre correct :
1. Vibes (tags visibles en premier)
2. Badge vérifié (visible mais secondaire)
3. Prix et localisation
4. Détails supplémentaires
```

**Messages de filtre actif :**
```typescript
// ❌ ANCIEN
"X annonces vérifiées disponibles"

// ✅ NOUVEAU
"X annonces correspondent à tes critères"
"Filtrer par vibes pour trouver ta coloc idéale"
```

**Message vide (aucun résultat) :**
```typescript
// ❌ ANCIEN
"Aucune villa vérifiée trouvée"

// ✅ NOUVEAU
"Aucune annonce ne correspond à tes critères"
"Modifie tes filtres pour trouver ta coloc idéale"
```

---

### 3. Composants de Filtrage

**Fichiers à vérifier :**
- `src/components/features/search/Filters.tsx`
- `src/components/features/search/SearchBar.tsx`
- `src/components/features/vibes/VibeSelector.tsx`

**Changements à faire :**

**Labels de filtres :**
```typescript
// ❌ ANCIEN
"Filtrer par vérification"
"Annonces vérifiées uniquement"

// ✅ NOUVEAU
"Filtre par tes critères"
"Trouve des colocations qui matchent ton style de vie"
"Sélectionne tes vibes : calme, social, télétravail, spiritualité"
```

**Placeholder de recherche :**
```typescript
// ❌ ANCIEN
"Rechercher une villa vérifiée..."

// ✅ NOUVEAU
"Rechercher par localisation, vibes, budget..."
```

---

### 4. Page Détail Annonce

**Fichiers à vérifier :**
- `src/app/(public)/listings/[id]/page.tsx`
- `src/components/features/listings/ListingDetail.tsx`

**Changements à faire :**

**Structure de la page :**
```typescript
// ✅ Ordre correct :
1. Titre : Nom de la coloc + vibes principaux (en premier)
2. Badge vérifié : Visible mais discret (en haut à gauche)
3. Description : Met l'accent sur les vibes et le style de vie
4. Section "Vérification" : Explique le badge de manière rassurante
```

**Titre de la page :**
```typescript
// ❌ ANCIEN
"Villa vérifiée à Canggu"

// ✅ NOUVEAU
"Villa Calme & Télétravail à Canggu" (vibes en premier)
"✓ Vérifiée" (badge discret)
```

---

### 5. Messages d'Onboarding

**Fichiers à vérifier :**
- `src/app/(auth)/register/page.tsx`
- `src/components/features/auth/RegisterForm.tsx`
- `src/components/features/auth/OnboardingForm.tsx` (si existe)

**Changements à faire :**

**Message d'accueil :**
```typescript
// ❌ ANCIEN
"Crée ton compte pour accéder aux annonces vérifiées"

// ✅ NOUVEAU
"Découvre des colocations qui correspondent à ton style de vie"
"Définis tes critères pour trouver ta coloc idéale"
```

**Questionnaire vibes :**
```typescript
// ✅ Labels corrects :
"Quels sont tes critères de coloc idéale ?"
"Sélectionne tes vibes : calme, social, télétravail, spiritualité"
"Trouve des colocations qui matchent ton style de vie"
```

---

### 6. Messages d'Erreur et Feedback

**Fichiers à vérifier :**
- Tous les fichiers avec messages d'erreur utilisateur
- `src/lib/validations.ts` (messages Zod)
- Composants de toast/notification

**Changements à faire :**

**Messages de recherche vide :**
```typescript
// ❌ ANCIEN
"Aucune villa vérifiée ne correspond à ta recherche"

// ✅ NOUVEAU
"Aucune annonce ne correspond à tes critères"
"Essaie de modifier tes filtres pour trouver ta coloc idéale"
```

**Messages de succès :**
```typescript
// ❌ ANCIEN
"Villa vérifiée ajoutée aux favoris"

// ✅ NOUVEAU
"Coloc ajoutée à tes favoris"
"Tu recevras des notifications si de nouvelles annonces correspondent à tes critères"
```

---

### 7. Métadonnées et SEO

**Fichiers à vérifier :**
- `src/app/layout.tsx` (metadata)
- `src/app/page.tsx` (metadata)
- `public/manifest.json` (si applicable)

**Changements à faire :**

```typescript
// ❌ ANCIEN
export const metadata = {
  title: "Villa First - Trouve ta villa vérifiée à Bali",
  description: "Marketplace de colocations vérifiées à Bali"
}

// ✅ NOUVEAU
export const metadata = {
  title: "Villa First - Trouve une villa qui correspond à tes vibes",
  description: "Découvre des colocations vérifiées à Bali, filtrées par tes critères : calme, social, télétravail, spiritualité..."
}
```

---

## 🔍 Où Chercher les Textes à Modifier

### Recherche dans le Code

**Commandes pour trouver les textes à modifier :**

```bash
# Chercher "villa vérifiée"
grep -r "villa vérifiée" src/
grep -r "villa.*vérifiée" src/
grep -r "vérifiée.*bali" src/

# Chercher les messages centrés sur vérification
grep -r "trouve.*vérifiée" src/
grep -r "annonces vérifiées" src/

# Chercher les CTAs
grep -r "voir.*vérifiée" src/
grep -r "explorer.*vérifiée" src/
```

### Fichiers Types à Examiner

1. **Composants React :**
   - Tous les fichiers dans `src/components/features/`
   - Tous les fichiers dans `src/components/layout/`
   - Pages dans `src/app/`

2. **Messages de validation :**
   - `src/lib/validations.ts` (messages Zod)
   - `src/lib/constants.ts` (si contient des messages)

3. **Réponses API :**
   - `src/app/api/**/route.ts` (messages d'erreur utilisateur)
   - `src/server/services/**/*.ts` (messages d'erreur)

---

## ✅ Checklist de Validation

Après les modifications, vérifier :

- [ ] Page d'accueil : Message principal centré sur vibes
- [ ] Hero section : "Trouve une villa qui correspond à tes vibes"
- [ ] Liste d'annonces : Vibes visibles en premier, badge vérifié secondaire
- [ ] Filtres : Labels centrés sur critères/vibes
- [ ] Page détail : Vibes dans le titre, badge discret
- [ ] Onboarding : Messages centrés sur critères personnels
- [ ] Messages d'erreur : Ton rassurant, centré sur l'utilisateur
- [ ] Métadonnées SEO : Description centrée sur vibes
- [ ] CTA : "Explorer" ou "Trouver" au lieu de "Voir vérifiées"

---

## 📚 Références

**Documents à consulter :**
- **Stratégie de Messaging :** `_bmad-output/planning-artifacts/messaging-strategy.md`
- **Processus Copywriting :** `_bmad-output/planning-artifacts/copywriting-process.md`
- **Guide Validation UX :** `_bmad-output/planning-artifacts/ux-copywriting-validation-guide.md`

**Guidelines à suivre :**
- Message principal : Vibes/critères en PRIORITÉ #1
- Vérification : Garantie de confiance en PRIORITÉ #2
- Ton : Rassurant, jamais anxiogène, centré sur l'utilisateur

---

## 🚀 Processus de Migration

### Étape 1 : Audit
1. Rechercher tous les textes contenant "vérifiée", "villa vérifiée", etc.
2. Lister tous les fichiers à modifier
3. Créer une checklist par fichier

### Étape 2 : Modification
1. Modifier les fichiers un par un
2. Suivre la hiérarchie : Vibes → Vérification → Autres
3. Tester visuellement chaque changement

### Étape 3 : Validation
1. Demander validation UX : "Valider le copywriting de [story-key]"
2. Vérifier que tous les messages respectent la nouvelle stratégie
3. S'assurer que la vérification reste visible mais secondaire

### Étape 4 : Tests
1. Tester sur mobile et desktop
2. Vérifier que les vibes sont bien visibles en premier
3. Confirmer que le badge vérifié reste présent mais discret

---

## 💡 Exemples Concrets

### Exemple 1 : Hero Section

```tsx
// ❌ AVANT
<section className="hero">
  <h1>Trouve ta villa vérifiée à Bali</h1>
  <p>La seule plateforme avec annonces vérifiées</p>
  <button>Voir les villas vérifiées</button>
</section>

// ✅ APRÈS
<section className="hero">
  <h1>Trouve une villa qui correspond à tes vibes</h1>
  <p>Des colocations vérifiées à Bali, filtrées par tes critères : 
     calme, social, télétravail, spiritualité...</p>
  <button>Explorer les annonces</button>
  <p className="text-sm text-muted-foreground mt-2">
    ✓ Toutes les annonces vérifiées pour ta sécurité
  </p>
</section>
```

### Exemple 2 : ListingCard

```tsx
// ❌ AVANT
<article>
  <VerifiedBadge isVerified={listing.isVerified} />
  <h2>{listing.title}</h2>
  <VibeTags vibes={listing.vibes} />
  <p>{listing.price}€/mois</p>
</article>

// ✅ APRÈS
<article>
  <VibeTags vibes={listing.vibes} /> {/* En premier */}
  <VerifiedBadge isVerified={listing.isVerified} /> {/* Secondaire */}
  <h2>{listing.title}</h2>
  <p>{listing.price}€/mois</p>
</article>
```

### Exemple 3 : Message de Filtre

```tsx
// ❌ AVANT
{filteredCount > 0 ? (
  <p>{filteredCount} villas vérifiées disponibles</p>
) : (
  <p>Aucune villa vérifiée trouvée</p>
)}

// ✅ APRÈS
{filteredCount > 0 ? (
  <p>{filteredCount} annonces correspondent à tes critères</p>
) : (
  <p>Aucune annonce ne correspond à tes critères. 
     Modifie tes filtres pour trouver ta coloc idéale.</p>
)}
```

---

## ⚠️ Points d'Attention

1. **Ne pas supprimer le badge vérifié** : Il reste visible, juste moins mis en avant
2. **Garder la cohérence** : Tous les messages doivent suivre la même hiérarchie
3. **Tester sur mobile** : Le messaging doit être clair sur petit écran
4. **Accessibilité** : Les vibes doivent être accessibles (ARIA labels, contraste)

---

## 📝 Notes pour le Dev Agent

**Priorités :**
1. **HIGH** : Page d'accueil / Hero section
2. **HIGH** : Liste d'annonces / ListingCard
3. **MEDIUM** : Filtres et recherche
4. **MEDIUM** : Page détail annonce
5. **LOW** : Messages d'erreur et feedback

**Après modifications :**
- Marquer la story comme "ready-for-ux-review"
- Demander validation UX : "Valider le copywriting de [story-key]"

---

**Dernière mise à jour :** 2026-01-23
**Status :** Ready for Dev Agent implementation
