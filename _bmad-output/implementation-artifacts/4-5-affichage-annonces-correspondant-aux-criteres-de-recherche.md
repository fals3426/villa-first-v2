# Story 4.5: Affichage annonces correspondant aux critères de recherche

Status: ready-for-dev

## Story

As a **système**  
I want **afficher les annonces correspondant aux critères de recherche**  
so that **les locataires voient uniquement les résultats pertinents**.

## Contexte fonctionnel (Epic 4)

- **FR couvert** :
  - **FR28**: Affichage annonces correspondant aux critères.
- Consolide toutes les stories de recherche/filtrage (4.1, 4.2, 4.3) en un système unifié.

## Acceptance Criteria

Basés sur `epics.md` (Story 4.5) :

1. **Filtrage combiné**
   - Given un locataire applique des critères de recherche (localisation, budget, vibes)  
   - When le système exécute la recherche  
   - Then seules les annonces **publiées** (`status = 'published'`) et correspondant à **tous** les critères sont affichées.  
   - And les annonces non publiées (`draft`) ne sont jamais affichées.

2. **Tri par pertinence**
   - Given des résultats sont trouvés  
   - When ils sont affichés  
   - Then ils sont triés par pertinence :
     - Annonces vérifiées en premier.  
     - Puis par score de complétude (décroissant).  
     - Puis par date de création (plus récentes en premier).

3. **Pagination**
   - Given il y a plus de résultats que la limite par page  
   - When les résultats sont affichés  
   - Then :
     - Les résultats sont paginés (ex: 20 annonces par page).  
     - Des contrôles de pagination sont disponibles (précédent/suivant, numéros de page).  
     - Le nombre total de résultats est affiché.

4. **Affichage des critères actifs**
   - Given des filtres sont appliqués  
   - When je consulte la page de résultats  
   - Then :
     - Les critères appliqués sont visibles (chips/tags montrant "Localisation: Canggu", "Budget: 700-1000€", etc.).  
     - Je peux supprimer individuellement chaque critère (clic sur X du chip).

5. **Performance**
   - Given je lance une recherche avec plusieurs filtres  
   - When le système traite la requête  
   - Then la recherche est performante (< 1 seconde selon NFR Performance).

## Tâches / Sous-tâches

### 1. Service de recherche unifié

- [ ] Dans `listing.service.ts`, créer/améliorer `searchListings(filters)` :
  - [ ] Paramètres :
    - `location?: string`  
    - `priceRange?: { min: number, max: number }`  
    - `vibes?: string[]`  
    - `page: number`, `limit: number`.  
  - [ ] Applique tous les filtres en AND.  
  - [ ] Filtre uniquement `status = 'published'`.  
  - [ ] Tri par pertinence (vérifiées → complétude → date).  
  - [ ] Retourne résultats paginés + total.

### 2. API de recherche complète

- [ ] Route `GET /api/listings/search` :
  - [ ] Query params combinés :
    - `location?: string`  
    - `minPrice?: number`, `maxPrice?: number`  
    - `vibes?: string[]`  
    - `page?: number`, `limit?: number`.  
  - [ ] Valide tous les paramètres via Zod.  
  - [ ] Appelle `listingService.searchListings`.  
  - [ ] Retourne `{ data: ListingDTO[], meta: { pagination: { page, limit, total }, timestamp } }`.

### 3. UI – affichage des critères actifs

- [ ] Composant `ActiveFilters` dans `components/features/search/ActiveFilters.tsx` :
  - [ ] Affiche des chips pour chaque filtre actif.  
  - [ ] Bouton X sur chaque chip pour supprimer le filtre.  
  - [ ] Met à jour l’URL en supprimant le paramètre correspondant.

### 4. UI – pagination

- [ ] Composant `Pagination` dans `components/ui/Pagination.tsx` (ou réutiliser shadcn/ui) :
  - [ ] Affiche les contrôles précédent/suivant.  
  - [ ] Affiche les numéros de page si nombre de pages raisonnable.  
  - [ ] Met à jour l’URL avec `?page=X`.

### 5. UI – compteur de résultats

- [ ] Dans `ListingList` ou la page de recherche :
  - [ ] Affiche "X annonces trouvées" (utilise `meta.pagination.total`).  
  - [ ] Met à jour dynamiquement quand les filtres changent.

### 6. Tests

- [ ] Services :
  - [ ] Filtrage combiné fonctionne (tous les critères en AND).  
  - [ ] Tri par pertinence correct.  
  - [ ] Pagination fonctionne.
- [ ] API :
  - [ ] Tous les query params validés.  
  - [ ] Performance < 1s.
- [ ] UI :
  - [ ] Critères actifs affichés et supprimables.  
  - [ ] Pagination fonctionne.  
  - [ ] Compteur de résultats correct.

## Dev Notes (guardrails techniques)

- Toujours filtrer `status = 'published'` côté backend (jamais exposer les `draft`).  
- Utiliser des index BDD sur les champs filtrés (`address`, `basePrice`, `status`, etc.) pour performance.  
- S’assurer que la pagination est cohérente entre les requêtes (pas de résultats dupliqués entre pages).

## Project Structure Notes

- Backend :
  - `src/server/services/listings/listing.service.ts` (méthode `searchListings` unifiée).  
  - `src/app/api/listings/search/route.ts`.
- Frontend :
  - `src/components/features/search/ActiveFilters.tsx`.  
  - `src/components/ui/Pagination.tsx`.  
  - Page de recherche (intègre tous les composants).

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 4, Story 4.5).  
- `_bmad-output/planning-artifacts/prd.md` (Search & Discovery, NFR Performance).  
- `_bmad-output/planning-artifacts/architecture.md` (Search flow, listing service, pagination patterns).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 4, Story 4.5)

### Completion Notes List

- [x] Story 4.5 détaillée, système de recherche unifié avec filtres combinés, tri et pagination.  
- [x] UX claire avec critères actifs et compteur de résultats.

### File List

- `_bmad-output/implementation-artifacts/4-5-affichage-annonces-correspondant-aux-criteres-de-recherche.md`.
