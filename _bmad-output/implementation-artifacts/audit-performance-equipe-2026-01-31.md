# Audit Performance — Équipe BMAD

**Date :** 2026-01-31  
**Contexte :** Retour utilisateur — application lente, navigation fluide à améliorer  
**Agents :** Winston (Architecte), Murat (TEA), Amelia (Dev)

---

## Résumé Exécutif

L'équipe a identifié **4 axes majeurs** de lenteur :

| Axe | Priorité | Impact estimé |
|-----|----------|---------------|
| Bundle JS trop lourd | Critique | 5+ MB → objectif ≤ 2 MB |
| Render time pages (Dashboard ~2.2s) | Critique | UX dégradée |
| Auth callback lent (~740ms) | Haute | Connexion lente |
| Navigation / Layout waterfall | Haute | Transitions perçues lentes |

---

## 1. Bundle JS (Winston)

### Problèmes identifiés
- **main-app.js** : ~5.1 MB (objectif : ≤ 2 MB)
- **Stripe** : ~200–300 KB chargé trop tôt (dynamic import déjà en place pour PaymentFlow)
- **Leaflet** : carte — vérifier lazy load
- **react-day-picker** : ~100–150 KB (présent dans package.json)
- **Composants admin** : chargés même pour non-admin si pas bien isolés

### Actions recommandées
1. Lancer `npm run analyze` pour visualiser le bundle
2. Vérifier que Stripe, Leaflet, react-day-picker sont bien en dynamic import
3. Isoler les routes admin (`/admin/*`) avec layouts séparés
4. Revoir les imports de `date-fns` (déjà optimisés en named imports)

---

## 2. Render Time Pages (Amelia)

### Problèmes identifiés
- **GET /dashboard** : render ~2.2s (après cold start)
- **POST /api/auth/callback/credentials** : render ~740ms
- Cause probable : requêtes Prisma en série, N+1, ou absence d’index

### Actions recommandées
1. Analyser les requêtes du dashboard (Prisma)
2. Réduire les `include` / `select` aux champs nécessaires
3. Paralléliser les appels si possible (`Promise.all`)
4. Vérifier les index Prisma sur les colonnes filtrées

---

## 3. Navigation / Layout (Winston)

### Problèmes identifiés
- **Protected layout** : `getServerSession` bloque le rendu à chaque navigation
- **MainNavigation** + **MobileBottomNavigation** : toujours rendus
- **Middleware** : `withAuth` sur certaines routes — impact à mesurer
- Pas de prefetch systématique sur les liens critiques

### Actions recommandées
1. Vérifier que le middleware ne matche que les routes protégées
2. Utiliser `next/link` avec prefetch par défaut (activé)
3. Évaluer un layout plus léger pour les pages publiques
4. Éviter les re-fetches inutiles de session

---

## 4. Autres leviers (Murat)

### Tests & monitoring
- Lancer Lighthouse (Performance, LCP, FID, CLS)
- Configurer K6 ou Artillery pour les APIs
- Monitorer les Core Web Vitals en production

### Checklist rapide
- [ ] `npm run analyze` exécuté
- [ ] Lighthouse sur `/`, `/dashboard`, `/listings`
- [ ] Vérification dynamic imports (Stripe, Leaflet, admin)
- [ ] Optimisation requêtes dashboard
- [ ] Correction MaxListenersExceededWarning (Prisma)

---

## Plan d’action priorisé

| Phase | Tâche | Durée estimée |
|-------|-------|---------------|
| 1 | Lancer `npm run analyze` + documenter résultats | 15 min |
| 2 | Optimiser requêtes dashboard (render 2.2s → <500ms) | 2–3 h |
| 3 | Vérifier/corriger tous les dynamic imports | 1 h |
| 4 | Corriger MaxListenersExceededWarning (Prisma) | 30 min |
| 5 | Audit Lighthouse + corrections ciblées | 1–2 h |

---

*Document généré dans le cadre du Party Mode — Audit Performance.*
