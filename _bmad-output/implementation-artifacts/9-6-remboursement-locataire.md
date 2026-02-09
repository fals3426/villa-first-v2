# Story 9.6: Remboursement locataire

Status: ready-for-dev

## Story

As a **support**  
I want **rembourser un locataire**  
so that **je peux résoudre les litiges et incidents en remboursant si nécessaire**.

## Contexte fonctionnel (Epic 9)

- **FR couvert** :
  - **FR55**: Remboursement locataire.
- Intégration avec Stripe pour les remboursements avec audit logs complets.

## Acceptance Criteria

Basés sur `epics.md` (Story 9.6) :

1. **Sélection réservation**
   - Given je suis support et un incident nécessite un remboursement  
   - When j'initie un remboursement pour un locataire  
   - Then je peux sélectionner la réservation à rembourser.

2. **Montant remboursement**
   - Given je sélectionne une réservation  
   - When je configure le remboursement  
   - Then je peux choisir le montant à rembourser (total ou partiel).

3. **Raison obligatoire**
   - Given je configure le remboursement  
   - When je le soumets  
   - Then je dois fournir une raison de remboursement (champ obligatoire).

4. **Exécution via Stripe**
   - Given je soumets le remboursement  
   - When le processus se termine  
   - Then :
     - Le remboursement est effectué via Stripe (refund de la capture).  
     - Le locataire est notifié du remboursement.  
     - Le statut de la réservation passe à "refunded".  
     - Un audit log est créé avec tous les détails du remboursement.

5. **Historique financier**
   - Given un remboursement est effectué  
   - When je consulte l'historique  
   - Then le remboursement apparaît dans l'historique financier.

## Tâches / Sous-tâches

### 1. Extension modèle Booking

- [ ] Ajouter statut `refunded` dans `BookingStatus` enum si absent.  
- [ ] Migration Prisma.

### 2. Modèle remboursement

- [ ] Créer modèle `Refund` dans `schema.prisma` :
  - `id: string @id @default(cuid())`  
  - `bookingId: string` (relation vers `Booking`)  
  - `paymentId: string` (relation vers `Payment`)  
  - `amount: Int` (montant en centimes)  
  - `reason: string` (raison remboursement)  
  - `stripeRefundId: string` (ID remboursement Stripe)  
  - `processedBy: string` (relation vers `User`, support)  
  - `status: Enum` (`'pending' | 'completed' | 'failed'`)  
  - `createdAt: DateTime`  
  - `processedAt?: DateTime`.
- [ ] Migration Prisma.

### 3. Service de remboursement

- [ ] Créer `refund.service.ts` dans `server/services/support/` :
  - [ ] Fonction `processRefund(bookingId, amount, reason, supportUserId)` :
    - Vérifie que l'utilisateur a le rôle support.  
    - Récupère le paiement associé à la réservation.  
    - Vérifie que le paiement a été capturé (`status = 'captured'`).  
    - Appelle Stripe pour créer le remboursement.  
    - Crée l'entrée `Refund` en base.  
    - Met à jour le statut de la réservation à `refunded` (si montant total).  
    - Crée audit log.  
    - Envoie notification au locataire.  
    - Retourne le remboursement créé.

### 4. Intégration Stripe

- [ ] Dans `stripe.service.ts` :
  - [ ] Fonction `createRefund(paymentIntentId, amount)` :
    - Crée un remboursement Stripe (total ou partiel).  
    - Retourne l'ID du remboursement Stripe.

### 5. API – remboursement

- [ ] Route `POST /api/admin/bookings/[id]/refund` :
  - [ ] Auth via `getServerSession`, rôle `support`.  
  - [ ] Body Zod : `{ amount: number, reason: string }` (montant en centimes, raison obligatoire).  
  - [ ] Appelle `refundService.processRefund(bookingId, amount, reason, supportUserId)`.  
  - [ ] Retourne `{ data: RefundDTO }`.

### 6. Notifications

- [ ] Dans `refund.service.ts`, après remboursement :
  - [ ] Appeler `notificationService.sendRefundNotification(tenantId, bookingId, amount)` :
    - Envoie notification push/email au locataire.

### 7. UI – formulaire remboursement

- [ ] Dans la page détail réservation (back-office) :
  - [ ] Bouton "Rembourser" :
    - Modal avec :
      - Sélection montant (total ou partiel avec champ montant).  
      - Champ "Raison du remboursement" (obligatoire, textarea).  
      - Affichage montant capturé actuel.  
      - Confirmation avant soumission.  
    - Appel API remboursement.

### 8. UI – historique remboursements

- [ ] Dans la page détail réservation :
  - [ ] Afficher historique des remboursements si présents.  
  - [ ] Afficher montant, raison, date, statut.

### 9. Tests

- [ ] Services :
  - [ ] Remboursement fonctionne.  
  - [ ] Intégration Stripe fonctionne.  
  - [ ] Notifications envoyées correctement.
- [ ] API :
  - [ ] POST refund fonctionne.  
  - [ ] Vérification rôle support fonctionne.
- [ ] UI :
  - [ ] Formulaire complet et intuitif.  
  - [ ] Validation montant fonctionne.

## Dev Notes (guardrails techniques)

- **CRITICAL** : Raison de remboursement obligatoire (ne jamais rembourser sans raison documentée).  
- Vérifier que le paiement a bien été capturé avant de rembourser.  
- Gérer les erreurs Stripe (remboursement échoué, montant invalide, etc.).

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (modèle `Refund`, statut `refunded` dans `BookingStatus`).  
  - `src/server/services/support/refund.service.ts`.  
  - `src/server/services/payments/stripe.service.ts` (fonction `createRefund`).  
  - `src/app/api/admin/bookings/[id]/refund/route.ts`.
- Frontend :
  - `src/components/admin/RefundModal.tsx`.  
  - Page détail réservation (historique remboursements).

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 9, Story 9.6).  
- `_bmad-output/planning-artifacts/prd.md` (Support, refunds, Stripe integration).  
- `_bmad-output/planning-artifacts/architecture.md` (Payment patterns, Stripe refunds).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 9, Story 9.6)

### Completion Notes List

- [x] Story 9.6 détaillée, remboursement locataire avec Stripe et audit logs complets.  
- [x] Raison obligatoire et gestion erreurs Stripe.

### File List

- `_bmad-output/implementation-artifacts/9-6-remboursement-locataire.md`.
