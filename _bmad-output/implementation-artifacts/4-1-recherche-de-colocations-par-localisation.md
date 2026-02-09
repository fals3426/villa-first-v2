# Story 4.1: Recherche de colocations par localisation

Status: ready-for-dev

## Story

As a **locataire**  
I want **rechercher des colocations par localisation**  
so that **je peux trouver des colocs dans la zone qui m'intéresse**.

## Contexte fonctionnel (Epic 4)

- **Epic 4 – Recherche & Découverte de Colocations**  
  Les locataires peuvent rechercher, filtrer et découvrir des colocations qui correspondent à leurs critères (budget, localisation, vibes).
- **FR couvert** :
  - **FR24**: Recherche par localisation.
- Story de base pour la découverte d’annonces, utilisée par toutes les autres stories de recherche/filtrage.

## Acceptance Criteria

Basés sur `epics.md` (Story 4.1) :

1. **Interface de recherche**
   - Given je suis sur la page de recherche/liste des annonces  
   - When j’accède à la page  
   - Then je vois un champ de recherche pour la localisation (input texte ou autocomplete).

2. **Recherche textuelle**
   - Given je saisis une localisation (ville, quartier, zone comme "Canggu", "Ubud", etc.)  
   - When je lance la recherche (bouton ou auto-submit)  
   - Then :
     - La recherche fonctionne avec recherche textuelle sur le champ `address`/`location` des annonces.  
     - Les résultats correspondant à cette localisation sont affichés.

3. **Tri par pertinence**
   - Given des résultats sont trouvés  
   - When ils sont affichés  
   - Then ils sont triés par pertinence :
     - Annonces vérifiées en premier (badge vérifié).  
     - Puis par score de complétude (décroissant).  
     - Puis par date de création (plus récentes en premier).

4. **Feedback utilisateur**
   - Given la recherche s’exécute  
   - When les résultats sont disponibles  
   - Then :
     - Le nombre total de résultats est affiché.  
     - Si aucun résultat, un message clair est affiché avec suggestions (ex: "Aucune annonce trouvée pour 'X'. Essayez 'Y' ou explorez toutes les annonces.").

5. **Performance**
   - Given je lance une recherche  
   - When le système traite la requête  
   - Then la recherche est performante (< 1 seconde selon NFR Performance).

## Tâches / Sous-tâches

### 1. Service de recherche

- [ ] Dans `listing.service.ts`, ajouter une méthode `searchListingsByLocation(query, filters?)` :
  - [ ] Recherche textuelle sur `address`/`location` (LIKE ou recherche full-text selon BDD).  
  - [ ] Filtre uniquement les annonces `status = 'published'` (jamais les `draft`).  
  - [ ] Applique le tri par pertinence (vérifiées → complétude → date).  
  - [ ] Retourne un DTO paginé.

### 2. API de recherche

- [ ] Route `GET /api/listings/search` :
  - [ ] Query params :
    - `location?: string` (recherche textuelle).  
    - `page?: number`, `limit?: number` (pagination, défaut 20).  
  - [ ] Appelle `listingService.searchListingsByLocation`.  
  - [ ] Réponse standard `{ data: ListingDTO[], meta: { pagination: { page, limit, total }, timestamp } }`.

### 3. UI – champ de recherche

- [ ] Page `app/(public)/listings/page.tsx` ou `app/page.tsx` :
  - [ ] Server Component qui lit les query params (`?location=...`).  
  - [ ] Affiche un composant client `SearchBar` dans `components/features/search/SearchBar.tsx` :
    - [ ] Input texte avec placeholder "Rechercher par localisation (ex: Canggu, Ubud...)".  
    - [ ] Bouton "Rechercher" ou auto-submit au changement.  
    - [ ] Met à jour l’URL avec query params (pour partage/bookmark).

### 4. UI – affichage résultats

- [ ] Composant `ListingList` dans `components/features/listings/ListingList.tsx` :
  - [ ] Affiche les résultats paginés.  
  - [ ] Affiche le nombre total ("X annonces trouvées").  
  - [ ] Affiche un message "Aucun résultat" si vide avec suggestions.  
  - [ ] Utilise `ListingCard` pour chaque annonce (réutilise Story 2.2 pour badge vérifié).

### 5. Tests

- [ ] Services :
  - [ ] Recherche textuelle fonctionne (cas partiels, accents, etc.).  
  - [ ] Tri par pertinence correct.  
  - [ ] Pagination fonctionne.
- [ ] API :
  - [ ] Query params validés.  
  - [ ] Performance < 1s sur dataset réaliste.
- [ ] UI :
  - [ ] Recherche déclenche bien l’affichage des résultats.  
  - [ ] Message "aucun résultat" affiché correctement.

## Dev Notes (guardrails techniques)

- Utiliser des index BDD sur `address`/`location` pour performance.  
- Ne jamais exposer les annonces `draft` dans les résultats publics.  
- Respecter le format de réponse API standardisé (`{ data, meta }`).

## Project Structure Notes

- Backend :
  - `src/server/services/listings/listing.service.ts` (méthode de recherche).  
  - `src/app/api/listings/search/route.ts`.
- Frontend :
  - `src/app/(public)/listings/page.tsx` ou `src/app/page.tsx`.  
  - `src/components/features/search/SearchBar.tsx`.  
  - `src/components/features/listings/ListingList.tsx`.

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 4, Story 4.1).  
- `_bmad-output/planning-artifacts/prd.md` (Search & Discovery, NFR Performance).  
- `_bmad-output/planning-artifacts/architecture.md` (Search flow, listing service).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 4, Story 4.1)

### Completion Notes List

- [x] Story 4.1 détaillée, recherche textuelle avec tri par pertinence.  
- [x] Performance et UX claire pour l’utilisateur.

### File List

- `_bmad-output/implementation-artifacts/4-1-recherche-de-colocations-par-localisation.md`.
