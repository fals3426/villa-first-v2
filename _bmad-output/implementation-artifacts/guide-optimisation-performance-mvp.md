# Guide d'Optimisation Performance - Finalisation MVP

**Date :** 2026-01-28  
**Objectif :** Réduire les temps de chargement et optimiser les performances pour finaliser la MVP

---

## 🎯 Vue d'Ensemble

Ce guide vous indique **quelle tâche effectuer**, **quel agent utiliser**, et **dans quel ordre** pour optimiser les performances de votre application.

---

## 📋 Plan d'Action Structuré

### Phase 1 : Mesure Initiale (30 min)

**Objectif :** Établir un baseline de performance avant optimisations

#### Tâche 1.1 : Mesurer les performances actuelles
- **Agent :** 🧪 **Murat (TEA - Master Test Architect)**
- **Commande :** `/bmad/bmm/agents/tea` puis `NR` (Non-Functional Requirements Assessment)
- **Action :** 
  - Exécuter Lighthouse sur les pages principales
  - Mesurer FCP, LCP, TTI
  - Analyser le bundle size
  - Documenter les métriques dans un rapport
- **Livrable :** Rapport de performance baseline
- **Durée estimée :** 30 min

**Pourquoi Murat ?** Il est spécialisé dans les tests de performance et les NFR (Non-Functional Requirements). Il saura mesurer correctement et identifier les problèmes.

---

### Phase 2 : Quick Wins - Optimisations Immédiates (4-6h)

#### Tâche 2.1 : Lazy Load Leaflet (Impact Élevé)
- **Agent :** 💻 **Amelia (Dev - Developer Agent)**
- **Commande :** `/bmad/bmm/agents/dev` puis `CH` (Chat) pour discuter de l'implémentation
- **Action :**
  1. Convertir `MapView.tsx` en composant lazy-loaded
  2. Utiliser `dynamic()` de Next.js avec `ssr: false`
  3. Ajouter un loading state approprié
  4. Tester que la carte fonctionne toujours correctement
- **Fichiers concernés :**
  - `src/components/features/search/MapView.tsx`
  - Pages qui utilisent MapView (probablement `src/app/(public)/listings/page.tsx`)
- **Gain estimé :** -200KB sur le bundle initial
- **Durée estimée :** 1-2h

**Pourquoi Amelia ?** C'est une tâche d'implémentation de code. Amelia suit le cycle red-green-refactor et s'assure que tout fonctionne.

