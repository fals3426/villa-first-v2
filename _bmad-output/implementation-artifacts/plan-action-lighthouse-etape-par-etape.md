# Plan d'Action Lighthouse - Étape par Étape

**Date :** 2026-01-28  
**Objectif :** Améliorer le score Lighthouse Performance de 66 à ≥ 90

---

## 📋 Vue d'Ensemble

**Problèmes identifiés :**
- ❌ TBT (Total Blocking Time) : 8,83 s (cible : ≤ 0,2 s)
- ❌ TTI (Time to Interactive) : 34,2 s (cible : ≤ 3,5 s)
- ❌ Max Potential FID : 5,56 s (cible : ≤ 0,1 s)
- ⚠️ LCP : 2,69 s (cible : ≤ 2,5 s)

**Agents à utiliser :**
- 💻 **Amelia (Dev)** : Pour optimiser le code JavaScript et React
- 🏗️ **Winston (Architect)** : Pour la configuration Next.js et les optimisations système

---

## 🎯 Phase 1 : Optimisations Critiques (URGENT)

### Étape 1.1 : Analyser le Bundle JavaScript

**Agent :** 💻 **Amelia (Dev)**  
**Durée estimée :** 30-45 minutes  
**Priorité :** CRITIQUE

#### Instructions :

1. **Appeler l'agent :**
   ```
   /bmad/bmm/agents/dev
   ```

2. **Une fois l'agent activé, taper :**
   ```
   CH
   ```

3. **Copier-coller ce message exact :**
   ```
   Bonjour Amelia ! 

   J'ai un problème de performance critique : le JavaScript prend 10,7 secondes à démarrer, ce qui bloque le thread principal pendant 8,83 secondes (TBT).

   Peux-tu :
   1. Analyser la taille du bundle JavaScript en exécutant `npm run build`
   2. Identifier les plus gros chunks JavaScript
   3. Vérifier que Leaflet est bien lazy loaded dans `src/components/features/search/MapView.tsx`
   4. Identifier tous les composants lourds qui sont importés statiquement au lieu d'utiliser dynamic imports
   5. Me donner un rapport avec les fichiers à optimiser en priorité

   Merci !
   ```

4. **Attendre la réponse de l'agent et suivre ses instructions**

---

### Étape 1.2 : Optimiser le Bundle avec Dynamic Imports

**Agent :** 💻 **Amelia (Dev)**  
**Durée estimée :** 2-3 heures  
**Priorité :** CRITIQUE

#### Instructions :

1. **Appeler l'agent :**
   ```
   /bmad/bmm/agents/dev
   ```

2. **Une fois l'agent activé, taper :**
   ```
   CH
   ```

3. **Copier-coller ce message exact :**
   ```
   Bonjour Amelia !

   D'après l'analyse précédente, j'ai besoin d'optimiser le bundle JavaScript en implémentant des dynamic imports pour tous les composants lourds.

   Peux-tu :
   1. Convertir tous les imports statiques de composants lourds en dynamic imports avec `next/dynamic`
   2. Commencer par les composants identifiés dans l'analyse précédente
   3. Vérifier que chaque dynamic import utilise `{ ssr: false }` si le composant n'a pas besoin de SSR
   4. Ajouter des composants de chargement (loading states) pour une meilleure UX
   5. Vérifier que Leaflet est bien lazy loaded avec `dynamic(() => import(...), { ssr: false })`

   Fichiers à vérifier en priorité :
   - src/components/features/search/MapView.tsx
   - src/app/(protected)/dashboard/page.tsx
   - Tous les composants qui importent des bibliothèques lourdes (Leaflet, Chart.js, etc.)

   Merci !
   ```

4. **Attendre la réponse de l'agent et suivre ses instructions**

---

### Étape 1.3 : Réduire les Long Tasks avec React.memo

**Agent :** 💻 **Amelia (Dev)**  
**Durée estimée :** 2-3 heures  
**Priorité :** CRITIQUE

#### Instructions :

