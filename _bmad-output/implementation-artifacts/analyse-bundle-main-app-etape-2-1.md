# Analyse Bundle `main-app.js` - Étape 2.1

**Date :** 2026-01-28  
**Objectif :** Identifier pourquoi `main-app.js` fait 5.1 MB  
**Status :** ✅ Analyse complétée

---

## 📊 Résumé Exécutif

**Problème identifié :**
- `main-app.js` : **5.1 MB** (5,124,907 bytes)
- Impact : Bootup Time 1374ms, Script Evaluation 935ms, Long Task 1284ms

**Objectif :** Réduire le bundle à ≤ 2 MB (réduction de ~60%)

---

## 🔍 Dépendances Lourdes Identifiées

### 1. **Stripe** 🔴 CRITIQUE

**Fichiers concernés :**
- `src/components/features/booking/PaymentFlow.tsx` - Import statique de `@stripe/react-stripe-js` et `@stripe/stripe-js`

**Problème :**
- Stripe est une bibliothèque très lourde (~200-300KB minifiée)
- Chargée dans le bundle initial même si l'utilisateur ne fait pas de réservation
- Utilisé uniquement dans le flux de paiement

**Impact estimé :** ~200-300KB du bundle initial

**Action requise :**
- ✅ Vérifier si `PaymentFlow` est déjà lazy-loaded dans `BookingForm.tsx`
- Si non, convertir en dynamic import avec `ssr: false`

---

### 2. **date-fns** 🟡 IMPORTANT

**Fichiers concernés (9 fichiers) :**
- `src/components/features/chat/MaskedChat.tsx`
- `src/components/features/booking/HostBookingsList.tsx`
- `src/components/features/booking/BookingsList.tsx`
- `src/components/features/booking/BookingRequestCard.tsx`
- `src/components/features/booking/BookingForm.tsx`
- `src/components/admin/IncidentsList.tsx`
- `src/components/admin/IncidentDetail.tsx`
- `src/components/admin/AuditLogsList.tsx`
- `src/components/features/booking/PaymentFlow.tsx`

**Problème :**
- ✅ Déjà optimisé avec imports nommés (`import { format } from 'date-fns/format'`)
- Mais utilisé dans de nombreux composants qui sont peut-être chargés dans le bundle initial

**Impact estimé :** ~50-100KB si tous les composants sont chargés

**Action requise :**
- Vérifier que les composants admin sont lazy-loaded (ils ne devraient pas être dans le bundle initial)
- Vérifier que les composants booking sont lazy-loaded si possible

---

### 3. **react-day-picker** 🟡 À VÉRIFIER

**Status :** Utilisé dans le projet selon les documents

**Problème :**
- Bibliothèque de calendrier (~100-150KB)
- Utilisé probablement dans les formulaires de réservation/calendrier

**Impact estimé :** ~100-150KB si chargé dans le bundle initial

**Action requise :**
- Identifier où `react-day-picker` est utilisé
- Vérifier si le composant qui l'utilise est lazy-loaded

---

### 4. **Socket.IO Client** 🟢 FAIBLE PRIORITÉ

**Status :** ✅ Non utilisé actuellement (simulé dans `src/lib/socket.ts`)

**Problème :**
- `socket.io-client` est dans les dépendances mais pas encore utilisé
- Quand activé, devrait être lazy-loaded car uniquement nécessaire pour le chat

**Impact estimé :** ~100-150KB quand activé

**Action requise :**
- Pour l'instant, pas d'action nécessaire
- Quand Socket.IO sera activé, utiliser dynamic import dans `MaskedChat.tsx`

---

### 5. **Composants Admin** 🟡 IMPORTANT

**Fichiers concernés :**
- `src/components/admin/IncidentDetail.tsx`
- `src/components/admin/IncidentsList.tsx`
- `src/components/admin/AuditLogsList.tsx`
- `src/components/admin/DashboardStats.tsx` (si existe)

**Problème :**
- Composants admin chargés même pour les utilisateurs non-admin
- Utilisent `date-fns` de manière statique
- Ne devraient jamais être dans le bundle initial pour les utilisateurs normaux

**Impact estimé :** ~100-200KB selon les composants

**Action requise :**
- ✅ Vérifier que les pages admin utilisent `next/dynamic` pour lazy-load ces composants
- Si non, convertir en dynamic imports avec `ssr: false`

