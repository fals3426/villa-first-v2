# Story 5.9: Visualisation réservations confirmées

Status: ready-for-dev

## Story

As a **locataire**  
I want **voir mes réservations confirmées**  
so that **je peux accéder aux informations de ma coloc et préparer mon arrivée**.

## Contexte fonctionnel (Epic 5)

- **FR couvert** :
  - **FR35**: Visualisation réservations confirmées.
- Permet au locataire de consulter ses réservations et préparer le check-in (Epic 8).

## Acceptance Criteria

Basés sur `epics.md` (Story 5.9) :

1. **Page "Mes réservations"**
   - Given je suis un locataire connecté  
   - When j'accède à la page "Mes réservations"  
   - Then je peux voir toutes mes réservations avec leur statut (`pending`, `confirmed`, `expired`, `cancelled`).

2. **Détails des réservations confirmées**
   - Given une réservation est `confirmed`  
   - When je consulte ses détails  
   - Then je peux voir :
     - Détails de l'annonce (titre, adresse, photos).  
     - Dates de séjour (check-in, check-out).  
     - Montant payé (25€).  
     - Statut de paiement.  
     - Informations de contact de l'hôte.

3. **Accès aux informations de check-in**
   - Given une réservation est `confirmed`  
   - When je consulte la réservation  
   - Then je peux accéder aux informations de check-in :
     - Adresse complète.  
     - Codes d'accès (si fournis par l'hôte).  
     - Contact hôte (masqué mais accessible via chat Epic 6).

4. **Tri et filtrage**
   - Given j'ai plusieurs réservations  
   - When je consulte la liste  
   - Then :
     - Les réservations sont triées par date (prochaines en premier).  
     - Je peux filtrer par statut si nécessaire (`confirmed`, `pending`, `expired`, etc.).

5. **Navigation vers le détail**
   - Given je vois une réservation dans la liste  
   - When je clique dessus  
   - Then j'accède à la page de détail de la réservation avec toutes les informations.

## Tâches / Sous-tâches

### 1. Service de récupération réservations

- [ ] Dans `booking.service.ts`, ajouter :
  - [ ] Fonction `getUserBookings(userId, filters?)` :
    - Retourne toutes les réservations de l'utilisateur.  
    - Filtre par statut si fourni.  
    - Joint les données de l'annonce et du paiement.  
    - Trie par date (prochaines en premier).

### 2. API – liste réservations

- [ ] Route `GET /api/bookings` :
  - [ ] Auth via `getServerSession`, rôle `tenant`.  
  - [ ] Query params optionnels : `status?: string` (filtre par statut).  
  - [ ] Appelle `bookingService.getUserBookings`.  
  - [ ] Retourne `{ data: BookingDTO[], meta: { timestamp } }`.

### 3. API – détail réservation

- [ ] Route `GET /api/bookings/[id]` :
  - [ ] Auth + vérification ownership (la réservation appartient à l'utilisateur).  
  - [ ] Retourne les détails complets avec annonce, paiement, informations check-in.

### 4. UI – page "Mes réservations"

- [ ] Page `app/(protected)/bookings/page.tsx` :
  - [ ] Server Component qui charge les réservations.  
  - [ ] Affiche un composant client `BookingList` dans `components/features/booking/BookingList.tsx` :
    - [ ] Liste des réservations avec statuts visuels (badges).  
    - [ ] Filtre par statut (dropdown ou tabs).  
    - [ ] Tri par date.

### 5. UI – carte de réservation

- [ ] Composant `BookingCard` dans `components/features/booking/BookingCard.tsx` :
  - [ ] Affiche les informations clés (annonce, dates, statut, montant).  
  - [ ] Badge de statut coloré (`confirmed`, `pending`, `expired`).  
  - [ ] Lien vers le détail.

### 6. UI – page détail réservation

- [ ] Page `app/(protected)/bookings/[id]/page.tsx` :
  - [ ] Affiche tous les détails :
    - Informations annonce (photos, titre, adresse).  
    - Dates et montant.  
    - Informations check-in (section dédiée).  
    - Contact hôte (via chat Epic 6).  
  - [ ] Bouton "Check-in" si dates approchent (Epic 8).

### 7. Tests

- [ ] Services :
  - [ ] Récupération réservations utilisateur correcte.  
  - [ ] Filtrage et tri fonctionnent.
- [ ] API :
  - [ ] Auth/ownership vérifiés.  
  - [ ] Filtrage par statut fonctionne.
- [ ] UI :
  - [ ] Liste affichée correctement.  
  - [ ] Navigation vers détail fonctionne.  
  - [ ] Informations check-in accessibles.

## Dev Notes (guardrails techniques)

- Toujours vérifier l'ownership côté backend (un locataire ne peut voir que ses propres réservations).  
- Ne jamais exposer les informations sensibles (numéros de carte, etc.) - seulement montant et statut paiement.

## Project Structure Notes

- Backend :
  - `src/server/services/bookings/booking.service.ts` (méthode `getUserBookings`).  
  - `src/app/api/bookings/route.ts` (liste).  
  - `src/app/api/bookings/[id]/route.ts` (détail).
- Frontend :
  - `src/app/(protected)/bookings/page.tsx`.  
  - `src/app/(protected)/bookings/[id]/page.tsx`.  
  - `src/components/features/booking/BookingList.tsx`.  
  - `src/components/features/booking/BookingCard.tsx`.

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 5, Story 5.9).  
- `_bmad-output/planning-artifacts/prd.md` (Booking & Payment, user experience).  
- `_bmad-output/planning-artifacts/architecture.md` (Booking flow, protected routes).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 5, Story 5.9)

### Completion Notes List

- [x] Story 5.9 détaillée, visualisation complète des réservations avec filtrage et accès check-in.  
- [x] UX claire pour préparer l'arrivée du locataire.

### File List

- `_bmad-output/implementation-artifacts/5-9-visualisation-reservations-confirmees.md`.