1. **Appeler l'agent :**
   ```
   /bmad/bmm/agents/dev
   ```

2. **Une fois l'agent activé, taper :**
   ```
   CH
   ```

3. **Copier-coller ce message exact :**
   ```
   Bonjour Amelia !

   J'ai 14 tâches JavaScript longues (> 50ms) qui bloquent le thread principal. Je dois optimiser les composants React pour réduire ces long tasks.

   Peux-tu :
   1. Identifier les composants qui se rendent au chargement initial de la page d'accueil
   2. Envelopper ces composants avec `React.memo` pour éviter les re-renders inutiles
   3. Utiliser `useMemo` pour les calculs coûteux
   4. Utiliser `useCallback` pour les fonctions passées en props
   5. Optimiser les composants du dashboard qui prennent 2,2s à charger
   6. Vérifier que les requêtes API non critiques sont déplacées après le premier render

   Fichiers à vérifier en priorité :
   - src/app/page.tsx (page d'accueil)
   - src/app/(protected)/dashboard/page.tsx
   - Tous les composants qui se rendent immédiatement

   Merci !
   ```

4. **Attendre la réponse de l'agent et suivre ses instructions**

---

### Étape 1.4 : Retirer le JavaScript Non Utilisé

**Agent :** 💻 **Amelia (Dev)**  
**Durée estimée :** 1-2 heures  
**Priorité :** HAUTE

#### Instructions :

1. **Appeler l'agent :**
   ```
   /bmad/bmm/agents/dev
   ```

2. **Une fois l'agent activé, taper :**
   ```
   CH
   ```

3. **Copier-coller ce message exact :**
   ```
   Bonjour Amelia !

   Lighthouse indique que 12,2 secondes de JavaScript pourraient être économisées en retirant le code non utilisé.

   Peux-tu :
   1. Analyser tous les fichiers pour identifier les imports non utilisés
   2. Supprimer tous les imports inutilisés
   3. Vérifier que le tree shaking fonctionne correctement dans Next.js
   4. Vérifier que les polyfills ne sont pas chargés inutilement
   5. Vérifier que les dépendances inutilisées sont supprimées de package.json

   Commande utile : `npm run build` pour voir la taille du bundle avant/après

   Merci !
   ```

4. **Attendre la réponse de l'agent et suivre ses instructions**

---

### ✅ Vérification Phase 1

**Après avoir complété les étapes 1.1 à 1.4 :**

1. **Reconstruire l'application :**
   ```bash
   npm run build
   ```

2. **Démarrer l'application :**
   ```bash
   npm run dev
   ```

3. **Re-tester avec Lighthouse :**
   - Ouvrir Chrome DevTools (F12)
   - Aller dans l'onglet "Lighthouse"
   - Sélectionner "Performance"
   - **IMPORTANT :** Tester en mode incognito pour éviter l'impact des extensions
   - Cliquer sur "Analyze page load"
   - Noter les nouveaux scores (TBT, TTI, Performance Score)

4. **Comparer les résultats :**
   - TBT devrait être < 1 s (idéalement < 0,2 s)
   - TTI devrait être < 10 s (idéalement < 3,5 s)
   - Performance Score devrait être ≥ 75 (idéalement ≥ 90)

**Si les résultats ne sont pas satisfaisants :** Revoir les étapes 1.2 et 1.3 avec l'agent Amelia.

---

## 🎯 Phase 2 : Optimisations Complémentaires (IMPORTANT)

### Étape 2.1 : Optimiser LCP (Largest Contentful Paint)

**Agent :** 💻 **Amelia (Dev)**  
**Durée estimée :** 1 heure  
**Priorité :** MOYENNE

#### Instructions :

1. **Appeler l'agent :**
   ```
   /bmad/bmm/agents/dev
   ```

2. **Une fois l'agent activé, taper :**
   ```
   CH
   ```

