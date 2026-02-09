# Story 5.2: Blocage réservation si prix modifié sans revalidation

Status: done

## Story

As a **système**  
I want **bloquer une réservation si le prix a été modifié après la création de la réservation**  
so that **les locataires ne sont pas facturés à un prix différent de celui affiché lors de la réservation**.

## Contexte fonctionnel (Epic 5)

- **FR couvert** :
  - **FR31**: Blocage réservation si prix modifié sans revalidation.
- S'appuie sur Story 3.9 (modification prix) et protège les locataires contre les changements de prix après réservation.

## Acceptance Criteria

Basés sur `epics.md` (Story 5.2) :

1. **Détection de changement de prix**
   - Given une réservation est en attente (statut `"pending"`)  
   - When l'hôte modifie le prix de l'annonce (Story 3.9)  
   - Then toutes les réservations en attente pour cette annonce sont détectées et bloquées.

2. **Mise à jour du statut**
   - Given une réservation est bloquée par changement de prix  
   - When le système traite le changement  
   - Then :
     - Le statut de la réservation passe à `"price_changed"`.  
     - Les dates restent bloquées temporairement (ou libérées selon règles métier).

3. **Annulation de la préautorisation**
   - Given une préautorisation existe pour cette réservation (Story 5.3)  
   - When le prix change  
   - Then la préautorisation existante est annulée via Stripe (si déjà créée).

4. **Notification au locataire**
   - Given une réservation est bloquée par changement de prix  
   - When le statut change  
   - Then :
     - Le locataire est notifié que le prix a changé.  
     - Le message indique qu'il doit confirmer la nouvelle réservation avec le nouveau prix.  
     - Le locataire peut voir l'ancien prix vs le nouveau prix.

5. **Création d'une nouvelle réservation**
   - Given le locataire souhaite confirmer avec le nouveau prix  
   - When il crée une nouvelle réservation  
   - Then :
     - Il doit créer une nouvelle réservation avec le nouveau prix.  
     - L'ancienne réservation `price_changed` peut être annulée ou archivée.

6. **Protection des réservations confirmées**
   - Given une réservation a le statut `"confirmed"`  
   - When l'hôte modifie le prix  
   - Then cette réservation n'est pas affectée (les réservations confirmées restent inchangées).

## Tâches / Sous-tâches

### 1. Extension du modèle Booking

- [ ] Ajouter au modèle `Booking` :
  - `priceAtBooking: Int` (prix en centimes au moment de la réservation).  
  - `currentListingPrice: Int` (prix actuel de l'annonce, mis à jour si prix change).  
- [ ] Migration Prisma.

### 2. Service de détection de changement de prix

- [ ] Dans `booking.service.ts`, ajouter :
  - [ ] Fonction `handlePriceChange(listingId, newPrice)` :
    - Trouve toutes les réservations `pending` pour cette annonce.  
    - Compare `priceAtBooking` avec `newPrice`.  
    - Si différent → met à jour le statut à `"price_changed"` et `currentListingPrice`.  
    - Annule les préautorisations associées (via `payment.service.ts`).  
    - Notifie les locataires concernés.

### 3. Intégration avec modification de prix

- [ ] Dans `pricing.service.ts` (Story 3.9) :
  - [ ] Après mise à jour du prix, appeler `bookingService.handlePriceChange(listingId, newPrice)`.  
  - [ ] S'assurer que cette logique est déclenchée automatiquement.

### 4. API – gestion réservations bloquées

- [ ] Route `GET /api/bookings?status=price_changed` :
  - [ ] Permet au locataire de voir ses réservations bloquées.  
- [ ] Route `POST /api/bookings/[id]/cancel` :
  - [ ] Permet d'annuler une réservation `price_changed` si le locataire ne souhaite pas confirmer avec le nouveau prix.

### 5. UI locataire – notification et gestion

- [ ] Dans la page "Mes réservations" :
  - [ ] Afficher clairement les réservations `price_changed` avec un badge d'alerte.  
  - [ ] Afficher l'ancien prix vs nouveau prix.  
  - [ ] Bouton "Confirmer avec le nouveau prix" qui mène à la création d'une nouvelle réservation.  
  - [ ] Bouton "Annuler" pour annuler la réservation bloquée.

### 6. Tests

- [ ] Services :
  - [ ] Détection correcte du changement de prix.  
  - [ ] Mise à jour statut `price_changed`.  
  - [ ] Annulation préautorisation fonctionne.  
  - [ ] Réservations `confirmed` non affectées.
- [ ] API :
  - [ ] Filtrage par statut `price_changed`.  
  - [ ] Annulation fonctionne.
- [ ] UI :
  - [ ] Notification claire du changement de prix.  
  - [ ] Comparaison ancien/nouveau prix visible.

## Dev Notes (guardrails techniques)

- Toujours stocker le prix au moment de la réservation (`priceAtBooking`) pour traçabilité et protection.  
- S'assurer que l'annulation de préautorisation Stripe est bien gérée (gérer les erreurs Stripe).  
- Ne jamais affecter les réservations `confirmed` ou `expired`.

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (champs `priceAtBooking`, `currentListingPrice`).  
  - `src/server/services/bookings/booking.service.ts` (méthode `handlePriceChange`).  
  - `src/server/services/listings/pricing.service.ts` (intégration avec booking service).  
  - `src/app/api/bookings/route.ts` (filtrage par statut).
- Frontend :
  - Page "Mes réservations" (affichage réservations `price_changed`).  
  - Composants de notification et gestion.

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 5, Story 5.2).  
- `_bmad-output/planning-artifacts/prd.md` (Booking & Payment, price validation).  
- `_bmad-output/planning-artifacts/architecture.md` (Booking flow, Stripe integration).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 5, Story 5.2)

### Completion Notes List

- [x] Story 5.2 détaillée, protection contre changement de prix avec statut `price_changed` et annulation préautorisation.  
- [x] UX claire pour le locataire avec comparaison prix et actions possibles.

### File List

- `_bmad-output/implementation-artifacts/5-2-blocage-reservation-si-prix-modifie-sans-revalidation.md`.