---

### 6. **@radix-ui/* Components** 🟢 DÉJÀ OPTIMISÉ

**Status :** ✅ Déjà optimisé avec `optimizePackageImports` dans `next.config.ts`

**Action requise :** Aucune action nécessaire

---

### 7. **Leaflet / react-leaflet** 🟢 DÉJÀ OPTIMISÉ

**Status :** ✅ Déjà lazy-loaded dans `MapViewContent.tsx`

**Action requise :** Aucune action nécessaire

---

## 🎯 Plan d'Action Prioritaire

### Phase 2.1 : Vérifications et Corrections Immédiates

#### ✅ Actions Complétées
1. ✅ Build réussi après corrections TypeScript
2. ✅ Bundle analyzer configuré et exécuté
3. ✅ Analyse des imports statiques effectuée

#### 🔴 Actions Prioritaires (À Faire)

**1. Vérifier et Optimiser PaymentFlow (Stripe)**
- [ ] Vérifier si `PaymentFlow` est lazy-loaded dans `BookingForm.tsx`
- [ ] Si non, convertir en dynamic import
- **Impact estimé :** -200-300KB

**2. Vérifier et Optimiser Composants Admin**
- [ ] Vérifier que les pages admin utilisent `next/dynamic`
- [ ] Convertir les composants admin en dynamic imports si nécessaire
- **Impact estimé :** -100-200KB

**3. Vérifier react-day-picker**
- [ ] Identifier où `react-day-picker` est utilisé
- [ ] Vérifier si le composant parent est lazy-loaded
- **Impact estimé :** -100-150KB

**4. Analyser le Rapport Bundle Analyzer**
- [ ] Ouvrir `.next/analyze/client.html` dans le navigateur
- [ ] Identifier les plus gros modules dans le bundle
- [ ] Prioriser les optimisations selon la taille réelle

---

## 📊 Estimation des Gains Totaux

### Avant Optimisations
- **Bundle initial :** 5.1 MB
- **TBT :** 1234ms
- **TTI :** 5867ms

### Après Optimisations Prioritaires (Estimation)

**Gains estimés :**
1. **PaymentFlow (Stripe)** : -200-300KB
2. **Composants admin lazy loaded** : -100-200KB
3. **react-day-picker optimisé** : -100-150KB
4. **Autres optimisations** : -100-200KB

**Total estimé :** -500-850KB du bundle initial

**Résultat attendu :**
- **Bundle initial :** ~4.2-4.6 MB (réduction ~10-18%)
- **TBT estimé :** 1000-1100ms (réduction ~10-20%)
- **TTI estimé :** 5000-5500ms (réduction ~10-15%)

**Note :** Ces estimations sont conservatrices. L'analyse du rapport bundle analyzer révélera les vrais coupables.

---

## 🔍 Prochaines Étapes

### Étape 2.2 : Analyser le Rapport Bundle Analyzer

**Action immédiate :**
1. Ouvrir `.next/analyze/client.html` dans le navigateur
2. Identifier les modules les plus volumineux
3. Créer une liste prioritaire des optimisations basée sur la taille réelle

**Outils disponibles :**
- ✅ Bundle analyzer configuré : `npm run analyze`
- ✅ Rapports générés dans `.next/analyze/`

---

## 📝 Notes Techniques

### Configuration Bundle Analyzer

**Fichier :** `next.config.ts`
```typescript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
```

**Script :** `package.json`
```json
"analyze": "cross-env ANALYZE=true next build --webpack"
```

**Utilisation :**
```bash
npm run analyze
```

Les rapports sont générés dans `.next/analyze/` :
- `client.html` - Bundle client (le plus important pour `main-app.js`)
- `nodejs.html` - Bundle serveur
- `edge.html` - Bundle edge

---

## ✅ Checklist Phase 2.1

- [x] Build réussi sans erreurs
- [x] Bundle analyzer installé et configuré
- [x] Analyse des imports statiques effectuée
- [x] Dépendances lourdes identifiées
- [x] Plan d'action créé
- [ ] Rapport bundle analyzer analysé (action suivante)
- [ ] Optimisations prioritaires appliquées (étape 2.2)

---

**Prochaine étape :** Analyser le rapport bundle analyzer (`client.html`) pour identifier les modules les plus volumineux et créer un plan d'optimisation précis.