3. **Copier-coller ce message exact :**
   ```
   Bonjour Amelia !

   Le LCP (Largest Contentful Paint) est à 2,69 s, légèrement au-dessus de la cible de 2,5 s.

   Peux-tu :
   1. Identifier l'élément LCP sur la page d'accueil (probablement une image ou du texte)
   2. Si c'est une image : utiliser `next/image` avec `priority` pour la précharger
   3. Optimiser les images avec les formats modernes (WebP, AVIF)
   4. Précharger les ressources critiques (fonts, CSS)
   5. Vérifier que les fonts sont chargées avec `font-display: swap`

   Merci !
   ```

4. **Attendre la réponse de l'agent et suivre ses instructions**

---

### Étape 2.2 : Corriger l'Erreur de Hydration

**Agent :** 💻 **Amelia (Dev)**  
**Durée estimée :** 30 minutes - 1 heure  
**Priorité :** MOYENNE

#### Instructions :

1. **Appeler l'agent :**
   ```
   /bmad/bmm/agents/dev
   ```

2. **Une fois l'agent activé, taper :**
   ```
   CH
   ```

3. **Copier-coller ce message exact :**
   ```
   Bonjour Amelia !

   Lighthouse détecte une erreur de hydration React dans la console :
   "A tree hydrated but some attributes of the server rendered HTML didn't match the client properties."

   L'erreur mentionne `cz-shortcut-listen="true"` qui pourrait venir d'une extension Chrome, mais je veux m'assurer que notre code n'a pas de problèmes.

   Peux-tu :
   1. Vérifier tous les composants qui utilisent `Date.now()`, `Math.random()`, ou des conditions `typeof window !== 'undefined'` dans le rendu initial
   2. Corriger les différences serveur/client si trouvées
   3. Éviter d'utiliser `suppressHydrationWarning` sauf si absolument nécessaire
   4. Vérifier que les composants avec état utilisent `useEffect` pour les valeurs dynamiques

   Merci !
   ```

4. **Attendre la réponse de l'agent et suivre ses instructions**

---

### Étape 2.3 : Configurer les Source Maps

**Agent :** 🏗️ **Winston (Architect)**  
**Durée estimée :** 30 minutes  
**Priorité :** BASSE

#### Instructions :

1. **Appeler l'agent :**
   ```
   /bmad/bmm/agents/architect
   ```

2. **Une fois l'agent activé, taper :**
   ```
   CH
   ```

3. **Copier-coller ce message exact :**
   ```
   Bonjour Winston !

   Lighthouse indique que les source maps sont manquants pour le fichier main-app.js.

   Peux-tu :
   1. Configurer Next.js pour générer les source maps en développement
   2. Vérifier la configuration dans next.config.ts
   3. ⚠️ IMPORTANT : Ne pas exposer les source maps en production si le code contient des secrets
   4. Configurer les source maps uniquement pour le développement/staging

   Merci !
   ```

4. **Attendre la réponse de l'agent et suivre ses instructions**

---

### Étape 2.4 : Optimiser le Back-Forward Cache (bf-cache)

**Agent :** 🏗️ **Winston (Architect)**  
**Durée estimée :** 1-2 heures  
**Priorité :** BASSE

#### Instructions :

1. **Appeler l'agent :**
   ```
   /bmad/bmm/agents/architect
   ```

2. **Une fois l'agent activé, taper :**
   ```
   CH
   ```

3. **Copier-coller ce message exact :**
   ```
   Bonjour Winston !

   Lighthouse indique que le bf-cache est bloqué par 5 raisons :
   1. Un gestionnaire unload existe dans le frame principal
   2. Les WebSockets empêchent le bf-cache
   3. Cache-Control: no-store sur le document principal
   4. Cache-Control: no-store sur des requêtes JavaScript
   5. WebSocket utilisé avec Cache-Control: no-store

   Peux-tu :
   1. Identifier et retirer les gestionnaires `unload` si possible (utiliser `beforeunload` ou `pagehide` à la place)
   2. Évaluer si les WebSockets peuvent être initialisés après le chargement initial
   3. Ajuster les en-têtes Cache-Control pour permettre le bf-cache si approprié
   4. ⚠️ IMPORTANT : Vérifier que ces changements n'affectent pas la fonctionnalité de l'application

   Merci !
   ```

