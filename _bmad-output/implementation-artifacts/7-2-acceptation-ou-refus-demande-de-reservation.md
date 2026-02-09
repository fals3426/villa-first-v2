# Story 7.2: Acceptation ou refus demande de réservation

Status: ready-for-dev

## Story

As a **hôte**  
I want **accepter ou refuser une demande de réservation**  
so that **je peux contrôler qui réserve ma coloc**.

## Contexte fonctionnel (Epic 7)

- **FR couvert** :
  - **FR23**: Acceptation ou refus demande de réservation.
- Workflow d'acceptation/refus avec notifications et gestion calendrier.

## Acceptance Criteria

Basés sur `epics.md` (Story 7.2) :

1. **Acceptation d'une demande**
   - Given je vois une demande de réservation en attente (statut "pending")  
   - When j'accepte la demande  
   - Then :
     - Le statut de la réservation passe à "accepted".  
     - Les dates sont confirmées comme réservées dans le calendrier.  
     - Le locataire est notifié de l'acceptation (push/email selon préférences).  
     - La réservation reste en attente de validation de colocation (si règles de validation requises, Epic 5).

2. **Refus d'une demande**
   - Given je vois une demande en attente  
   - When je refuse la demande  
   - Then :
     - Le statut passe à "rejected".  
     - Je dois fournir une raison de refus (optionnel mais recommandé).  
     - Le locataire est notifié du refus.  
     - Les dates sont libérées dans le calendrier.  
     - La préautorisation est annulée/expirée (via Stripe).  
     - Un audit log est créé pour chaque action (acceptation/refus).

3. **Vérifications avant action**
   - Given je tente d'accepter/refuser une demande  
   - When l'action est déclenchée  
   - Then :
     - Le système vérifie que je suis bien l'hôte propriétaire de l'annonce.  
     - Le système vérifie que la demande est toujours en statut "pending".  
     - Le système vérifie que les dates sont toujours disponibles (pour acceptation).

## Tâches / Sous-tâches

### 1. Extension modèle Booking (si nécessaire)

- [ ] Vérifier que le modèle `Booking` contient :
  - [ ] Statut `accepted` et `rejected` (ajouter si absents).  
  - [ ] Champ `rejectionReason?: string` (optionnel, pour raison de refus).  
- [ ] Migration Prisma.

### 2. Service d'acceptation/refus

- [ ] Étendre `booking.service.ts` :
  - [ ] Fonction `acceptBookingRequest(hostId, bookingId)` :
    - Vérifie que l'hôte est propriétaire de l'annonce.  
    - Vérifie que le statut est `pending`.  
    - Vérifie que les dates sont toujours disponibles.  
    - Met à jour le statut à `accepted`.  
    - Confirme les dates dans le calendrier (blocage définitif).  
    - Crée un audit log.  
    - Retourne la réservation mise à jour.
  - [ ] Fonction `rejectBookingRequest(hostId, bookingId, reason?)` :
    - Vérifie que l'hôte est propriétaire de l'annonce.  
    - Vérifie que le statut est `pending`.  
    - Met à jour le statut à `rejected` avec raison si fournie.  
    - Libère les dates dans le calendrier.  
    - Annule/expire la préautorisation via `payment.service.ts` (Stripe).  
    - Crée un audit log.  
    - Retourne la réservation mise à jour.

### 3. Intégration avec service paiement

- [ ] Dans `payment.service.ts` :
  - [ ] Fonction `cancelPreauthorization(paymentId)` :
    - Annule la préautorisation Stripe.  
    - Met à jour le statut du paiement à `cancelled`.  
    - Utilisée lors du refus d'une demande.

### 4. Intégration avec calendrier

- [ ] Dans `calendar.service.ts` :
  - [ ] Fonction `confirmBookingDates(listingId, checkIn, checkOut)` :
    - Confirme définitivement les dates comme réservées (pour acceptation).  
  - [ ] Fonction `releaseBookingDates(listingId, checkIn, checkOut)` :
    - Libère les dates (pour refus).

