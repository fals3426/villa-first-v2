# Guide Suite Après TEA - Plan d'Action Finalisation MVP

**Date :** 2026-01-28  
**Contexte :** Toutes les actions NFR avec TEA sont complétées ✅

---

## 📊 État Actuel (Après TEA)

### ✅ Ce qui est Fait

**Tests & Qualité :**
- ✅ 11 tests sécurité Playwright (tous passent)
- ✅ 3 tests unitaires Jest (tous passent)
- ✅ Health check endpoint `/api/health` fonctionnel
- ✅ Lighthouse CI configuré (`.lighthouserc.json`)
- ✅ Tests performance k6 configurés (nécessite installation k6)

**Monitoring & Sécurité :**
- ✅ Sentry intégré
- ✅ npm audit configuré
- ✅ Scripts health check créés
- ✅ Documentation monitoring complète

**Frameworks :**
- ✅ Jest configuré pour tests unitaires
- ✅ Playwright configuré pour tests E2E
- ✅ Configuration complète et fonctionnelle

---

## 🎯 Prochaines Étapes : Optimisations Performance

### ⚠️ Problèmes Identifiés (Terminal)

D'après l'analyse du terminal, 3 problèmes critiques de performance :

1. **MaxListenersExceededWarning** - Fuite mémoire potentielle
2. **Dashboard : 2.2s render time** - Trop lent
3. **Authentification : 740ms render time** - Trop lent

---

## 📋 Plan d'Action Structuré

### Phase 1 : Résoudre Problèmes Critiques (4-6h)

#### Tâche 1.1 : Corriger MaxListenersExceededWarning
- **Agent :** 🏗️ **Winston (Architect)**
- **Commande :** `/bmad/bmm/agents/architect` puis `CH`
- **Message :** 
  ```
  Je vois un MaxListenersExceededWarning dans le terminal lié à Prisma/PostgreSQL. 
  Peux-tu analyser la configuration de connection pooling et corriger ce problème 
  de fuite mémoire potentielle ?
  ```
- **Fichiers :** `src/lib/prisma.ts`
- **Durée :** 30min-1h
- **Priorité :** HAUTE

#### Tâche 1.2 : Optimiser Dashboard (2.2s → < 500ms)
- **Agent :** 💻 **Amelia (Dev)**
- **Commande :** `/bmad/bmm/agents/dev` puis `CH`
- **Message :**
  ```
  Le dashboard prend 2.2s à charger (render time). Peux-tu analyser 
  src/app/(protected)/dashboard/page.tsx, identifier les requêtes lentes, 
  et optimiser pour réduire le temps de chargement à moins de 500ms ?
  ```
- **Fichiers :** `src/app/(protected)/dashboard/page.tsx`
- **Durée :** 2-3h
- **Priorité :** CRITIQUE

#### Tâche 1.3 : Optimiser Authentification (740ms → < 200ms)
- **Agent :** 💻 **Amelia (Dev)**
- **Commande :** `/bmad/bmm/agents/dev` puis `CH`
- **Message :**
  ```
  L'authentification prend 740ms (render time). Peux-tu analyser la route 
  d'authentification, identifier pourquoi c'est si lent, et optimiser pour 
  réduire à moins de 200ms ?
  ```
- **Fichiers :** Routes API authentification
- **Durée :** 1-2h
- **Priorité :** HAUTE

---

### Phase 2 : Optimisations Quick Wins (4-6h)

#### Tâche 2.1 : Lazy Load Leaflet
- **Agent :** 💻 **Amelia (Dev)**
- **Commande :** `/bmad/bmm/agents/dev` puis `CH`
- **Message :**
  ```
  Lazy load le composant MapView qui utilise Leaflet pour réduire le bundle initial. 
  Le fichier est dans src/components/features/search/MapView.tsx
  ```
- **Gain estimé :** -200KB bundle initial
- **Durée :** 1-2h

#### Tâche 2.2 : Dynamic Imports Composants Lourds
- **Agent :** 💻 **Amelia (Dev)**
- **Commande :** `/bmad/bmm/agents/dev` puis `CH`
- **Message :**
  ```
  Convertir ces composants en dynamic imports avec lazy loading :
  - ComparisonView
  - ListingPhotosSection
  - ListingCalendarSection
  - CheckInForm
  ```
- **Gain estimé :** Réduction bundle 30-50%
- **Durée :** 2-3h

#### Tâche 2.3 : Configuration Next.js Optimisée
- **Agent :** 🏗️ **Winston (Architect)**
- **Commande :** `/bmad/bmm/agents/architect` puis `CH`
- **Message :**
  ```
  Optimiser next.config.ts avec :
  - optimizePackageImports pour lucide-react et Radix UI
  - Configuration compress: true
  - Configuration images avec formats AVIF/WebP
  ```
- **Durée :** 30min-1h

---

### Phase 3 : Validation & Mesure (1-2h)