4. **Attendre la réponse de l'agent et suivre ses instructions**

---

## 🎯 Phase 3 : Corrections d'Accessibilité (RECOMMANDÉ)

### Étape 3.1 : Corriger le Contraste des Couleurs

**Agent :** 💻 **Amelia (Dev)**  
**Durée estimée :** 1 heure  
**Priorité :** MOYENNE

#### Instructions :

1. **Appeler l'agent :**
   ```
   /bmad/bmm/agents/dev
   ```

2. **Une fois l'agent activé, taper :**
   ```
   CH
   ```

3. **Copier-coller ce message exact :**
   ```
   Bonjour Amelia !

   Lighthouse détecte des problèmes de contraste de couleurs (score accessibilité : 78/100).

   Peux-tu :
   1. Identifier tous les éléments avec contraste insuffisant
   2. Ajuster les couleurs pour atteindre un ratio ≥ 4.5:1 pour le texte normal
   3. Ajuster les couleurs pour atteindre un ratio ≥ 3:1 pour le texte large
   4. Utiliser un outil de vérification de contraste pour valider
   5. Vérifier dans src/app/globals.css et tous les composants

   Merci !
   ```

4. **Attendre la réponse de l'agent et suivre ses instructions**

---

### Étape 3.2 : Ajouter des Noms aux Liens

**Agent :** 💻 **Amelia (Dev)**  
**Durée estimée :** 30 minutes  
**Priorité :** MOYENNE

#### Instructions :

1. **Appeler l'agent :**
   ```
   /bmad/bmm/agents/dev
   ```

2. **Une fois l'agent activé, taper :**
   ```
   CH
   ```

3. **Copier-coller ce message exact :**
   ```
   Bonjour Amelia !

   Lighthouse détecte des liens sans nom visible (accessibilité).

   Peux-tu :
   1. Identifier tous les liens sans texte visible
   2. Ajouter du texte visible ou des attributs `aria-label` appropriés
   3. Vérifier que tous les liens sont accessibles aux lecteurs d'écran

   Merci !
   ```

4. **Attendre la réponse de l'agent et suivre ses instructions**

---

### Étape 3.3 : Corriger les Autres Problèmes d'Accessibilité

**Agent :** 💻 **Amelia (Dev)**  
**Durée estimée :** 1 heure  
**Priorité :** MOYENNE-BASSE

#### Instructions :

1. **Appeler l'agent :**
   ```
   /bmad/bmm/agents/dev
   ```

2. **Une fois l'agent activé, taper :**
   ```
   CH
   ```

3. **Copier-coller ce message exact :**
   ```
   Bonjour Amelia !

   Lighthouse détecte d'autres problèmes d'accessibilité :
   - Un iframe sans titre
   - Un élément html dans un shadow DOM sans attribut lang
   - Des éléments cliquables trop petits (< 48x48px)

   Peux-tu :
   1. Ajouter un attribut `title` à l'iframe
   2. Vérifier que tous les éléments `<html>` ont `lang="fr"`
   3. Augmenter la taille des éléments cliquables ou ajouter du padding pour atteindre 48x48px minimum

   Merci !
   ```

4. **Attendre la réponse de l'agent et suivre ses instructions**

---

## ✅ Vérification Finale

**Après avoir complété toutes les phases :**

1. **Reconstruire l'application :**
   ```bash
   npm run build
   ```

2. **Démarrer l'application :**
   ```bash
   npm run dev
   ```

3. **Re-tester avec Lighthouse en mode incognito :**
   - Ouvrir Chrome en mode incognito (Ctrl+Shift+N)
   - Aller sur http://localhost:3000
   - Ouvrir Chrome DevTools (F12)
   - Aller dans l'onglet "Lighthouse"
   - Sélectionner "Performance", "Accessibility", "Best Practices"
   - Cliquer sur "Analyze page load"
   - Noter tous les scores

