# Analyse Performance Terminal + Plan d'Action

**Date :** 2026-01-28  
**Contexte :** Analyse des données de performance visibles dans le terminal après travail avec TEA

---

## 📊 Analyse des Données de Performance (Terminal)

### ⚠️ Problèmes Critiques Identifiés

#### 1. **MaxListenersExceededWarning** (Mémoire)
```
MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 
11 error listeners added to [BoundPool]. MaxListeners is 10.
```

**Impact :** Potentielle fuite mémoire, peut causer des ralentissements  
**Priorité :** HAUTE  
**Agent :** 🏗️ **Winston (Architect)** - Configuration Prisma/PostgreSQL

#### 2. **POST /api/auth/callback/credentials : 745ms** (Très Long)
```
POST /api/auth/callback/credentials 200 in 745ms (compile: 6ms, render: 740ms)
```

**Analyse :**
- Compile time : 6ms ✅ (normal)
- Render time : 740ms ❌ (très long !)
- Total : 745ms (acceptable mais render time suspect)

**Impact :** Expérience utilisateur dégradée à la connexion  
**Priorité :** HAUTE  
**Agent :** 💻 **Amelia (Dev)** - Optimisation authentification

#### 3. **GET /dashboard : 3.5s puis 2.2s** (Très Long)
```
GET /dashboard 200 in 3.5s (compile: 3.2s, render: 284ms)
GET /dashboard 200 in 2.2s (compile: 13ms, render: 2.2s)
```

**Analyse :**
- Première requête : compile 3.2s (normal pour cold start), render 284ms ✅
- Deuxième requête : compile 13ms ✅, render 2.2s ❌ (très long !)

**Impact :** Temps de chargement dashboard inacceptable (> 2s)  
**Priorité :** CRITIQUE  
**Agent :** 💻 **Amelia (Dev)** - Optimisation dashboard + lazy loading

### ✅ Points Positifs

- `/api/auth/providers` : 209ms ✅
- `/api/auth/csrf` : 31ms ✅
- `/api/auth/session` : 56ms ✅

---

## 🎯 Plan d'Action Priorisé

### Phase 1 : Problèmes Critiques (URGENT - 4-6h)

#### Tâche 1.1 : Corriger MaxListenersExceededWarning
- **Agent :** 🏗️ **Winston (Architect)**
- **Commande :** `/bmad/bmm/agents/architect` puis `CH` (Chat)
- **Action :**
  1. Analyser la configuration Prisma
  2. Vérifier le connection pooling
  3. Ajouter `setMaxListeners()` si nécessaire
  4. Optimiser la gestion des connexions PostgreSQL
- **Fichiers concernés :**
  - `src/lib/prisma.ts`
  - Configuration PostgreSQL
- **Durée estimée :** 30min - 1h
- **Impact :** Évite les fuites mémoire

#### Tâche 1.2 : Optimiser Render Time Dashboard (2.2s → < 500ms)
- **Agent :** 💻 **Amelia (Dev)**
- **Commande :** `/bmad/bmm/agents/dev` puis `CH` (Chat)
- **Action :**
  1. Analyser `src/app/(protected)/dashboard/page.tsx`
  2. Identifier les requêtes lentes (probablement Prisma queries)
  3. Optimiser les requêtes (select fields, indexes, joins)
  4. Ajouter pagination si liste longue
  5. Implémenter lazy loading pour composants lourds
  6. Vérifier les requêtes N+1
- **Fichiers concernés :**
  - `src/app/(protected)/dashboard/page.tsx`
  - Services utilisés par le dashboard
- **Durée estimée :** 2-3h
- **Impact :** Réduction temps chargement dashboard de 2.2s → < 500ms

#### Tâche 1.3 : Optimiser Authentification (740ms render → < 200ms)
- **Agent :** 💻 **Amelia (Dev)**
- **Commande :** `/bmad/bmm/agents/dev` puis `CH` (Chat)
- **Action :**
  1. Analyser `src/app/api/auth/callback/credentials/route.ts` (ou équivalent)
  2. Identifier la cause du render time élevé (740ms)
  3. Optimiser les requêtes Prisma
  4. Vérifier le hashage bcrypt (peut être lent)
  5. Ajouter cache si approprié
- **Fichiers concernés :**
  - Route API authentification
  - Service auth
- **Durée estimée :** 1-2h
- **Impact :** Réduction temps authentification de 740ms → < 200ms

---

### Phase 2 : Optimisations Quick Wins (4-6h)

#### Tâche 2.1 : Lazy Load Leaflet (Comme prévu dans guide)
- **Agent :** 💻 **Amelia (Dev)**
- **Commande :** `/bmad/bmm/agents/dev` puis `CH` (Chat)
- **Action :** Suivre guide `guide-optimisation-performance-mvp.md`
- **Gain estimé :** -200KB bundle initial
- **Durée estimée :** 1-2h

#### Tâche 2.2 : Dynamic Imports Composants Lourds
- **Agent :** 💻 **Amelia (Dev)**
- **Commande :** `/bmad/bmm/agents/dev` puis `CH` (Chat)
- **Action :** Suivre guide `guide-optimisation-performance-mvp.md`
- **Gain estimé :** Réduction bundle 30-50%
- **Durée estimée :** 2-3h

#### Tâche 2.3 : Configuration Next.js Optimisée
- **Agent :** 🏗️ **Winston (Architect)**
- **Commande :** `/bmad/bmm/agents/architect` puis `CH` (Chat)
- **Action :** Suivre guide `guide-optimisation-performance-mvp.md`
- **Durée estimée :** 30min - 1h

---

