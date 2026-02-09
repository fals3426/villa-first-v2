# Story 3.4: Calcul score de complétude d'annonce

Status: ready-for-dev

## Story

As a **système**  
I want **calculer un score de complétude pour chaque annonce**  
so that **je peux déterminer si l'annonce est suffisamment complète pour publication**.

## Contexte fonctionnel (Epic 3)

- Alimente directement la Story 3.5 (blocage publication si score insuffisant).  
- **FR couvert** :
  - **FR16**: Calcul score de complétude.

## Acceptance Criteria

Basés sur `epics.md` (Story 3.4) :

1. **Calcul de score à partir des sections de l’annonce**
   - Given une annonce existe (même `draft`)  
   - When le système évalue sa complétude  
   - Then le score est calculé selon la pondération suivante :
     - Informations de base (titre, description, adresse) : **30 %**  
     - Photos par catégorie (cuisine, chambres, SDB, extérieurs) : **40 %** (10 % par catégorie)  
     - Règles et charte de coloc : **15 %**  
     - Calendrier de disponibilité : **10 %**  
     - Prix défini : **5 %**.

2. **Affichage du score**
   - Given un score a été calculé  
   - When l’hôte consulte la page d’édition de l’annonce  
   - Then il voit un indicateur clair, par ex. “Complétude : 75 %”.

3. **Mise à jour en temps réel**
   - Given je modifie l’annonce (ajout/suppression de photos, complétion des règles, etc.)  
   - When les modifications sont enregistrées  
   - Then le score est recalculé et mis à jour sans nécessiter une action manuelle (au minimum au moment de l’enregistrement).

4. **Score minimum configurable**
   - Given une configuration de score minimum existe (ex. 80 %)  
   - When le score d’une annonce change  
   - Then cette valeur minimum est utilisée par la Story 3.5 pour déterminer si la publication est autorisée.  
   - And le minimum doit être stocké dans une config (constante ou table) et non hardcodé partout.

## Tâches / Sous-tâches

### 1. Modèle & stockage du score

- [ ] Étendre le modèle `Listing` :
  - Champs :
    - `completenessScore: Int` (0–100).  
    - `completenessUpdatedAt: DateTime?`.
- [ ] Migration Prisma.

### 2. Service de calcul de complétude

- [ ] Créer `completeness.service.ts` dans `server/services/listings/` :
  - [ ] Fonction pure `computeListingCompleteness(listingWithRelations)` :
    - Inspecte :
      - Existence et qualité minimale des informations de base.  
      - Nombre de photos par catégorie (>= 1 / catégorie).  
      - Présence de règles/charte.  
      - Présence de données de calendrier.  
      - Présence d’un prix.  
    - Retourne un entier 0–100 selon la pondération définie.
  - [ ] Fonction `recalculateAndPersistCompleteness(listingId)` :
    - Charge l’annonce + relations nécessaires.  
    - Calcule le score.  
    - Sauvegarde le `completenessScore` et `completenessUpdatedAt`.

### 3. Points d’intégration du calcul

- [ ] Appeler `recalculateAndPersistCompleteness` depuis :
  - [ ] La fin des opérations d’édition d’annonce (mise à jour infos de base).  
  - [ ] Upload/suppression de photos.  
  - [ ] Mise à jour des règles/charte (Story 3.6).  
  - [ ] Mise à jour calendrier (Story 3.7).  
  - [ ] Mise à jour prix (Story 3.9).

### 4. UI – affichage score

- [ ] Composant `ListingCompletenessIndicator` :
  - [ ] Affiche le pourcentage (ex: badge, barre de progression).  
  - [ ] Affiché dans le dashboard hôte et la page d’édition annonce.  
  - [ ] Optionnel : lien vers la liste des éléments manquants (utilisé en 3.5).

### 5. Paramétrage du score minimum

- [ ] Ajouter une constante ou config (ex: `MIN_LISTING_COMPLETENESS = 80`) :
  - Stockée dans `lib/constants.ts` ou table config.  
  - Utilisée par le service de blocage de publication (3.5).

### 6. Tests

- [ ] Tests unitaires `computeListingCompleteness` :
  - [ ] Cas extrêmes : aucun champ rempli → 0 %, tout rempli → 100 %.  
  - [ ] Cas intermédiaires conformes aux pondérations.
- [ ] Tests intégration :
  - [ ] Modification de sections → score recalculé comme attendu.

## Dev Notes (guardrails techniques)

- Garder la fonction de calcul **pure** et testable.  
- Ne pas faire de logique métier de complétude directement dans les composants ou routes API.

## Project Structure Notes

- Backend :
  - `src/server/services/listings/completeness.service.ts`.  
  - Intégration dans les services d’édition d’annonce (listing, photos, règles, calendrier, prix).
- Frontend :
  - `src/components/features/listings/ListingCompletenessIndicator.tsx`.

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 3, Story 3.4).  
- `_bmad-output/planning-artifacts/prd.md` (Qualité listing, complétude).  
- `_bmad-output/planning-artifacts/architecture.md`.

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 3, Story 3.4)

### Completion Notes List

- [x] Story 3.4 détaillée, service de complétude centralisé et testable.  

### File List

- `_bmad-output/implementation-artifacts/3-4-calcul-score-de-completude-d-annonce.md`.

