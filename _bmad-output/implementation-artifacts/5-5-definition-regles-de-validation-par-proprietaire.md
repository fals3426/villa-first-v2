# Story 5.5: Définition règles de validation par propriétaire

Status: ready-for-dev

## Story

As a **propriétaire**  
I want **définir mes règles de validation pour les colocations**  
so that **le système peut valider automatiquement ou nécessiter ma validation manuelle**.

## Contexte fonctionnel (Epic 5)

- **FR couvert** :
  - **FR59**: Définition règles de validation par propriétaire.
- Prépare les stories 5.6 (validation manuelle) et 5.7 (capture automatique selon règles).

## Acceptance Criteria

Basés sur `epics.md` (Story 5.5) :

1. **Accès aux paramètres de validation**
   - Given je suis un propriétaire avec des annonces  
   - When j'accède aux paramètres de validation  
   - Then je peux définir mes règles de validation pour chaque annonce (ou globalement).

2. **Types de règles disponibles**
   - Given je configure les règles  
   - When je sélectionne une option  
   - Then je peux choisir parmi :
     - **Villa complète uniquement** : validation automatique si toutes les places réservées.  
     - **Validation partielle possible** : validation automatique si X% des places réservées (ex: 80%).  
     - **Validation manuelle toujours requise** : aucune validation automatique.

3. **Sauvegarde et persistance**
   - Given je définis des règles  
   - When je sauvegarde  
   - Then :
     - Les règles sont sauvegardées par annonce ou globalement pour toutes mes annonces.  
     - Je peux modifier les règles à tout moment.  
     - Les règles sont visibles dans l'interface de gestion des réservations.

4. **Application aux nouvelles réservations**
   - Given des règles sont définies  
   - When une nouvelle réservation est créée  
   - Then les règles s'appliquent aux nouvelles réservations.  
   - And les réservations en cours ne sont pas affectées par les changements de règles.

5. **Affichage dans l'interface**
   - Given je consulte mes réservations  
   - When je vois une annonce  
   - Then les règles de validation sont visibles (ex: badge "Validation automatique à 80%").

## Tâches / Sous-tâches

### 1. Modèle de données règles de validation

- [ ] Étendre le modèle `Listing` dans `schema.prisma` :
  - `validationRule: Enum` (`'FULL_ONLY' | 'PARTIAL' | 'MANUAL'`)  
  - `validationThreshold?: Int` (pourcentage pour `PARTIAL`, ex: 80).  
- [ ] Migration Prisma.

### 2. Service de règles de validation

- [ ] Créer `validation.service.ts` dans `server/services/bookings/` :
  - [ ] Fonction `updateValidationRules(listingId, hostId, rules)` :
    - Valide ownership.  
    - Sauvegarde les règles dans `Listing`.  
  - [ ] Fonction `checkAutoValidation(listingId)` :
    - Vérifie si les conditions de validation automatique sont remplies.  
    - Utilisée par Story 5.7 pour décider de la capture automatique.

### 3. API – gestion règles

- [ ] Route `PATCH /api/listings/[id]/validation-rules` :
  - [ ] Auth via `getServerSession`, rôle `host`.  
  - [ ] Body Zod : `{ validationRule: 'FULL_ONLY' | 'PARTIAL' | 'MANUAL', validationThreshold?: number }`.  
  - [ ] Appelle `validationService.updateValidationRules`.

### 4. UI hôte – configuration règles

- [ ] Composant `ValidationRulesSection` dans `components/features/listings/ValidationRulesSection.tsx` :
  - [ ] Radio buttons ou select pour choisir le type de règle.  
  - [ ] Input pour `validationThreshold` si `PARTIAL` sélectionné.  
  - [ ] Sauvegarde via API + message de confirmation.

### 5. UI – affichage règles dans gestion réservations

- [ ] Dans la page de gestion des réservations hôte :
  - [ ] Afficher les règles de validation pour chaque annonce.  
  - [ ] Indicateur visuel du type de règle (badge, icône).

### 6. Tests

- [ ] Services :
  - [ ] Sauvegarde règles fonctionne.  
  - [ ] `checkAutoValidation` fonctionne selon règles.
- [ ] API :
  - [ ] Validation des règles (threshold entre 0-100 pour PARTIAL).  
  - [ ] Ownership vérifié.
- [ ] UI :
  - [ ] Configuration claire et intuitive.  
  - [ ] Affichage règles visible.

## Dev Notes (guardrails techniques)

- Les règles doivent être validées côté backend (ne jamais faire confiance au front seul).  
- S'assurer que les changements de règles n'affectent pas les réservations en cours (seulement les nouvelles).

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (champs `validationRule`, `validationThreshold`).  
  - `src/server/services/bookings/validation.service.ts`.  
  - `src/app/api/listings/[id]/validation-rules/route.ts`.
- Frontend :
  - `src/components/features/listings/ValidationRulesSection.tsx`.  
  - Page de gestion réservations hôte (affichage règles).

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 5, Story 5.5).  
- `_bmad-output/planning-artifacts/prd.md` (Booking & Payment, validation rules).  
- `_bmad-output/planning-artifacts/architecture.md` (Booking flow, validation logic).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 5, Story 5.5)

### Completion Notes List

- [x] Story 5.5 détaillée, configuration règles de validation avec 3 modes (full/partial/manual).  
- [x] Intégration avec système de validation automatique (prépare 5.7).

### File List

- `_bmad-output/implementation-artifacts/5-5-definition-regles-de-validation-par-proprietaire.md`.
