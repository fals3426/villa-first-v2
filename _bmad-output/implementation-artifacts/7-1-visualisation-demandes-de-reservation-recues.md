# Story 7.1: Visualisation demandes de réservation reçues

Status: ready-for-dev

## Story

As a **hôte**  
I want **voir les demandes de réservation reçues pour mes annonces**  
so that **je peux gérer les demandes et décider lesquelles accepter**.

## Contexte fonctionnel (Epic 7)

- **Epic 7 – Gestion des Demandes de Réservation**  
  Les hôtes peuvent voir, accepter ou refuser les demandes de réservation reçues pour leurs annonces.
- **FR couvert** :
  - **FR22**: Visualisation demandes de réservation reçues.
- Interface de gestion pour les hôtes, avec filtres et tri.

## Acceptance Criteria

Basés sur `epics.md` (Story 7.1) :

1. **Accès à la page de gestion**
   - Given je suis un hôte connecté avec des annonces publiées  
   - When j'accède à la page de gestion des réservations  
   - Then je peux voir toutes les demandes de réservation reçues pour mes annonces.

2. **Informations affichées par demande**
   - Given je consulte une demande  
   - When je la vois dans la liste  
   - Then je peux voir :
     - Informations locataire (nom, photo profil, statut KYC).  
     - Dates de séjour demandées (check-in, check-out).  
     - Nombre de places demandées.  
     - Montant de la préautorisation (25€).  
     - Date de la demande.  
     - Statut (pending, accepted, rejected, expired).

3. **Tri et filtres**
   - Given je consulte la liste des demandes  
   - When je navigue dans l'interface  
   - Then :
     - Les demandes sont triées par date (plus récentes en premier).  
     - Je peux filtrer par annonce.  
     - Je peux filtrer par statut (pending, accepted, rejected, expired).  
     - Je peux filtrer par date (plage de dates).

4. **Accès au profil locataire**
   - Given je vois une demande  
   - When je clique sur le profil du locataire  
   - Then je peux accéder au profil complet du locataire depuis la demande.

## Tâches / Sous-tâches

### 1. Extension modèle Booking (si nécessaire)

- [ ] Vérifier que le modèle `Booking` dans `schema.prisma` contient tous les champs nécessaires :
  - [ ] Statuts : `pending`, `accepted`, `rejected`, `expired` (ajouter `accepted` et `rejected` si absents).  
  - [ ] Relations vers `Listing` et `User` (tenant) déjà présentes.  
- [ ] Migration Prisma si modifications.

### 2. Service de récupération demandes pour hôte

- [ ] Étendre `booking.service.ts` dans `server/services/bookings/` :
  - [ ] Fonction `getHostBookingRequests(hostId, filters?)` :
    - Récupère toutes les réservations pour les annonces de l'hôte.  
    - Filtre par statut si fourni.  
    - Filtre par annonce si fourni.  
    - Filtre par date si fourni.  
    - Inclut les relations `tenant` (avec KYC status), `listing`.  
    - Inclut les informations de paiement (préautorisation 25€).  
    - Trie par date de création (desc).

### 3. API – récupération demandes

- [ ] Route `GET /api/host/bookings` :
  - [ ] Auth via `getServerSession`, rôle `host`.  
  - [ ] Query params Zod :
    - `listingId?: string` (filtre par annonce).  
    - `status?: BookingStatus` (filtre par statut).  
    - `startDate?: string` (filtre date début).  
    - `endDate?: string` (filtre date fin).  
  - [ ] Appelle `bookingService.getHostBookingRequests(hostId, filters)`.  
  - [ ] Retourne `{ data: BookingRequestDTO[], meta }`.

### 4. DTO de demande de réservation

- [ ] Créer type `BookingRequestDTO` :
  - [ ] Informations réservation (id, dates, statut, montant préautorisation).  
  - [ ] Informations locataire (id, nom, photo, statut KYC).  
  - [ ] Informations annonce (id, titre).  
  - [ ] Date de création demande.

### 5. UI – page gestion réservations hôte

- [ ] Page `app/(protected)/host/bookings/page.tsx` :
  - [ ] Server Component qui charge les demandes.  
  - [ ] Affiche composant client `HostBookingRequestsList` :
    - [ ] Liste des demandes avec toutes les informations requises.  
    - [ ] Filtres (annonce, statut, date).  
    - [ ] Tri par date (plus récentes en premier).  
    - [ ] Carte de demande cliquable vers détail.

### 6. UI – composant carte demande

- [ ] Composant `BookingRequestCard` dans `components/features/bookings/HostBookingRequestCard.tsx` :
  - [ ] Affiche photo profil locataire + nom.  
  - [ ] Badge statut KYC (si vérifié).  
  - [ ] Dates check-in/check-out.  
  - [ ] Nombre de places.  
  - [ ] Montant préautorisation.  
  - [ ] Date demande.  
  - [ ] Badge statut réservation.  
  - [ ] Lien vers profil locataire.

### 7. UI – page détail demande

- [ ] Page `app/(protected)/host/bookings/[id]/page.tsx` :
  - [ ] Affiche toutes les informations de la demande.  
  - [ ] Boutons "Accepter" / "Refuser" (si statut `pending`).  
  - [ ] Lien vers profil complet locataire.

### 8. Tests

- [ ] Services :
  - [ ] Récupération demandes fonctionne.  
  - [ ] Filtres fonctionnent correctement.
- [ ] API :
  - [ ] GET `/api/host/bookings` fonctionne.  
  - [ ] Filtres via query params fonctionnent.
- [ ] UI :
  - [ ] Liste affiche toutes les informations.  
  - [ ] Filtres et tri fonctionnent.

## Dev Notes (guardrails techniques)

- Ne jamais exposer les emails/téléphones bruts des locataires (masqués ou via chat uniquement).  
- S'assurer que seuls les hôtes propriétaires des annonces peuvent voir les demandes.  
- Optimiser les requêtes avec `include` Prisma pour éviter N+1 queries.

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (vérifier statuts `Booking`).  
  - `src/server/services/bookings/booking.service.ts` (fonction `getHostBookingRequests`).  
  - `src/app/api/host/bookings/route.ts`.
- Frontend :
  - `src/app/(protected)/host/bookings/page.tsx`.  
  - `src/components/features/bookings/HostBookingRequestCard.tsx`.  
  - `src/app/(protected)/host/bookings/[id]/page.tsx`.

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 7, Story 7.1).  
- `_bmad-output/planning-artifacts/prd.md` (Gestion réservations, host dashboard).  
- `_bmad-output/planning-artifacts/architecture.md` (Booking patterns, host management).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 7, Story 7.1)

### Completion Notes List

- [x] Story 7.1 détaillée, visualisation demandes avec filtres, tri et accès profil locataire.  
- [x] Protection données sensibles et vérification ownership hôte.

### File List

- `_bmad-output/implementation-artifacts/7-1-visualisation-demandes-de-reservation-recues.md`.
