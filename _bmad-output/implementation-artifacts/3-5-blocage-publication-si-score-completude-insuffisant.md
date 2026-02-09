# Story 3.5: Blocage publication si score complétude insuffisant

Status: ready-for-dev

## Story

As a **système**  
I want **bloquer la publication d'une annonce si le score de complétude est insuffisant**  
so that **seules les annonces complètes sont publiées et visibles aux locataires**.

## Contexte fonctionnel (Epic 3)

- Utilise le score calculé en 3.4.  
- **FR couvert** :
  - **FR17**: Blocage publication si score insuffisant.

## Acceptance Criteria

Basés sur `epics.md` (Story 3.5) :

1. **Blocage publication sous le seuil**
   - Given le score de complétude de l’annonce est inférieur au minimum requis (ex. < 80 %)  
   - When l’hôte essaie de publier son annonce  
   - Then :
     - La publication est bloquée.  
     - L’annonce reste en statut `draft`.  
     - Un message clair indique le score actuel et le minimum requis.

2. **Liste des éléments manquants**
   - Given la publication est bloquée  
   - When le message d’erreur est affiché  
   - Then une liste des éléments manquants (ou incomplets) est présentée :
     - Ex : “Ajouter au moins 1 photo de cuisine”, “Remplir la charte de coloc”, etc.

3. **Navigation vers les sections manquantes**
   - Given la liste des éléments manquants est affichée  
   - When je clique sur un élément manquant  
   - Then je suis redirigé vers la section correspondante (photos, règles, calendrier, prix, etc.).

4. **Publication possible au-dessus du seuil**
   - Given j’ai complété mon annonce et que le score atteint ou dépasse le minimum requis  
   - When je réessaie de publier  
   - Then :
     - La publication réussit.  
     - Le statut de l’annonce passe à `published`.  
     - L’annonce devient éligible pour apparaître dans les résultats de recherche (Feature Epic 4).

## Tâches / Sous-tâches

### 1. Service de publication

- [ ] Dans `listing.service.ts`, ajouter une méthode `publishListing(listingId, hostId)` :
  - [ ] Charge le `Listing` + `completenessScore`.  
  - [ ] Compare le score au `MIN_LISTING_COMPLETENESS`.  
  - [ ] Si score < min → génère une erreur métier contenant :
    - `code: 'COMPLETENESS_TOO_LOW'`  
    - `currentScore`, `minScore`, `missingSections` (liste).  
  - [ ] Si score >= min → met à jour `status = 'published'`, `publishedAt`.

### 2. Logique d’identification des éléments manquants

- [ ] Dans `completeness.service.ts`, ajouter une fonction `getMissingSections(listingWithRelations)` :
  - Retourne une liste structurée de ce qui manque pour atteindre 100 % :
    - `['basic_info', 'photos_kitchen', 'rules', 'calendar', 'price', ...]`.
  - Utilisée par `publishListing` pour construire le feedback.

### 3. API de publication

- [ ] Créer route `POST /api/listings/[id]/publish` :
  - [ ] Auth via `getServerSession`, rôle `host`, contrôle ownership.  
  - [ ] Appelle `listingService.publishListing`.  
  - [ ] Succès → `{ data: { status: 'published' }, meta }`.  
  - [ ] Erreur de complétude → `{ error: { code: 'COMPLETENESS_TOO_LOW', message, details: { currentScore, minScore, missingSections } } }` + HTTP `400`.

### 4. UI – bouton de publication et message d’erreur

- [ ] Sur la page d’édition d’annonce :
  - [ ] Bouton “Publier l’annonce” (désactivé si déjà publiée).  
  - [ ] En cas d’erreur `COMPLETENESS_TOO_LOW` :
    - Afficher une boîte listant :
      - Score actuel vs minimum.  
      - Liste des éléments manquants.  
    - Chaque élément clique → navigue vers la bonne section (photos, règles, calendrier, prix).

### 5. Tests

- [ ] Services :
  - [ ] Publication refusée quand score < min.  
  - [ ] Publication possible quand score >= min.  
  - [ ] `missingSections` cohérent avec la réalité.  
- [ ] API :
  - [ ] Retourne bien `COMPLETENESS_TOO_LOW` avec détails.  
- [ ] UI :
  - [ ] Expérience claire pour l’hôte (comprend quoi compléter).

## Dev Notes (guardrails techniques)

- Toute la logique de complétude doit rester dans les services, pas dans le front.  
- Le `MIN_LISTING_COMPLETENESS` doit être **centralisé** (une seule source de vérité).

## Project Structure Notes

- Backend :
  - `src/server/services/listings/listing.service.ts` (publication).  
  - `src/server/services/listings/completeness.service.ts` (déjà créé en 3.4).  
  - `src/app/api/listings/[id]/publish/route.ts`.
- Frontend :
  - Page d’édition d’annonce (section publication).

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 3, Story 3.5).  
- `_bmad-output/planning-artifacts/prd.md` (complétude, qualité listing).  
- `_bmad-output/planning-artifacts/architecture.md`.

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 3, Story 3.5)

### Completion Notes List

- [x] Story 3.5 détaillée, blocage publication + feedback constructif.  

### File List

- `_bmad-output/implementation-artifacts/3-5-blocage-publication-si-score-completude-insuffisant.md`.