#### Tâche 2.2 : Dynamic Imports pour Composants Lourds
- **Agent :** 💻 **Amelia (Dev)**
- **Commande :** `/bmad/bmm/agents/dev` puis `CH` (Chat)
- **Action :**
  1. Identifier les composants lourds à lazy load :
     - `ComparisonView` (comparaison d'annonces)
     - `ListingPhotosSection` (galerie photos)
     - `ListingCalendarSection` (calendrier)
     - `CheckInForm` (formulaire check-in)
  2. Convertir chaque composant en dynamic import
  3. Ajouter des loading states appropriés
  4. Tester chaque composant
- **Gain estimé :** Réduction du bundle initial de 30-50%
- **Durée estimée :** 2-3h

**Pourquoi Amelia ?** Même raison - implémentation de code avec tests.

#### Tâche 2.3 : Configuration Next.js Optimisée
- **Agent :** 🏗️ **Winston (Architect)**
- **Commande :** `/bmad/bmm/agents/architect` puis `CH` (Chat)
- **Action :**
  1. Analyser `next.config.ts` actuel
  2. Ajouter optimisations :
     - `optimizePackageImports` pour lucide-react et Radix UI
     - Configuration `compress: true`
     - Configuration `images` avec formats AVIF/WebP
     - Optimisations de bundle
  3. Vérifier compatibilité avec Serwist
  4. Documenter les changements
- **Fichiers concernés :**
  - `next.config.ts`
- **Gain estimé :** Amélioration générale des performances
- **Durée estimée :** 30min - 1h

**Pourquoi Winston ?** C'est une décision architecturale qui touche la configuration globale. Winston comprend les trade-offs et les implications.

---

### Phase 3 : Vérification et Mesure Post-Optimisation (1h)

#### Tâche 3.1 : Mesurer les gains de performance
- **Agent :** 🧪 **Murat (TEA)**
- **Commande :** `/bmad/bmm/agents/tea` puis `NR` (Non-Functional Requirements Assessment)
- **Action :**
  1. Ré-exécuter Lighthouse avec les mêmes paramètres
  2. Comparer avant/après :
     - Bundle size
     - FCP, LCP, TTI
     - Score Lighthouse Performance
  3. Créer un rapport comparatif
  4. Identifier s'il reste des optimisations nécessaires
- **Livrable :** Rapport comparatif avant/après
- **Durée estimée :** 30 min

#### Tâche 3.2 : Tests Fonctionnels
- **Agent :** 💻 **Amelia (Dev)**
- **Commande :** `/bmad/bmm/agents/dev` puis `CH` (Chat)
- **Action :**
  1. Tester manuellement chaque composant lazy-loaded
  2. Vérifier que les fonctionnalités marchent toujours
  3. Tester sur mobile (si possible)
  4. Documenter les résultats
- **Durée estimée :** 30 min

---

### Phase 4 : Optimisations Avancées (Optionnel - Post-MVP)

#### Tâche 4.1 : Bundle Analyzer
- **Agent :** 🏗️ **Winston (Architect)**
- **Commande :** `/bmad/bmm/agents/architect` puis `CH` (Chat)
- **Action :**
  1. Installer `@next/bundle-analyzer`
  2. Analyser le bundle pour identifier d'autres opportunités
  3. Proposer optimisations supplémentaires si nécessaire
- **Durée estimée :** 1h

#### Tâche 4.2 : Optimisation Images
- **Agent :** 💻 **Amelia (Dev)**
- **Commande :** `/bmad/bmm/agents/dev` puis `CH` (Chat)
- **Action :**
  1. Vérifier que toutes les images utilisent `next/image`
  2. Optimiser les formats (AVIF/WebP)
  3. Ajouter lazy loading si nécessaire
- **Durée estimée :** 1-2h

---

## 🗺️ Carte de Navigation des Agents

### Comment Appeler un Agent

**Format :** `/bmad/bmm/agents/[nom-agent]`

**Agents Disponibles :**

1. **💻 Amelia (Dev)** - `/bmad/bmm/agents/dev`
   - **Spécialité :** Implémentation de code, tests unitaires
   - **Quand l'utiliser :** Modifications de code, refactoring, implémentation de features
   - **Commandes utiles :** `CH` (Chat), `DS` (Dev Story), `CR` (Code Review)

2. **🏗️ Winston (Architect)** - `/bmad/bmm/agents/architect`
   - **Spécialité :** Architecture, configuration, décisions techniques
   - **Quand l'utiliser :** Configuration Next.js, décisions architecturales, optimisation infrastructure
   - **Commandes utiles :** `CH` (Chat), `CA` (Create Architecture), `IR` (Implementation Readiness)

3. **🧪 Murat (TEA)** - `/bmad/bmm/agents/tea`
   - **Spécialité :** Tests, performance, qualité
   - **Quand l'utiliser :** Mesures de performance, tests, validation NFR
   - **Commandes utiles :** `CH` (Chat), `NR` (NFR Assessment), `TF` (Test Framework)

4. **📊 Mary (Analyst)** - `/bmad/bmm/agents/analyst`
   - **Spécialité :** Analyse, planification, recommandations
   - **Quand l'utiliser :** Analyse de problèmes, planification, synthèse
   - **Commandes utiles :** `CH` (Chat), `RS` (Research), `PB` (Product Brief)

---

## 📝 Checklist d'Exécution

### Avant de Commencer
- [ ] Avoir accès au projet localement
- [ ] Avoir Node.js et npm installés
- [ ] Comprendre la structure du projet

### Phase 1 : Mesure
- [ ] Appeler Murat (TEA) pour mesurer baseline
- [ ] Documenter les métriques initiales
- [ ] Sauvegarder le rapport baseline

### Phase 2 : Optimisations
- [ ] Appeler Amelia (Dev) pour lazy load Leaflet
- [ ] Tester que la carte fonctionne
- [ ] Appeler Amelia (Dev) pour dynamic imports
- [ ] Tester chaque composant lazy-loaded
- [ ] Appeler Winston (Architect) pour config Next.js
- [ ] Vérifier que le build fonctionne toujours

### Phase 3 : Vérification
- [ ] Appeler Murat (TEA) pour mesurer après optimisations
- [ ] Comparer avant/après
- [ ] Appeler Amelia (Dev) pour tests fonctionnels
- [ ] Documenter les résultats

### Phase 4 : Optionnel
- [ ] Décider si Phase 4 est nécessaire pour MVP
- [ ] Si oui, continuer avec optimisations avancées

---

## 🎯 Ordre Recommandé d'Exécution

```
1. Murat (TEA) → Mesure baseline (30 min)
   ↓
2. Amelia (Dev) → Lazy load Leaflet (1-2h)
   ↓
3. Amelia (Dev) → Dynamic imports composants (2-3h)
   ↓
4. Winston (Architect) → Config Next.js (30min-1h)
   ↓
5. Murat (TEA) → Mesure post-optimisation (30 min)
   ↓
6. Amelia (Dev) → Tests fonctionnels (30 min)
   ↓
7. Décision : Phase 4 nécessaire pour MVP ?
```

**Total Phase 1-3 :** 5-7h de travail

---

## 💡 Conseils d'Utilisation

### Communication avec les Agents

1. **Soyez spécifique :** Donnez le contexte de la tâche
   - ❌ "Optimise les performances"
   - ✅ "Je veux lazy load le composant MapView qui utilise Leaflet pour réduire le bundle initial"

2. **Fournissez les fichiers concernés :** Mentionnez les chemins de fichiers
   - "Le fichier est dans `src/components/features/search/MapView.tsx`"

3. **Demandez des explications :** Si vous ne comprenez pas, demandez
   - "Peux-tu m'expliquer pourquoi cette approche est meilleure ?"

4. **Validez avant d'appliquer :** Demandez à voir le code avant de l'appliquer
   - "Peux-tu me montrer le code modifié avant de l'appliquer ?"

### Gestion des Erreurs

Si un agent rencontre une erreur :
1. Notez l'erreur exacte
2. Partagez le contexte (fichiers modifiés, commandes exécutées)
3. Demandez à l'agent de proposer une solution alternative
4. Si nécessaire, consultez Winston (Architect) pour une perspective plus large

---

## 📊 Métriques de Succès

### Objectifs MVP

- **Bundle initial :** < 500KB (actuellement probablement > 700KB avec Leaflet)
- **FCP (First Contentful Paint) :** < 1.8s
- **LCP (Largest Contentful Paint) :** < 2.5s
- **TTI (Time to Interactive) :** < 3.8s
- **Lighthouse Performance Score :** > 80

### Comment Mesurer

Utiliser Lighthouse dans Chrome DevTools :
1. Ouvrir DevTools (F12)
2. Onglet "Lighthouse"
3. Sélectionner "Performance"
4. Cliquer "Analyze page load"
5. Comparer les scores avant/après

---

## 🚀 Prochaines Étapes

1. **Commencez par Phase 1** : Mesurez le baseline avec Murat (TEA)
2. **Suivez l'ordre** : Respectez l'ordre des phases pour un impact maximal
3. **Mesurez régulièrement** : Vérifiez les gains après chaque optimisation
4. **Documentez** : Gardez une trace des changements et des résultats

---

## ❓ Questions Fréquentes

**Q : Puis-je sauter la Phase 1 (mesure baseline) ?**  
R : Non recommandé. Sans baseline, vous ne saurez pas si les optimisations ont fonctionné.

**Q : Dois-je faire toutes les optimisations de Phase 2 ?**  
R : Oui, elles sont toutes importantes et complémentaires. Lazy load Leaflet seul ne suffit pas.

**Q : Phase 4 est-elle nécessaire pour MVP ?**  
R : Probablement pas. Phase 1-3 devrait suffire pour une MVP performante. Phase 4 peut attendre post-MVP.

**Q : Que faire si une optimisation casse quelque chose ?**  
R : Revenez en arrière (git), documentez le problème, et consultez Winston (Architect) pour une solution alternative.

---

**Bon courage avec vos optimisations ! 🚀**