### Phase 3 : Mesure et Validation (1h)

#### Tâche 3.1 : Exécuter Lighthouse avec Config TEA
- **Agent :** 🧪 **Murat (TEA)** ou Manuel
- **Action :**
  1. Utiliser la config `.lighthouserc.json` créée par TEA
  2. Exécuter : `npx lighthouse-ci autorun` (si installé)
  3. Ou utiliser Lighthouse Chrome DevTools manuellement
  4. Comparer avant/après optimisations
- **Seuils configurés par TEA :**
  - Performance Score : ≥ 90
  - FCP : ≤ 2000ms
  - TTI : ≤ 3500ms
- **Durée estimée :** 30 min

#### Tâche 3.2 : Tests Performance k6 (Si k6 installé)
- **Agent :** 🧪 **Murat (TEA)** ou Manuel
- **Action :**
  1. Installer k6 (voir `tests/nfr/K6-INSTALLATION.md` si existe)
  2. Exécuter : `npm run test:performance:smoke` (smoke test)
  3. Analyser les résultats
- **Seuils configurés par TEA :**
  - Search p95 : < 1000ms
  - Payment p95 : < 5000ms
  - Check-in p95 : < 3000ms
- **Durée estimée :** 30 min

---

## 📋 Ordre d'Exécution Recommandé

```
1. Winston (Architect) → Corriger MaxListenersExceededWarning (30min-1h)
   ↓
2. Amelia (Dev) → Optimiser Dashboard render time (2-3h)
   ↓
3. Amelia (Dev) → Optimiser Authentification render time (1-2h)
   ↓
4. Amelia (Dev) → Lazy load Leaflet (1-2h)
   ↓
5. Amelia (Dev) → Dynamic imports composants lourds (2-3h)
   ↓
6. Winston (Architect) → Config Next.js optimisée (30min-1h)
   ↓
7. Murat (TEA) ou Manuel → Mesurer avec Lighthouse (30min)
   ↓
8. Murat (TEA) ou Manuel → Tests k6 si installé (30min)
```

**Total Phase 1-3 :** 8-12h de travail

---

## 🎯 Objectifs de Performance MVP

### Métriques Cibles (Basées sur Config TEA)

- **Performance Score Lighthouse :** ≥ 90
- **FCP (First Contentful Paint) :** ≤ 2000ms
- **TTI (Time to Interactive) :** ≤ 3500ms
- **Dashboard Load Time :** < 500ms (actuellement 2.2s)
- **Auth Callback Time :** < 200ms (actuellement 740ms)
- **Search API p95 :** < 1000ms
- **Payment API p95 :** < 5000ms
- **Check-in API p95 :** < 3000ms

---

## 🔍 Diagnostic Détaillé Dashboard (2.2s render)

### Causes Probables

1. **Requêtes Prisma non optimisées**
   - Select tous les champs au lieu de fields spécifiques
   - Requêtes N+1
   - Pas d'indexes sur colonnes fréquemment queryées

2. **Composants lourds chargés synchronement**
   - Leaflet (si présent)
   - Composants non lazy-loaded

3. **Données volumineuses**
   - Listes non paginées
   - Images non optimisées

### Actions de Diagnostic

**Avec Amelia (Dev) :**
1. Ajouter logging dans `dashboard/page.tsx`
2. Mesurer temps de chaque requête Prisma
3. Identifier la requête la plus lente
4. Optimiser cette requête en priorité

---

## 🔍 Diagnostic Détaillé Authentification (740ms render)

### Causes Probables

1. **Hashage bcrypt lent**
   - bcryptjs peut être lent (c'est normal pour sécurité)
   - Vérifier si hashage est fait à chaque requête (ne devrait pas)

2. **Requêtes Prisma multiples**
   - Vérification email
   - Vérification password
   - Création session
   - Toutes ces requêtes peuvent être optimisées

3. **Pas de cache**
   - Sessions non cachées
   - Vérifications répétées

### Actions de Diagnostic

**Avec Amelia (Dev) :**
1. Ajouter logging dans route auth
2. Mesurer temps de chaque étape (hash, query, session)
3. Identifier le bottleneck
4. Optimiser en conséquence

---

## 📝 Checklist d'Exécution

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
- [ ] Tests k6 si installé
- [ ] Documenter résultats avant/après

---

## 💡 Conseils d'Exécution

### Communication avec les Agents

**Pour Winston (Architect) - MaxListenersExceededWarning :**
```
"Je vois un MaxListenersExceededWarning dans le terminal lié à Prisma/PostgreSQL. 
Peux-tu analyser la configuration de connection pooling et corriger ce problème 
de fuite mémoire potentielle ?"
```

**Pour Amelia (Dev) - Dashboard :**
```
"Le dashboard prend 2.2s à charger (render time). Peux-tu analyser 
src/app/(protected)/dashboard/page.tsx, identifier les requêtes lentes, 
et optimiser pour réduire le temps de chargement à moins de 500ms ?"
```

**Pour Amelia (Dev) - Auth :**
```
"L'authentification prend 740ms (render time). Peux-tu analyser la route 
d'authentification, identifier pourquoi c'est si lent, et optimiser pour 
réduire à moins de 200ms ?"
```

---

## 🚀 Prochaines Étapes Immédiates

1. **Commencer par Phase 1** : Résoudre les problèmes critiques
2. **Mesurer après chaque optimisation** : Vérifier les gains
3. **Continuer avec Phase 2** : Quick wins une fois critiques résolus
4. **Valider avec Phase 3** : Utiliser les outils créés par TEA

---

**Bon courage avec les optimisations ! 🚀**