### 5. API – acceptation

- [ ] Route `PATCH /api/host/bookings/[id]/accept` :
  - [ ] Auth via `getServerSession`, rôle `host`.  
  - [ ] Appelle `bookingService.acceptBookingRequest(hostId, bookingId)`.  
  - [ ] Retourne confirmation.

### 6. API – refus

- [ ] Route `PATCH /api/host/bookings/[id]/reject` :
  - [ ] Auth via `getServerSession`, rôle `host`.  
  - [ ] Body Zod : `{ reason?: string }` (optionnel).  
  - [ ] Appelle `bookingService.rejectBookingRequest(hostId, bookingId, reason)`.  
  - [ ] Retourne confirmation.

### 7. Notifications

- [ ] Dans `booking.service.ts`, après acceptation/refus :
  - [ ] Appeler `notificationService.sendBookingStatusUpdate(tenantId, bookingId, status)` :
    - Envoie notification push/email selon préférences (Story 6.6).  
    - Contenu : "Votre demande de réservation a été acceptée/refusée".

### 8. UI – boutons acceptation/refus

- [ ] Dans `HostBookingRequestDetail` :
  - [ ] Bouton "Accepter" (si statut `pending`) :
    - Confirmation avant acceptation.  
    - Appel API `PATCH /api/host/bookings/[id]/accept`.  
    - Message de succès + rafraîchissement liste.
  - [ ] Bouton "Refuser" (si statut `pending`) :
    - Modal avec champ optionnel "Raison du refus".  
    - Appel API `PATCH /api/host/bookings/[id]/reject`.  
    - Message de succès + rafraîchissement liste.

### 9. Tests

- [ ] Services :
  - [ ] Acceptation fonctionne et met à jour statut + calendrier.  
  - [ ] Refus fonctionne et libère dates + annule préautorisation.  
  - [ ] Vérifications ownership et statut fonctionnent.
- [ ] API :
  - [ ] PATCH accept/reject fonctionnent.  
  - [ ] Auth et vérifications fonctionnent.
- [ ] Intégration :
  - [ ] Notifications envoyées correctement.  
  - [ ] Calendrier mis à jour correctement.  
  - [ ] Préautorisations annulées correctement.

## Dev Notes (guardrails techniques)

- Toujours vérifier l'ownership de l'annonce côté backend (jamais faire confiance au front seul).  
- Vérifier que la demande est toujours `pending` avant acceptation/refus (éviter race conditions).  
- Gérer les erreurs Stripe lors de l'annulation de préautorisation (logging + fallback).

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (statuts `accepted`, `rejected`, champ `rejectionReason`).  
  - `src/server/services/bookings/booking.service.ts` (fonctions `acceptBookingRequest`, `rejectBookingRequest`).  
  - `src/server/services/payments/payment.service.ts` (fonction `cancelPreauthorization`).  
  - `src/server/services/calendar/calendar.service.ts` (fonctions `confirmBookingDates`, `releaseBookingDates`).  
  - `src/app/api/host/bookings/[id]/accept/route.ts`.  
  - `src/app/api/host/bookings/[id]/reject/route.ts`.
- Frontend :
  - `src/components/features/bookings/HostBookingRequestDetail.tsx` (boutons accept/refuse).

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 7, Story 7.2).  
- `_bmad-output/planning-artifacts/prd.md` (Gestion réservations, host approval workflow).  
- `_bmad-output/planning-artifacts/architecture.md` (Booking patterns, payment cancellation, calendar management).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 7, Story 7.2)

### Completion Notes List

- [x] Story 7.2 détaillée, workflow acceptation/refus avec notifications, gestion calendrier et annulation préautorisations.  
- [x] Vérifications sécurité et gestion erreurs Stripe.

### File List

- `_bmad-output/implementation-artifacts/7-2-acceptation-ou-refus-demande-de-reservation.md`.
