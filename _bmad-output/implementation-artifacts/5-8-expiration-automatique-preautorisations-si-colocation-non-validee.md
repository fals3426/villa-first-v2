# Story 5.8: Expiration automatique préautorisations si colocation non validée

Status: ready-for-dev

## Story

As a **système**  
I want **expirer automatiquement les préautorisations si la colocation n'est pas validée**  
so that **les locataires ne restent pas bloqués indéfiniment sans débit**.

## Contexte fonctionnel (Epic 5)

- **FR couverts** :
  - **FR61**: Expiration automatique préautorisations si colocation non validée.  
  - **FR63**: Gestion expiration automatique préautorisations.
- Protège les locataires contre les préautorisations qui restent en attente indéfiniment.

## Acceptance Criteria

Basés sur `epics.md` (Story 5.8) :

1. **Expiration automatique**
   - Given une préautorisation existe pour une réservation en attente  
   - When la colocation n'est pas validée dans le délai configuré (ex: 7 jours)  
   - Then la préautorisation expire automatiquement.

2. **Pas de débit**
   - Given la préautorisation expire  
   - When l'expiration est traitée  
   - Then aucun débit n'est effectué (la préautorisation est simplement annulée).  
   - And le hold sur la carte est libéré.

3. **Mise à jour des statuts**
   - Given une préautorisation expire  
   - When le processus se termine  
   - Then :
     - Le statut de la préautorisation passe à `"expired"`.  
     - Le statut de la réservation passe à `"expired"`.  
     - Les dates sont libérées dans le calendrier de l'annonce.

4. **Notifications**
   - Given une préautorisation expire  
   - When l'expiration est traitée  
   - Then :
     - Le locataire est notifié de l'expiration ("Votre réservation a expiré. Aucun débit n'a été effectué.").  
     - L'hôte est notifié qu'une réservation a expiré.

5. **Possibilité de nouvelle réservation**
   - Given une réservation a expiré  
   - When le locataire souhaite réserver à nouveau  
   - Then il peut créer une nouvelle réservation si souhaité (les dates sont libres).

## Tâches / Sous-tâches

### 1. Modèle de données – date d'expiration

- [ ] Étendre le modèle `Payment` dans `schema.prisma` :
  - `expiresAt: DateTime?` (date d'expiration calculée à la création).  
- [ ] Migration Prisma.

### 2. Service d'expiration

- [ ] Créer `expiration.service.ts` dans `server/services/payments/` :
  - [ ] Fonction `expirePreauthorizations()` :
    - Trouve toutes les préautorisations `pending` avec `expiresAt < now()`.  
    - Pour chaque préautorisation :
      - Annule le Payment Intent Stripe (`cancel`).  
      - Met à jour le statut à `"expired"`.  
      - Met à jour le statut de la réservation à `"expired"`.  
      - Libère les dates dans le calendrier (`ListingAvailability` → `AVAILABLE`).  
      - Notifie le locataire et l'hôte.

### 3. Job périodique d'expiration

- [ ] Créer un job cron ou service périodique :
  - [ ] Exécute `expirationService.expirePreauthorizations()` toutes les heures (ou selon besoin).  
  - [ ] Peut être déployé via Vercel Cron, external scheduler, ou process Node.

### 4. Calcul de la date d'expiration

- [ ] Dans `payment.service.ts`, lors de création préautorisation :
  - [ ] Calculer `expiresAt = createdAt + EXPIRATION_DELAY` (ex: 7 jours).  
  - [ ] Stocker dans `Payment.expiresAt`.

### 5. Configuration délai d'expiration

- [ ] Ajouter constante `PREAUTHORIZATION_EXPIRATION_DAYS = 7` dans `lib/constants.ts` :
  - [ ] Configurable via variable d'environnement si besoin.

### 6. API – annulation manuelle (optionnel)

- [ ] Route `POST /api/bookings/[id]/cancel` :
  - [ ] Permet au locataire d'annuler sa réservation avant expiration.  
  - [ ] Annule la préautorisation et libère les dates.

### 7. Tests

- [ ] Services :
  - [ ] Expiration automatique fonctionne après délai.  
  - [ ] Annulation Stripe correcte.  
  - [ ] Libération calendrier fonctionne.
- [ ] Job :
  - [ ] Exécution périodique fonctionne.
- [ ] UI :
  - [ ] Notifications d'expiration reçues.  
  - [ ] Possibilité de nouvelle réservation.

## Dev Notes (guardrails techniques)

- S'assurer que le job d'expiration s'exécute régulièrement (monitoring, alertes si échec).  
- Gérer les cas où Stripe est indisponible lors de l'annulation (retry, queue).  
- Ne jamais expirer les préautorisations déjà `captured` ou `confirmed`.

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (champ `expiresAt`).  
  - `src/server/services/payments/expiration.service.ts`.  
  - `src/server/services/payments/payment.service.ts` (calcul `expiresAt`).  
  - Job cron/service périodique pour expiration.
- Frontend :
  - Notifications d'expiration (via services Epic 6).

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 5, Story 5.8).  
- `_bmad-output/planning-artifacts/prd.md` (Booking & Payment, expiration).  
- `_bmad-output/planning-artifacts/architecture.md` (Cron jobs, Stripe cancellation).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 5, Story 5.8)

### Completion Notes List

- [x] Story 5.8 détaillée, expiration automatique avec job périodique et libération ressources.  
- [x] Gestion complète des notifications et possibilité de nouvelle réservation.

### File List

- `_bmad-output/implementation-artifacts/5-8-expiration-automatique-preautorisations-si-colocation-non-validee.md`.
