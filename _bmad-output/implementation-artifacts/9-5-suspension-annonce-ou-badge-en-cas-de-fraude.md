# Story 9.5: Suspension annonce ou badge en cas de fraude

Status: ready-for-dev

## Story

As a **support**  
I want **suspendre une annonce ou un badge en cas de fraude détectée**  
so that **la confiance de la plateforme est préservée**.

## Contexte fonctionnel (Epic 9)

- **FR couvert** :
  - **FR54**: Suspension annonce ou badge en cas de fraude.
- Actions de modération avec audit logs complets et notifications.

## Acceptance Criteria

Basés sur `epics.md` (Story 9.5) :

1. **Suspension annonce**
   - Given je suis support et j'ai détecté une fraude  
   - When je suspens une annonce  
   - Then :
     - L'annonce est immédiatement retirée de la liste publique (statut "suspended").  
     - Je dois fournir une raison de suspension (champ obligatoire).

2. **Révocation badge**
   - Given je suspens une annonce avec badge vérifié  
   - When la suspension est effectuée  
   - Then le badge vérifié est révoqué si applicable.

3. **Notifications**
   - Given je suspens une annonce  
   - When la suspension est effectuée  
   - Then :
     - L'hôte est notifié de la suspension avec la raison.  
     - Toutes les réservations en cours sont notifiées.

4. **Audit log**
   - Given je suspens une annonce  
   - When l'action est enregistrée  
   - Then un audit log détaillé est créé avec toutes les preuves de fraude.

5. **Contestation**
   - Given une annonce est suspendue  
   - When l'hôte consulte  
   - Then l'hôte peut contester la décision (processus futur, mentionné mais pas implémenté dans cette story).

## Tâches / Sous-tâches

### 1. Service de suspension

- [ ] Créer `moderation.service.ts` dans `server/services/support/` :
  - [ ] Fonction `suspendListing(listingId, supportUserId, reason, evidence)` :
    - Vérifie que l'utilisateur a le rôle support.  
    - Met à jour le statut de l'annonce à `suspended`.  
    - Révoque le badge vérifié si présent (via `verification.service.ts`).  
    - Crée audit log avec raison et preuves.  
    - Envoie notifications (hôte + réservations en cours).  
    - Retourne confirmation.
  - [ ] Fonction `revokeVerificationBadge(listingId, supportUserId, reason)` :
    - Révoque le badge vérifié (Story 2.5).  
    - Crée audit log.

### 2. Extension modèle Listing

- [ ] Vérifier que `ListingStatus` contient `suspended` :
  - [ ] `enum ListingStatus { draft, published, suspended }`.  
- [ ] Migration Prisma si nécessaire.

### 3. Service de révocation badge

- [ ] Dans `verification.service.ts` :
  - [ ] Fonction `revokeVerification(listingId, reason, revokedBy)` :
    - Met à jour le statut de vérification à `revoked`.  
    - Crée audit log.

### 4. API – suspension annonce

- [ ] Route `PATCH /api/admin/listings/[id]/suspend` :
  - [ ] Auth via `getServerSession`, rôle `support`.  
  - [ ] Body Zod : `{ reason: string, evidence?: string }` (preuves de fraude).  
  - [ ] Appelle `moderationService.suspendListing(listingId, supportUserId, reason, evidence)`.  
  - [ ] Retourne confirmation.

### 5. API – révocation badge

- [ ] Route `PATCH /api/admin/listings/[id]/revoke-badge` :
  - [ ] Auth via `getServerSession`, rôle `support`.  
  - [ ] Body Zod : `{ reason: string }`.  
  - [ ] Appelle `moderationService.revokeVerificationBadge(listingId, supportUserId, reason)`.  
  - [ ] Retourne confirmation.

### 6. Notifications

- [ ] Dans `moderation.service.ts`, après suspension :
  - [ ] Appeler `notificationService.sendListingSuspendedNotification(hostId, listingId, reason)`.  
  - [ ] Appeler `notificationService.sendBookingCancelledNotification(bookingIds)` pour réservations en cours.

### 7. UI – action suspension

- [ ] Dans la page détail annonce (back-office) :
  - [ ] Bouton "Suspendre l'annonce" :
    - Modal avec champ "Raison de suspension" (obligatoire).  
    - Champ optionnel "Preuves de fraude" (texte ou upload fichiers).  
    - Confirmation avant soumission.  
    - Appel API suspension.
  - [ ] Bouton "Révoquer le badge" (si badge présent) :
    - Modal avec raison.  
    - Confirmation avant soumission.

### 8. UI – affichage statut suspendu

- [ ] Dans les listes d'annonces :
  - [ ] Badge "Suspendu" si statut `suspended`.  
  - [ ] Raison visible pour le support.

### 9. Tests

- [ ] Services :
  - [ ] Suspension annonce fonctionne.  
  - [ ] Révocation badge fonctionne.  
  - [ ] Notifications envoyées correctement.
- [ ] API :
  - [ ] PATCH suspend/revoke fonctionnent.  
  - [ ] Vérification rôle support fonctionne.
- [ ] UI :
  - [ ] Formulaire suspension complet.  
  - [ ] Confirmations fonctionnent.

## Dev Notes (guardrails techniques)

- **CRITICAL** : Raison de suspension obligatoire (ne jamais suspendre sans raison documentée).  
- Toutes les preuves de fraude doivent être stockées dans les audit logs.  
- S'assurer que les réservations en cours sont bien notifiées lors de la suspension.

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (statut `suspended` dans `ListingStatus`).  
  - `src/server/services/support/moderation.service.ts`.  
  - `src/server/services/verification/verification.service.ts` (révocation badge).  
  - `src/app/api/admin/listings/[id]/suspend/route.ts`.  
  - `src/app/api/admin/listings/[id]/revoke-badge/route.ts`.
- Frontend :
  - `src/components/admin/ListingActions.tsx` (boutons suspend/revoke).  
  - `src/components/admin/SuspendListingModal.tsx`.

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 9, Story 9.5 + Story 2.5 pour révocation badge).  
- `_bmad-output/planning-artifacts/prd.md` (Support, moderation, fraud detection).  
- `_bmad-output/planning-artifacts/architecture.md` (Admin patterns, moderation workflows).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 9, Story 9.5)

### Completion Notes List

- [x] Story 9.5 détaillée, suspension annonce/badge avec audit logs complets et notifications.  
- [x] Raison obligatoire et stockage preuves de fraude.

### File List

- `_bmad-output/implementation-artifacts/9-5-suspension-annonce-ou-badge-en-cas-de-fraude.md`.
