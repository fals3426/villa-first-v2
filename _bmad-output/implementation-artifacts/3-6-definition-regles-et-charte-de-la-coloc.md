# Story 3.6: Définition règles et charte de la coloc

Status: ready-for-dev

## Story

As a **hôte**  
I want **définir les règles et la charte de ma coloc**  
so that **les locataires comprennent les attentes et le style de vie de la coloc**.

## Contexte fonctionnel (Epic 3)

- **FR couvert** :
  - **FR18**: Définition règles et charte de la coloc.
- Impacte le score de complétude (3.4/3.5) et les trajectoires de matching vibes.

## Acceptance Criteria

Basés sur `epics.md` (Story 3.6) :

1. **Section règles et charte dans l’édition d’annonce**
   - Given j’ai créé une annonce  
   - When j’accède à la section “Règles & Charte”  
   - Then je peux :
     - Sélectionner des règles via des options prédéfinies (fumeurs, animaux, heures de calme, fêtes, etc.).  
     - Rédiger une charte de vie en coloc (texte libre).

2. **Sauvegarde et persistance**
   - Given je modifie les règles/charte  
   - When j’enregistre  
   - Then :
     - Les règles sélectionnées sont stockées (ex: table `ListingRule` ou champ JSON).  
     - La charte (texte libre) est stockée dans `Listing`.  
     - Les données sont persistées et réapparaissent correctement à la réouverture.

3. **Affichage côté locataire**
   - Given une annonce a des règles/charte définies  
   - When un locataire consulte la page de détail  
   - Then :
     - Il voit les règles sous forme lisible (tags/listes).  
     - Il voit la charte dans une section dédiée.

4. **Lien avec complétude**
   - Given les règles et la charte sont remplies  
   - When le score de complétude est recalculé  
   - Then la part “Règles & charte” (15 %) passe au maximum.

## Tâches / Sous-tâches

### 1. Modèle de données

- [ ] Étendre `Listing` :
  - `houseRules: Json?` (ou modèle dédié)  
  - `charter: String?`.
- [ ] Optionnel : table `ListingRule` si on souhaite un modèle relationnel (facilite insights).

### 2. Service de règles

- [ ] Dans `listing.service.ts` ou `rules.service.ts` :
  - [ ] Méthode `updateListingRulesAndCharter(listingId, hostId, payload)` :
    - Vérifie ownership.  
    - Sauvegarde les règles prédéfinies + texte libre.  
    - Appelle `recalculateAndPersistCompleteness(listingId)`.

### 3. API

- [ ] Route `PATCH /api/listings/[id]/rules` :
  - Auth hôte + ownership.  
  - Schéma Zod pour :
    - `rules: { smoking: 'allowed'|'not_allowed'|'outside_only', pets: ..., quietHours: ..., etc. }`  
    - `charter: string` (max length sensée).

### 4. UI hôte – édition règles/charte

- [ ] Composant `ListingRulesSection` :
  - [ ] UI en checkboxes, radios, ou tags pour règles prédéfinies.  
  - [ ] Textarea pour charte.  
  - [ ] Sauvegarde via API + message de succès/erreur.

### 5. UI locataire – affichage

- [ ] Intégrer une section “Règles & charte” dans `ListingDetail` :
  - [ ] Liste lisible de règles (éventuellement avec icônes).  
  - [ ] Charte affichée sous forme de paragraphe(s).

### 6. Tests

- [ ] Services + API : vérif d’ownership, validation, recalcul de complétude.  
- [ ] UI : affichage correct des règles et charte dans les deux contextes (hôte/locataire).

## Dev Notes (guardrails techniques)

- Normaliser les clés de règles pour pouvoir les réutiliser côté matching vibes.  
- Veiller à ne pas dépasser des tailles de texte trop grandes côté BDD (limites `text` vs `varchar`).

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (champs `houseRules`/`charter`).  
  - `src/server/services/listings/listing.service.ts`.  
  - `src/app/api/listings/[id]/rules/route.ts`.
- Frontend :
  - `src/components/features/listings/ListingRulesSection.tsx`.  
  - `src/components/features/listings/ListingDetail.tsx` (ajout section).

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 3, Story 3.6).  
- `_bmad-output/planning-artifacts/prd.md` (rules, vibes, UX).  
- `_bmad-output/planning-artifacts/architecture.md`.

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 3, Story 3.6)

### Completion Notes List

- [x] Story 3.6 détaillée, règles/charte structurées pour implémentation.  

### File List

- `_bmad-output/implementation-artifacts/3-6-definition-regles-et-charte-de-la-coloc.md`.