#### Tâche 3.1 : Mesurer avec Lighthouse
- **Méthode :** Manuel (Chrome DevTools)
- **Action :**
  1. Ouvrir Chrome DevTools (F12)
  2. Onglet "Lighthouse"
  3. Sélectionner "Performance"
  4. Cliquer "Analyze page load"
  5. Vérifier les scores
- **Seuils (config TEA) :**
  - Performance Score : ≥ 90
  - FCP : ≤ 2000ms
  - TTI : ≤ 3500ms
- **Durée :** 30min

#### Tâche 3.2 : Installer k6 et Tester (Optionnel)
- **Installation :**
  ```bash
  choco install k6  # Windows
  ```
- **Exécution :**
  ```bash
  npm run test:performance:smoke  # Smoke test rapide
  npm run test:performance        # Test complet
  ```
- **Seuils (config TEA) :**
  - Search p95 : < 1000ms
  - Payment p95 : < 5000ms
  - Check-in p95 : < 3000ms
- **Durée :** 30min-1h

---

## 🗺️ Ordre d'Exécution Recommandé

```
1. Winston → MaxListenersExceededWarning (30min-1h)
   ↓
2. Amelia → Dashboard optimisation (2-3h)
   ↓
3. Amelia → Auth optimisation (1-2h)
   ↓
4. Amelia → Lazy load Leaflet (1-2h)
   ↓
5. Amelia → Dynamic imports (2-3h)
   ↓
6. Winston → Config Next.js (30min-1h)
   ↓
7. Mesurer avec Lighthouse (30min)
   ↓
8. Installer k6 et tester (optionnel, 30min-1h)
```

**Total estimé :** 8-12h de travail

---

## 📊 Objectifs de Performance MVP

### Métriques Cibles

- **Performance Score Lighthouse :** ≥ 90
- **FCP (First Contentful Paint) :** ≤ 2000ms
- **TTI (Time to Interactive) :** ≤ 3500ms
- **Dashboard Load Time :** < 500ms (actuellement 2.2s)
- **Auth Callback Time :** < 200ms (actuellement 740ms)
- **Search API p95 :** < 1000ms
- **Payment API p95 :** < 5000ms
- **Check-in API p95 :** < 3000ms

---

## ✅ Checklist d'Exécution

### Phase 1 : Critiques
- [ ] Winston → Corriger MaxListenersExceededWarning
- [ ] Amelia → Optimiser Dashboard (2.2s → < 500ms)
- [ ] Amelia → Optimiser Auth (740ms → < 200ms)
- [ ] Tester chaque optimisation individuellement

### Phase 2 : Quick Wins
- [ ] Amelia → Lazy load Leaflet
- [ ] Amelia → Dynamic imports composants
- [ ] Winston → Config Next.js optimisée
- [ ] Tester bundle size réduit

### Phase 3 : Validation
- [ ] Exécuter Lighthouse (score ≥ 90)
- [ ] Vérifier FCP ≤ 2000ms
- [ ] Vérifier TTI ≤ 3500ms
- [ ] Installer k6 (optionnel)
- [ ] Tests k6 si installé (optionnel)
- [ ] Documenter résultats avant/après

---

## 🚀 Action Immédiate

**Commencer maintenant :**

1. **Appeler Winston :** `/bmad/bmm/agents/architect`
   - Message : "Corriger le MaxListenersExceededWarning lié à Prisma"

2. **Puis Amelia :** `/bmad/bmm/agents/dev`
   - Message : "Optimiser le dashboard qui prend 2.2s à charger"

---

## 📝 Notes Importantes

### Utilisation des Outils Créés par TEA

**Lighthouse :**
- Config déjà créée : `.lighthouserc.json`
- Seuils définis : Score ≥ 90, FCP ≤ 2000ms, TTI ≤ 3500ms
- Utiliser Chrome DevTools ou `npx lighthouse-ci autorun`

**k6 :**
- Scripts créés : `tests/nfr/performance.k6.js`
- Nécessite installation : `choco install k6` (Windows)
- Commandes : `npm run test:performance:smoke` ou `npm run test:performance`

**Health Check :**
- Endpoint créé : `/api/health`
- Utilisable pour monitoring production (UptimeRobot, Pingdom)

---

## 💡 Conseils

1. **Mesurer avant/après** : Utiliser Lighthouse après chaque optimisation pour voir les gains
2. **Tester progressivement** : Ne pas tout faire d'un coup, tester après chaque étape
3. **Documenter** : Noter les gains obtenus pour chaque optimisation
4. **Prioriser** : Commencer par les problèmes critiques (Phase 1)

---

## 🎯 Résumé

**État actuel :**
- ✅ Tests & Qualité : Complétés par TEA
- ⚠️ Performance : Problèmes identifiés, optimisations à faire
- ✅ Monitoring : Configuré, prêt pour production

**Prochaine action :**
1. Résoudre problèmes critiques (Phase 1)
2. Optimisations quick wins (Phase 2)
3. Valider avec Lighthouse (Phase 3)

**Total estimé :** 8-12h pour optimisations complètes

---

**Bon courage avec les optimisations ! 🚀**
