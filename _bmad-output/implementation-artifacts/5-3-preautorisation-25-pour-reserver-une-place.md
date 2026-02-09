# Story 5.3: Préautorisation 25€ pour réserver une place

Status: ready-for-dev

## Story

As a **locataire**  
I want **effectuer une préautorisation de 25€ lors de la réservation**  
so that **je peux sécuriser ma réservation sans être débité immédiatement**.

## Contexte fonctionnel (Epic 5)

- **FR couvert** :
  - **FR32**: Préautorisation 25€ pour réserver.
- Intègre Stripe pour créer une préautorisation (Payment Intent avec `capture_method = 'manual'`).

## Acceptance Criteria

Basés sur `epics.md` (Story 5.3) :

1. **Création de préautorisation**
   - Given j'ai créé une réservation pour une coloc (Story 5.1)  
   - When je procède au paiement  
   - Then une préautorisation de 25€ est créée via Stripe.  
   - And la préautorisation est enregistrée dans la base de données avec statut `"pending"`.

2. **Pas de débit immédiat**
   - Given la préautorisation est créée  
   - When je vérifie ma carte  
   - Then aucun débit n'est effectué sur ma carte (préautorisation uniquement, hold sur les fonds).

3. **Liaison réservation ↔ préautorisation**
   - Given la préautorisation est créée  
   - When je consulte ma réservation  
   - Then :
     - La réservation est liée à la préautorisation.  
     - Les détails de la préautorisation (montant 25€, date, statut) sont visibles dans ma réservation.

4. **Confirmation utilisateur**
   - Given la préautorisation réussit  
   - When le processus se termine  
   - Then je reçois une confirmation que la préautorisation a été effectuée ("Votre réservation est sécurisée. Le paiement sera effectué après validation par le propriétaire.").

5. **Gestion des échecs**
   - Given la préautorisation échoue (carte refusée, fonds insuffisants, etc.)  
   - When l'erreur est détectée  
   - Then :
     - Un message d'erreur clair est affiché ("Impossible de sécuriser votre réservation. Vérifiez votre carte ou réessayez.").  
     - Je peux réessayer avec une autre carte ou corriger les informations.  
     - La réservation reste en `pending` mais sans préautorisation (peut être annulée ou réessayée).

## Tâches / Sous-tâches

### 1. Modèle de données paiement

- [ ] Dans `prisma/schema.prisma`, créer le modèle `Payment` :
  - `id: string @id @default(cuid())`  
  - `bookingId: string` (relation vers `Booking`)  
  - `amount: Int` (en centimes, 2500 = 25€)  
  - `stripePaymentIntentId: string` (ID Stripe)  
  - `status: Enum` (`'pending' | 'captured' | 'expired' | 'cancelled' | 'failed'`)  
  - `createdAt`, `updatedAt`.  
- [ ] Migration Prisma.

### 2. Service de paiement Stripe

- [ ] Créer `payment.service.ts` dans `server/services/payments/` :
  - [ ] Fonction `createPreauthorization(bookingId, amount, paymentMethodId)` :
    - Crée un Payment Intent Stripe avec `capture_method = 'manual'` et `amount = 2500` (25€).  
    - Enregistre la préautorisation dans Prisma (`Payment` avec `status = 'pending'`).  
    - Retourne le `paymentIntentId` et le statut.
  - [ ] Gère les erreurs Stripe et les convertit en erreurs métier compréhensibles.

### 3. Intégration Stripe

- [ ] Configurer Stripe dans `lib/stripe.ts` :
  - [ ] Client Stripe avec clé secrète depuis variables d'environnement.  
  - [ ] Fonctions utilitaires pour créer Payment Intent.

### 4. API – création préautorisation

- [ ] Route `POST /api/bookings/[id]/payment/preauthorize` :
  - [ ] Auth via `getServerSession`, rôle `tenant`.  
  - [ ] Vérifie que la réservation appartient à l'utilisateur et est `pending`.  
  - [ ] Body Zod : `{ paymentMethodId: string }` (ID de la méthode de paiement Stripe).  
  - [ ] Appelle `paymentService.createPreauthorization`.  
  - [ ] Retourne `{ data: { paymentIntentId, status }, meta }`.

### 5. UI locataire – flux de paiement

- [ ] Après création de réservation (Story 5.1) :
  - [ ] Afficher une étape "Sécuriser votre réservation" avec montant 25€.  
  - [ ] Intégrer Stripe Elements ou Payment Request API pour saisie carte.  
  - [ ] Appel à l'API de préautorisation.  
  - [ ] Affichage confirmation ou erreur selon résultat.

### 6. Webhook Stripe (préparation)

- [ ] Route `POST /api/payments/stripe/webhook` :
  - [ ] Écoute les événements Stripe (pour Story 5.7, capture).  
  - [ ] Vérifie la signature Stripe pour sécurité.

### 7. Tests

- [ ] Services :
  - [ ] Création Payment Intent Stripe avec bons paramètres.  
  - [ ] Enregistrement en base correct.  
  - [ ] Gestion erreurs Stripe.
- [ ] API :
  - [ ] Auth/role, validation, création préautorisation.  
  - [ ] Erreurs claires en cas d'échec.
- [ ] UI :
  - [ ] Flux de paiement fluide.  
  - [ ] Messages d'erreur compréhensibles.

## Dev Notes (guardrails techniques)

- **CRITIQUE** : Utiliser `capture_method = 'manual'` pour Stripe (pas de capture automatique).  
- Ne jamais stocker les numéros de carte (Stripe gère tout).  
- Toujours vérifier la signature des webhooks Stripe.  
- Gérer les cas où Stripe est indisponible (retry, fallback, message utilisateur).

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (modèle `Payment`).  
  - `src/lib/stripe.ts` (client Stripe).  
  - `src/server/services/payments/payment.service.ts`.  
  - `src/app/api/bookings/[id]/payment/preauthorize/route.ts`.  
  - `src/app/api/payments/stripe/webhook/route.ts` (préparation).
- Frontend :
  - Composant de paiement dans `components/features/booking/PaymentFlow.tsx`.  
  - Intégration Stripe Elements ou Payment Request API.

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 5, Story 5.3).  
- `_bmad-output/planning-artifacts/prd.md` (Booking & Payment, Stripe integration).  
- `_bmad-output/planning-artifacts/architecture.md` (Stripe patterns, Payment flow).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 5, Story 5.3)

### Completion Notes List

- [x] Story 5.3 détaillée, intégration Stripe avec préautorisation manuelle et gestion erreurs.  
- [x] Flux UI complet pour sécurisation réservation.

### File List

- `_bmad-output/implementation-artifacts/5-3-preautorisation-25-pour-reserver-une-place.md`.