4. **Vérifier que les objectifs sont atteints :**
   - ✅ Performance Score : ≥ 90
   - ✅ FCP : ≤ 2,0 s
   - ✅ LCP : ≤ 2,5 s
   - ✅ TBT : ≤ 0,2 s
   - ✅ TTI : ≤ 3,5 s
   - ✅ CLS : ≤ 0,1
   - ✅ Accessibility Score : ≥ 90
   - ✅ Best Practices Score : ≥ 80

---

## 📊 Suivi des Progrès

### Tableau de Suivi

| Étape | Agent | Statut | Date | Notes |
|-------|-------|--------|------|-------|
| 1.1 - Analyser Bundle | Amelia | ⬜ À faire | | |
| 1.2 - Dynamic Imports | Amelia | ⬜ À faire | | |
| 1.3 - React.memo | Amelia | ⬜ À faire | | |
| 1.4 - Retirer JS non utilisé | Amelia | ⬜ À faire | | |
| **Vérification Phase 1** | | ⬜ À faire | | TBT < 1s, TTI < 10s |
| 2.1 - Optimiser LCP | Amelia | ⬜ À faire | | |
| 2.2 - Hydration Error | Amelia | ⬜ À faire | | |
| 2.3 - Source Maps | Winston | ⬜ À faire | | |
| 2.4 - bf-cache | Winston | ⬜ À faire | | |
| 3.1 - Contraste Couleurs | Amelia | ⬜ À faire | | |
| 3.2 - Noms Liens | Amelia | ⬜ À faire | | |
| 3.3 - Autres A11y | Amelia | ⬜ À faire | | |
| **Vérification Finale** | | ⬜ À faire | | Tous scores ≥ cibles |

**Légende :**
- ⬜ À faire
- 🟡 En cours
- ✅ Terminé
- ❌ Problème

---

## 💡 Conseils Importants

### Avant de Commencer

1. **Sauvegarder votre travail :**
   ```bash
   git add .
   git commit -m "Avant optimisations Lighthouse"
   ```

2. **Créer une branche pour les optimisations :**
   ```bash
   git checkout -b optimisations-lighthouse
   ```

### Pendant les Optimisations

1. **Tester après chaque étape** pour valider que tout fonctionne
2. **Ne pas tout faire d'un coup** - faire étape par étape
3. **Documenter les changements** dans les commits Git

### Après les Optimisations

1. **Comparer les résultats avant/après** avec Lighthouse
2. **Tester sur différentes pages** (accueil, dashboard, listings)
3. **Valider que toutes les fonctionnalités fonctionnent toujours**

---

## 🚨 En Cas de Problème

### Si une Optimisation Ne Fonctionne Pas

1. **Vérifier les erreurs dans la console** du navigateur
2. **Vérifier les logs du serveur** (terminal où `npm run dev` tourne)
3. **Revenir en arrière** avec Git si nécessaire :
   ```bash
   git checkout -- fichier-problematique.tsx
   ```

### Si les Scores Ne S'Améliorent Pas

1. **Re-tester en mode incognito** pour éviter l'impact des extensions
2. **Vérifier que les changements sont bien appliqués** (rebuild nécessaire)
3. **Consulter l'agent** pour des optimisations supplémentaires

---

## 📞 Commandes Rapides

### Appeler Amelia (Dev)
```
/bmad/bmm/agents/dev
```
Puis taper : `CH`

### Appeler Winston (Architect)
```
/bmad/bmm/agents/architect
```
Puis taper : `CH`

### Rebuild et Test
```bash
npm run build
npm run dev
```

### Test Lighthouse
1. Ouvrir Chrome en mode incognito
2. Aller sur http://localhost:3000
3. F12 → Lighthouse → Performance → Analyze page load

---

**Bon courage avec les optimisations ! 🚀**

Suivez les étapes une par une, testez régulièrement, et vous devriez voir des améliorations significatives des performances !
