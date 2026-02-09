# Story 4.3: Filtrage des annonces par vibes

Status: ready-for-dev

## Story

As a **locataire**  
I want **filtrer les annonces par vibes (critères de matching)**  
so that **je trouve des colocs qui correspondent à mon style de vie**.

## Contexte fonctionnel (Epic 4)

- **FR couvert** :
  - **FR26**: Filtrage par vibes.
- Utilise les préférences vibes définies dans l’onboarding locataire (Story 1.5) et les règles/charte des annonces (Story 3.6).

## Acceptance Criteria

Basés sur `epics.md` (Story 4.3) :

1. **Interface de sélection vibes**
   - Given je suis sur la page de recherche/liste des annonces  
   - When j’accède aux filtres  
   - Then je peux sélectionner des critères de vibes :
     - Télétravail  
     - Yoga  
     - Calme  
     - Festif  
     - Sportif  
     - Etc. (liste à définir avec UX).
   - And je peux sélectionner plusieurs vibes simultanément (multi-select).

2. **Matching avec préférences utilisateur**
   - Given j’ai défini mes préférences vibes dans mon profil (Story 1.5)  
   - When j’accède aux filtres  
   - Then mes préférences sont pré-remplies dans le filtre (optionnel, UX à valider).  
   - And le matching se fait entre mes préférences et les vibes de l’annonce (règles/charte).

3. **Application du filtre**
   - Given je sélectionne des vibes  
   - When je valide ou modifie la sélection  
   - Then :
     - Les annonces correspondant à ces vibes sont affichées.  
     - Les résultats sont mis à jour en temps réel.

4. **Mise en évidence des correspondances**
   - Given des résultats sont affichés  
   - When une annonce correspond aux vibes sélectionnés  
   - Then les vibes correspondants sont mis en évidence sur chaque carte d’annonce (badges/tags visibles).

5. **Feedback si aucun match**
   - Given aucun résultat ne correspond aux vibes sélectionnés  
   - When les résultats sont vides  
   - Then un message suggère d’ajuster les filtres ("Aucune annonce ne correspond à ces vibes. Essayez d’enlever certains critères.").

## Tâches / Sous-tâches

### 1. Modèle de données vibes

- [ ] S’assurer que les vibes sont stockés :
  - Côté utilisateur : `User.vibesPreferences` (déjà créé en Story 1.5).  
  - Côté annonce : `Listing.houseRules` ou champ dédié `vibes: Json` (Story 3.6).
- [ ] Définir un enum ou liste standardisée de vibes (ex: `TELEWORK`, `YOGA`, `QUIET`, `PARTY`, `SPORT`, etc.).

### 2. Service de matching vibes

- [ ] Créer `vibes.service.ts` dans `server/services/listings/` ou intégrer dans `listing.service.ts` :
  - [ ] Fonction `matchListingsByVibes(listings, selectedVibes)` :
    - Compare les vibes sélectionnés avec les vibes de chaque annonce.  
    - Retourne les listings correspondants + score de match (optionnel pour tri).
- [ ] Intégrer dans `searchListings` pour combiner avec autres filtres.

### 3. API – filtre vibes

- [ ] Étendre `GET /api/listings/search` :
  - [ ] Query param `vibes?: string[]` (ex: `?vibes=TELEWORK,YOGA`).  
  - [ ] Valide via Zod que les vibes sont dans la liste autorisée.

### 4. UI – composant filtre vibes

- [ ] Composant `VibesFilter` dans `components/features/vibes/VibesFilter.tsx` :
  - [ ] Multi-select avec checkboxes ou tags cliquables.  
  - [ ] Affiche les vibes disponibles avec icônes si possible.  
  - [ ] Pré-remplit depuis `user.vibesPreferences` si disponible (optionnel).  
  - [ ] Met à jour les query params.

### 5. UI – affichage correspondances

- [ ] Dans `ListingCard` :
  - [ ] Affiche les tags vibes de l’annonce.  
  - [ ] Met en évidence (couleur/bold) les vibes qui correspondent aux filtres actifs.

### 6. Tests

- [ ] Services :
  - [ ] Matching vibes fonctionne (AND ou OR selon règles métier).  
  - [ ] Combinaison avec autres filtres.
- [ ] API :
  - [ ] Validation des vibes autorisés.  
- [ ] UI :
  - [ ] Multi-select fonctionne.  
  - [ ] Mise en évidence des correspondances visible.

## Dev Notes (guardrails techniques)

- Normaliser les clés de vibes pour éviter les incohérences (utiliser un enum TypeScript partagé).  
- Penser à la performance si matching complexe (indexer les vibes en BDD si nécessaire).

## Project Structure Notes

- Backend :
  - `src/server/services/listings/vibes.service.ts` ou intégré dans `listing.service.ts`.  
  - `src/app/api/listings/search/route.ts` (query param `vibes`).
- Frontend :
  - `src/components/features/vibes/VibesFilter.tsx`.  
  - `src/components/features/listings/ListingCard.tsx` (affichage tags vibes).

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 4, Story 4.3 + Epic 1 Story 1.5 pour onboarding vibes).  
- `_bmad-output/planning-artifacts/prd.md` (Search & Discovery, vibes matching).  
- `_bmad-output/planning-artifacts/architecture.md` (vibes system, search flow).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 4, Story 4.3)

### Completion Notes List

- [x] Story 4.3 détaillée, matching vibes avec multi-select et mise en évidence.  
- [x] Intégration avec préférences utilisateur et règles annonces.

### File List

- `_bmad-output/implementation-artifacts/4-3-filtrage-des-annonces-par-vibes.md`.
