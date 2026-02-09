# Story 4.6: Comparaison de plusieurs annonces

Status: ready-for-dev

## Story

As a **locataire**  
I want **comparer plusieurs annonces (photos, vidéos, détails)**  
so that **je peux faire un choix éclairé entre différentes options**.

## Contexte fonctionnel (Epic 4)

- **FR couvert** :
  - **FR29**: Comparaison de plusieurs annonces.
- Story finale de l’Epic 4, permettant aux locataires de comparer côte à côte plusieurs options.

## Acceptance Criteria

Basés sur `epics.md` (Story 4.6) :

1. **Sélection d’annonces à comparer**
   - Given je suis sur la page de recherche/liste des annonces  
   - When je sélectionne plusieurs annonces pour comparaison  
   - Then :
     - Je peux ajouter/supprimer des annonces de la sélection (checkbox ou bouton "Comparer").  
     - La sélection est visible (badge avec nombre d’annonces sélectionnées).

2. **Vue de comparaison**
   - Given j’ai sélectionné au moins 2 annonces  
   - When j’accède à la vue de comparaison  
   - Then je peux voir côte à côte les informations clés :
     - Photos principales  
     - Prix  
     - Localisation  
     - Vibes (tags)  
     - Badge vérifié  
     - Score de complétude (optionnel).

3. **Accès depuis différentes vues**
   - Given je suis sur la liste ou le détail d’une annonce  
   - When je veux comparer  
   - Then :
     - La vue de comparaison est accessible depuis la liste (bouton "Comparer X annonces").  
     - Je peux ajouter une annonce à la comparaison depuis son détail (bouton "Ajouter à la comparaison").

4. **Navigation depuis la comparaison**
   - Given je suis sur la vue de comparaison  
   - When je veux voir plus de détails  
   - Then je peux cliquer sur une annonce pour accéder à son détail complet.  
   - And je reviens à la comparaison après consultation du détail (navigation préservée).

5. **Persistance temporaire**
   - Given j’ai sélectionné des annonces pour comparaison  
   - When je navigue ailleurs puis reviens  
   - Then la sélection est sauvegardée temporairement (session storage) pour que je puisse y revenir.  
   - And la sélection est perdue à la fermeture du navigateur (pas de persistance long terme).

6. **Responsive mobile**
   - Given j’utilise un appareil mobile  
   - When j’accède à la vue de comparaison  
   - Then la vue est responsive :
     - Scroll horizontal si nécessaire pour voir toutes les annonces.  
     - Layout adapté pour petits écrans (empilement vertical ou carrousel).

## Tâches / Sous-tâches

### 1. Gestion de l’état de comparaison

- [ ] Créer un hook `useComparison` dans `hooks/useComparison.ts` :
  - [ ] Gère la liste des IDs d’annonces sélectionnées.  
  - [ ] Persiste dans `sessionStorage`.  
  - [ ] Méthodes : `addToListing(id)`, `removeFromListing(id)`, `clearComparison()`.

### 2. Service de récupération des annonces comparées

- [ ] Dans `listing.service.ts`, ajouter `getListingsByIds(ids: string[])` :
  - [ ] Retourne les listings avec données minimales nécessaires pour comparaison.  
  - [ ] Filtre uniquement les `published`.

### 3. API – récupération annonces comparées

- [ ] Route `POST /api/listings/compare` ou `GET /api/listings/compare?ids=id1,id2,id3` :
  - [ ] Accepte une liste d’IDs.  
  - [ ] Retourne les listings avec données optimisées pour comparaison.  
  - [ ] Limite le nombre max d’annonces comparables (ex: 5) pour éviter surcharge.

### 4. UI – sélection dans la liste

- [ ] Dans `ListingCard` :
  - [ ] Ajouter une checkbox ou bouton "Comparer" (selon UX).  
  - [ ] Utilise `useComparison` pour ajouter/supprimer de la sélection.  
  - [ ] Indique visuellement si l’annonce est sélectionnée.

### 5. UI – badge de sélection

- [ ] Composant `ComparisonBadge` dans `components/features/search/ComparisonBadge.tsx` :
  - [ ] Affiche le nombre d’annonces sélectionnées.  
  - [ ] Bouton "Comparer X annonces" qui mène à la vue de comparaison.  
  - [ ] Visible en sticky ou dans le header de la page de recherche.

### 6. UI – vue de comparaison

- [ ] Page `app/(public)/listings/compare/page.tsx` :
  - [ ] Server Component qui charge les annonces via API.  
  - [ ] Affiche un composant client `ComparisonView` dans `components/features/listings/ComparisonView.tsx` :
    - [ ] Layout en colonnes (une par annonce).  
    - [ ] Affiche les informations clés alignées.  
    - [ ] Responsive : scroll horizontal sur mobile ou empilement vertical.

### 7. UI – accès depuis détail

- [ ] Dans `ListingDetail` :
  - [ ] Bouton "Ajouter à la comparaison" (si pas déjà sélectionnée).  
  - [ ] Utilise `useComparison` pour ajouter.

### 8. Tests

- [ ] Hooks :
  - [ ] `useComparison` persiste correctement dans `sessionStorage`.  
  - [ ] Ajout/suppression fonctionne.
- [ ] Services :
  - [ ] `getListingsByIds` retourne uniquement les `published`.  
  - [ ] Limite max respectée.
- [ ] UI :
  - [ ] Sélection visible dans la liste.  
  - [ ] Vue de comparaison affiche correctement les données.  
  - [ ] Responsive mobile fonctionne.

## Dev Notes (guardrails techniques)

- Limiter le nombre d’annonces comparables (ex: 5 max) pour éviter surcharge UI et API.  
- Optimiser les données retournées pour la comparaison (moins de détails que le détail complet).  
- Utiliser `sessionStorage` plutôt que `localStorage` pour la persistance temporaire (conforme aux AC).

## Project Structure Notes

- Backend :
  - `src/server/services/listings/listing.service.ts` (méthode `getListingsByIds`).  
  - `src/app/api/listings/compare/route.ts`.
- Frontend :
  - `src/hooks/useComparison.ts`.  
  - `src/components/features/search/ComparisonBadge.tsx`.  
  - `src/components/features/listings/ComparisonView.tsx`.  
  - `src/app/(public)/listings/compare/page.tsx`.  
  - `src/components/features/listings/ListingCard.tsx` (ajout checkbox/bouton comparer).  
  - `src/components/features/listings/ListingDetail.tsx` (bouton ajouter à comparaison).

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 4, Story 4.6).  
- `_bmad-output/planning-artifacts/prd.md` (Search & Discovery, comparaison).  
- `_bmad-output/planning-artifacts/architecture.md` (state management, session storage patterns).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 4, Story 4.6)

### Completion Notes List

- [x] Story 4.6 détaillée, comparaison d’annonces avec sélection, vue côte à côte et persistance session.  
- [x] Responsive mobile et navigation fluide depuis différentes vues.

### File List

- `_bmad-output/implementation-artifacts/4-6-comparaison-de-plusieurs-annonces.md`.
