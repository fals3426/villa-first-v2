# Story 5.7: Capture préautorisations lors validation colocation

Status: ready-for-dev

## Story

As a **système**  
I want **capturer les préautorisations de tous les locataires actifs lors de la validation**  
so that **les paiements sont effectués uniquement après validation explicite**.

## Contexte fonctionnel (Epic 5)

- **FR couverts** :
  - **FR62**: Capture préautorisations lors validation colocation.  
  - **FR34**: Capture 25€ après validation explicite propriétaire.
- Exécute la capture Stripe des préautorisations créées en 5.3, déclenchée par validation (5.6) ou règles automatiques.

## Acceptance Criteria

Basés sur `epics.md` (Story 5.7) :

1. **Capture lors de validation**
   - Given un propriétaire valide une colocation (Story 5.6)  
   - When la validation est confirmée  
   - Then toutes les préautorisations de 25€ des locataires avec réservation active sont capturées via Stripe.

2. **Débit réel**
   - Given les préautorisations sont capturées  
   - When Stripe traite la capture  
   - Then les paiements sont effectués (débit réel sur les cartes).  
   - And le statut des préautorisations passe à `"captured"`.

3. **Mise à jour des statuts**
   - Given la capture réussit  
   - When le processus se termine  
   - Then :
     - Le statut des préautorisations passe à `"captured"`.  
     - Le statut des réservations passe à `"confirmed"`.  
     - Les dates restent bloquées dans le calendrier.

4. **Notifications**
   - Given les paiements sont capturés  
   - When les locataires sont notifiés  
   - Then ils reçoivent une notification de confirmation de paiement ("Votre réservation est confirmée. Le paiement de 25€ a été effectué.").

5. **Gestion des échecs**
   - Given une capture échoue (carte expirée, fonds insuffisants, etc.)  
   - When l'erreur est détectée  
   - Then :
     - Le locataire concerné est notifié et doit mettre à jour sa carte.  
     - Les autres captures réussies sont conservées.  
     - Un audit log est créé pour chaque capture réussie ou échouée.

6. **Validation automatique selon règles**
   - Given des règles de validation automatique sont définies (Story 5.5)  
   - When les conditions sont remplies (ex: 80% des places réservées)  
   - Then la capture est déclenchée automatiquement (sans action manuelle du propriétaire).

## Tâches / Sous-tâches

### 1. Service de capture

- [ ] Dans `payment.service.ts`, ajouter :
  - [ ] Fonction `captureAllPreauthorizations(listingId)` :
    - Trouve toutes les préautorisations `pending` pour les réservations actives de cette annonce.  
    - Pour chaque préautorisation :
      - Capture le Payment Intent Stripe (`capture` avec `amount`).  
      - Met à jour le statut en base à `"captured"`.  
      - Met à jour le statut de la réservation à `"confirmed"`.  
    - Gère les échecs individuels (continue avec les autres même si une échoue).  
    - Retourne un résumé (succès/échecs).

### 2. Intégration avec validation

- [ ] Dans `validation.service.ts` :
  - [ ] Après validation manuelle (Story 5.6), appeler `paymentService.captureAllPreauthorizations`.  
  - [ ] Après vérification règles automatiques, déclencher capture si conditions remplies.

### 3. Webhook Stripe pour capture

- [ ] Dans `app/api/payments/stripe/webhook/route.ts` :
  - [ ] Écouter l'événement `payment_intent.succeeded` :
    - Mettre à jour le statut de la préautorisation en base.  
    - Mettre à jour le statut de la réservation.
  - [ ] Écouter `payment_intent.payment_failed` :
    - Marquer la préautorisation comme `failed`.  
    - Notifier le locataire.

### 4. Validation automatique selon règles

- [ ] Créer un job/service périodique ou déclencher lors de nouvelles réservations :
  - [ ] Vérifie les règles de validation automatique (Story 5.5).  
  - [ ] Si conditions remplies → appelle `validationService.validateColocationAutomatically(listingId)`.

### 5. UI hôte – feedback capture

- [ ] Après validation manuelle :
  - [ ] Afficher un résumé des captures (X réussies, Y échouées).  
  - [ ] Indiquer les locataires à notifier en cas d'échec.

### 6. UI locataire – notification capture

- [ ] Dans "Mes réservations" :
  - [ ] Afficher clairement quand le paiement a été capturé.  
  - [ ] Afficher les détails (montant, date de capture).

### 7. Tests

- [ ] Services :
  - [ ] Capture Stripe fonctionne correctement.  
  - [ ] Mise à jour statuts en base.  
  - [ ] Gestion échecs individuels.
- [ ] Webhook :
  - [ ] Événements Stripe traités correctement.  
  - [ ] Signature vérifiée.
- [ ] UI :
  - [ ] Feedback clair après capture.  
  - [ ] Notifications reçues.

## Dev Notes (guardrails techniques)

- **CRITIQUE** : Toujours vérifier la signature des webhooks Stripe avant traitement.  
- Gérer les cas où Stripe est indisponible (retry, queue, fallback).  
- Ne jamais capturer deux fois la même préautorisation (vérifier le statut avant capture).  
- Gérer les échecs de capture individuellement (ne pas bloquer les autres si une échoue).

## Project Structure Notes

- Backend :
  - `src/server/services/payments/payment.service.ts` (méthode `captureAllPreauthorizations`).  
  - `src/server/services/bookings/validation.service.ts` (intégration capture).  
  - `src/app/api/payments/stripe/webhook/route.ts` (webhook Stripe).  
  - Job/service pour validation automatique.
- Frontend :
  - Page gestion réservations hôte (feedback capture).  
  - Page "Mes réservations" locataire (notification capture).

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 5, Story 5.7).  
- `_bmad-output/planning-artifacts/prd.md` (Booking & Payment, Stripe capture).  
- `_bmad-output/planning-artifacts/architecture.md` (Stripe patterns, webhook handling).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 5, Story 5.7)

### Completion Notes List

- [x] Story 5.7 détaillée, capture Stripe avec gestion échecs et validation automatique.  
- [x] Webhook Stripe et notifications complètes.

### File List

- `_bmad-output/implementation-artifacts/5-7-capture-preautorisations-lors-validation-colocation.md`.
