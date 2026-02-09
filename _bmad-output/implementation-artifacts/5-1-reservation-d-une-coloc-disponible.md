# Story 5.1: Réservation d'une coloc disponible

Status: ready-for-dev

## Story

As a **locataire**  
I want **réserver une coloc disponible**  
so that **je peux sécuriser ma place dans la colocation**.

## Contexte fonctionnel (Epic 5)

- **Epic 5 – Réservation & Paiement avec Validation Propriétaire**  
  Les locataires peuvent réserver une coloc avec préautorisation 25€, et les propriétaires peuvent valider la colocation pour déclencher la capture du paiement.
- **FR couvert** :
  - **FR30**: Réservation coloc disponible.
- Story de base pour le flux de réservation, utilisée par toutes les stories suivantes de paiement et validation.

## Acceptance Criteria

Basés sur `epics.md` (Story 5.1) :

1. **Accès à la réservation**
   - Given je suis un locataire connecté avec KYC vérifié  
   - When je consulte le détail d'une annonce disponible  
   - Then je peux cliquer sur "Réserver" pour une date disponible.

2. **Sélection des dates**
   - Given je clique sur "Réserver"  
   - When le formulaire de réservation s'ouvre  
   - Then je dois sélectionner les dates de séjour (check-in, check-out).  
   - And le système vérifie que les dates sont disponibles dans le calendrier de l'annonce.

3. **Création de la réservation**
   - Given les dates sont disponibles et valides  
   - When je soumets le formulaire  
   - Then :
     - Une réservation est créée avec statut `"pending"` (en attente de validation).  
     - La réservation bloque les dates dans le calendrier de l'annonce (mise à jour `ListingAvailability`).  
     - La réservation est liée à mon compte utilisateur et à l'annonce.

4. **Confirmation et notifications**
   - Given la réservation est créée  
   - When le processus se termine  
   - Then :
     - Je reçois une confirmation de réservation en attente (message UI + notification optionnelle).  
     - L'hôte est notifié de la nouvelle demande de réservation (notification push/email selon préférences).

5. **Gestion des erreurs**
   - Given les dates ne sont plus disponibles (conflit détecté)  
   - When je tente de réserver  
   - Then un message d'erreur clair est affiché ("Ces dates ne sont plus disponibles. Veuillez choisir d'autres dates.").  
   - And je peux sélectionner d'autres dates sans perdre les autres informations saisies.

## Tâches / Sous-tâches

### 1. Modèle de données réservation

- [ ] Dans `prisma/schema.prisma`, créer le modèle `Booking` :
  - `id: string @id @default(cuid())`  
  - `listingId: string` (relation vers `Listing`)  
  - `tenantId: string` (relation vers `User`)  
  - `checkIn: DateTime`  
  - `checkOut: DateTime`  
  - `status: Enum` (`'pending' | 'confirmed' | 'expired' | 'cancelled' | 'price_changed'`)  
  - `createdAt`, `updatedAt`.  
- [ ] Migration Prisma.

### 2. Service de réservation

- [ ] Créer `booking.service.ts` dans `server/services/bookings/` :
  - [ ] Fonction `createBooking(tenantId, listingId, { checkIn, checkOut })` :
    - Vérifie que l'utilisateur est locataire avec KYC vérifié.  
    - Vérifie la disponibilité des dates via `calendar.service.ts` (Story 3.7).  
    - Crée la réservation avec `status = 'pending'`.  
    - Bloque les dates dans le calendrier (`ListingAvailability` → `BOOKED`).  
    - Retourne un DTO typé.

### 3. API de création de réservation

- [ ] Route `POST /api/bookings` :
  - [ ] Auth via `getServerSession(authOptions)`.  
  - [ ] Vérifie le rôle `tenant` et KYC vérifié.  
  - [ ] Valide le body via Zod (`listingId`, `checkIn`, `checkOut`).  
  - [ ] Appelle `bookingService.createBooking`.  
  - [ ] Retourne `{ data: booking, meta: { timestamp } }` avec code HTTP `201`.

### 4. UI locataire – formulaire de réservation

- [ ] Page `app/(protected)/bookings/new/[listingId]/page.tsx` :
  - [ ] Server Component qui charge les détails de l'annonce + disponibilité calendrier.  
  - [ ] Affiche un composant client `BookingForm` dans `components/features/booking/BookingForm.tsx` :
    - [ ] Sélecteur de dates (date picker) avec dates disponibles uniquement.  
    - [ ] Validation client (dates valides, check-out > check-in).  
    - [ ] Appel à l'API `POST /api/bookings`.  
    - [ ] Gestion des états `isSubmitting`, `error`, `success`.  
    - [ ] Redirection vers "Mes réservations" après succès.

### 5. Intégration avec calendrier

- [ ] Dans `calendar.service.ts` :
  - [ ] Méthode `blockDatesForBooking(listingId, checkIn, checkOut)` :
    - Met à jour `ListingAvailability` pour les dates concernées (`status = BOOKED`).  
    - Appelée automatiquement lors de la création de réservation.

### 6. Notifications

- [ ] Après création de réservation :
  - [ ] Notification au locataire (confirmation en attente).  
  - [ ] Notification à l'hôte (nouvelle demande de réservation).  
  - [ ] Utilise les services de notification (Epic 6, mais base de notification peut être préparée ici).

### 7. Tests

- [ ] Services :
  - [ ] Création de réservation avec dates valides.  
  - [ ] Refus si dates non disponibles.  
  - [ ] Blocage calendrier fonctionne.
- [ ] API :
  - [ ] Non authentifié → `401`.  
  - [ ] Rôle non `tenant` → `403`.  
  - [ ] KYC non vérifié → `403` ou erreur métier.  
  - [ ] Dates non disponibles → `400` avec `code: 'DATES_NOT_AVAILABLE'`.  
  - [ ] Cas nominal → `201` + `data`.
- [ ] UI :
  - [ ] Date picker affiche uniquement dates disponibles.  
  - [ ] Erreurs affichées clairement.

## Dev Notes (guardrails techniques)

- Toujours vérifier la disponibilité côté backend (jamais faire confiance au front seul).  
- Gérer les race conditions : si deux utilisateurs réservent simultanément les mêmes dates, un seul doit réussir (utiliser transactions Prisma ou verrous).  
- Respecter le format de réponse API standardisé.

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (modèle `Booking`).  
  - `src/server/services/bookings/booking.service.ts`.  
  - `src/server/services/listings/calendar.service.ts` (extension pour blocage).  
  - `src/app/api/bookings/route.ts`.
- Frontend :
  - `src/app/(protected)/bookings/new/[listingId]/page.tsx`.  
  - `src/components/features/booking/BookingForm.tsx`.

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 5, Story 5.1).  
- `_bmad-output/planning-artifacts/prd.md` (Booking & Payment, Calendar).  
- `_bmad-output/planning-artifacts/architecture.md` (Booking flow, calendar integration).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 5, Story 5.1)

### Completion Notes List

- [x] Story 5.1 détaillée, création de réservation avec vérification disponibilité et blocage calendrier.  
- [x] Gestion des erreurs et notifications préparées.

### File List

- `_bmad-output/implementation-artifacts/5-1-reservation-d-une-coloc-disponible.md`.
