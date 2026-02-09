# Story 5.6: Validation manuelle colocation par propriétaire

Status: ready-for-dev

## Story

As a **propriétaire**  
I want **valider manuellement une colocation à tout moment**  
so that **je peux déclencher la capture du paiement quand je le souhaite**.

## Contexte fonctionnel (Epic 5)

- **FR couvert** :
  - **FR60**: Validation manuelle colocation par propriétaire.
- Permet au propriétaire de valider indépendamment des règles automatiques (Story 5.5).

## Acceptance Criteria

Basés sur `epics.md` (Story 5.6) :

1. **Accès à la gestion des réservations**
   - Given je suis un propriétaire et j'ai des réservations en attente  
   - When j'accède à la page de gestion des réservations  
   - Then je peux voir toutes les réservations en attente pour mes annonces.

2. **Validation manuelle**
   - Given je vois des réservations en attente  
   - When je clique sur "Valider la colocation"  
   - Then :
     - Je peux valider manuellement une colocation (indépendamment des règles définies en 5.5).  
     - La validation peut être effectuée même si les règles automatiques ne sont pas remplies.

3. **Capture des préautorisations**
   - Given je valide une colocation  
   - When la validation est confirmée  
   - Then toutes les préautorisations de 25€ des locataires avec réservation active sont capturées (Story 5.7).  
   - And le statut de la colocation passe à `"validated"`.

4. **Notifications**
   - Given une colocation est validée  
   - When la capture est effectuée  
   - Then :
     - Les locataires sont notifiés que leur paiement a été capturé.  
     - Les réservations passent à `"confirmed"`.

5. **Audit log**
   - Given une validation est effectuée  
   - When je consulte les logs  
   - Then un audit log est créé avec :
     - L'action de validation.  
     - L'identité du propriétaire.  
     - La date/heure.  
     - Les réservations concernées.

## Tâches / Sous-tâches

### 1. Service de validation manuelle

- [ ] Dans `validation.service.ts`, ajouter :
  - [ ] Fonction `validateColocationManually(listingId, hostId)` :
    - Vérifie ownership de l'annonce.  
    - Trouve toutes les réservations `pending` pour cette annonce.  
    - Appelle `paymentService.captureAllPreauthorizations(listingId)` (Story 5.7).  
    - Met à jour le statut de la colocation à `"validated"`.  
    - Crée un audit log.

### 2. API – validation manuelle

- [ ] Route `POST /api/listings/[id]/validate` :
  - [ ] Auth via `getServerSession`, rôle `host`.  
  - [ ] Vérifie ownership.  
  - [ ] Appelle `validationService.validateColocationManually`.  
  - [ ] Retourne `{ data: { status: 'validated', reservationsCount }, meta }`.

### 3. UI hôte – bouton de validation

- [ ] Dans la page de gestion des réservations :
  - [ ] Bouton "Valider la colocation" pour chaque annonce avec réservations en attente.  
  - [ ] Confirmation avant validation (dialog "Êtes-vous sûr de vouloir valider cette colocation ? Les paiements seront capturés immédiatement.").  
  - [ ] Gestion des états `isSubmitting`, `success`, `error`.

### 4. Affichage des réservations en attente

- [ ] Dans la page de gestion :
  - [ ] Liste claire des réservations `pending` avec :
    - Informations locataire.  
    - Dates de séjour.  
    - Montant préautorisé (25€).  
    - Statut préautorisation.

### 5. Tests

- [ ] Services :
  - [ ] Validation manuelle fonctionne indépendamment des règles automatiques.  
  - [ ] Capture préautorisations déclenchée correctement.  
  - [ ] Audit log créé.
- [ ] API :
  - [ ] Auth/role, ownership vérifiés.  
  - [ ] Validation réussit.
- [ ] UI :
  - [ ] Bouton visible et fonctionnel.  
  - [ ] Confirmation avant validation.

## Dev Notes (guardrails techniques)

- La validation manuelle doit toujours être possible, même si les règles automatiques ne sont pas remplies.  
- S'assurer que toutes les préautorisations sont bien capturées (gérer les échecs individuels Story 5.7).  
- Créer un audit log complet pour traçabilité.

## Project Structure Notes

- Backend :
  - `src/server/services/bookings/validation.service.ts` (méthode `validateColocationManually`).  
  - `src/app/api/listings/[id]/validate/route.ts`.
- Frontend :
  - Page de gestion réservations hôte (bouton validation).

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 5, Story 5.6).  
- `_bmad-output/planning-artifacts/prd.md` (Booking & Payment, manual validation).  
- `_bmad-output/planning-artifacts/architecture.md` (Booking flow, audit logs).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 5, Story 5.6)

### Completion Notes List

- [x] Story 5.6 détaillée, validation manuelle indépendante des règles automatiques.  
- [x] Intégration avec capture préautorisations et audit log.

### File List

- `_bmad-output/implementation-artifacts/5-6-validation-manuelle-colocation-par-proprietaire.md`.
