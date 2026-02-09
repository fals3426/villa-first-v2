# Story 5.4: Préautorisation sans débit tant que colocation non validée

Status: ready-for-dev

## Story

As a **système**  
I want **maintenir la préautorisation sans débit tant que la colocation n'est pas validée**  
so that **les locataires ne sont pas débités avant confirmation par le propriétaire**.

## Contexte fonctionnel (Epic 5)

- **FR couvert** :
  - **FR33**: Préautorisation sans débit tant que colocation non validée.
- Assure que les préautorisations créées en 5.3 restent en "hold" jusqu'à validation (Story 5.6/5.7).

## Acceptance Criteria

Basés sur `epics.md` (Story 5.4) :

1. **Maintien du statut pending**
   - Given une préautorisation de 25€ a été créée pour une réservation  
   - When la colocation n'est pas encore validée par le propriétaire  
   - Then :
     - Aucun débit n'est effectué sur la carte du locataire.  
     - La préautorisation reste en statut `"pending"` (pas encore capturée).  
     - Le montant est réservé mais non débité (hold sur la carte).

2. **Affichage du statut**
   - Given je consulte ma réservation  
   - When la préautorisation est `pending`  
   - Then je peux voir le statut "En attente de validation" dans ma réservation.  
   - And les détails indiquent que le paiement sera effectué après validation par le propriétaire.

3. **Expiration automatique**
   - Given la colocation n'est pas validée dans le délai configuré  
   - When le délai expire  
   - Then la préautorisation expire automatiquement (Story 5.8).  
   - And aucun débit n'est effectué.

4. **Vérification côté Stripe**
   - Given une préautorisation existe  
   - When je vérifie le statut Stripe  
   - Then le Payment Intent a le statut `requires_capture` (pas encore capturé).  
   - And le montant est bien en "hold" sur la carte.

## Tâches / Sous-tâches

### 1. Vérification du statut Stripe

- [ ] Dans `payment.service.ts`, ajouter :
  - [ ] Fonction `getPreauthorizationStatus(paymentId)` :
    - Récupère le Payment Intent depuis Stripe.  
    - Vérifie que le statut est `requires_capture` (pas encore capturé).  
    - Retourne le statut synchronisé avec la base.

### 2. Synchronisation statut

- [ ] Créer un job/service périodique (ou webhook Stripe) :
  - [ ] Vérifie périodiquement les préautorisations `pending`.  
  - [ ] Synchronise le statut Stripe avec la base de données.  
  - [ ] Détecte les cas où Stripe a annulé la préautorisation (carte expirée, etc.).

### 3. UI – affichage statut

- [ ] Dans la page "Mes réservations" :
  - [ ] Afficher clairement le statut "En attente de validation" pour les réservations avec préautorisation `pending`.  
  - [ ] Indiquer que le paiement sera effectué après validation par le propriétaire.  
  - [ ] Afficher la date d'expiration de la préautorisation (si configurée).

### 4. API – statut préautorisation

- [ ] Route `GET /api/bookings/[id]/payment/status` :
  - [ ] Retourne le statut actuel de la préautorisation.  
  - [ ] Synchronise avec Stripe si nécessaire.

### 5. Tests

- [ ] Services :
  - [ ] Vérification que les préautorisations restent `pending` tant que non validées.  
  - [ ] Synchronisation statut Stripe fonctionne.
- [ ] API :
  - [ ] Retourne le bon statut.
- [ ] UI :
  - [ ] Affichage clair du statut "En attente de validation".

## Dev Notes (guardrails techniques)

- Ne jamais capturer automatiquement les préautorisations (uniquement via validation propriétaire Story 5.7).  
- Surveiller les webhooks Stripe pour détecter les annulations automatiques (carte expirée, etc.).  
- Gérer les cas où Stripe annule la préautorisation (notifier le locataire, mettre à jour le statut).

## Project Structure Notes

- Backend :
  - `src/server/services/payments/payment.service.ts` (vérification statut).  
  - `src/app/api/bookings/[id]/payment/status/route.ts`.  
  - Job/service périodique pour synchronisation (ou webhook Stripe).
- Frontend :
  - Page "Mes réservations" (affichage statut).

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 5, Story 5.4).  
- `_bmad-output/planning-artifacts/prd.md` (Booking & Payment, preauth flow).  
- `_bmad-output/planning-artifacts/architecture.md` (Stripe patterns, webhook handling).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 5, Story 5.4)

### Completion Notes List

- [x] Story 5.4 détaillée, maintien préautorisation en hold jusqu'à validation.  
- [x] Synchronisation statut Stripe et affichage clair pour le locataire.

### File List

- `_bmad-output/implementation-artifacts/5-4-preautorisation-sans-debit-tant-que-colocation-non-validee.md`.
