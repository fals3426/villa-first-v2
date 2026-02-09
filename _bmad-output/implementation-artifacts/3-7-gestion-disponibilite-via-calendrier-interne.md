# Story 3.7: Gestion disponibilité via calendrier interne

Status: ready-for-dev

## Story

As a **hôte**  
I want **gérer la disponibilité de ma coloc via un calendrier interne**  
so that **je peux indiquer quelles dates sont disponibles pour les réservations**.

## Contexte fonctionnel (Epic 3)

- **FR couvert** :
  - **FR19**: Gestion disponibilité via calendrier interne.
- Base pour la sync auto (3.8) et la réservation (Epic 5).

## Acceptance Criteria

Basés sur `epics.md` (Story 3.7) :

1. **Vue calendrier pour chaque annonce**
   - Given j’ai créé une annonce  
   - When j’accède à la section “Calendrier” de cette annonce  
   - Then je vois un calendrier mensuel avec les dates marquées comme disponibles ou indisponibles.

2. **Gestion disponibilité/indisponibilité**
   - Given je suis sur la vue calendrier  
   - When je clique sur une date ou une plage de dates  
   - Then je peux :
     - Marquer ces dates comme disponibles.  
     - Marquer ces dates comme indisponibles.  
   - And les changements sont sauvegardés en base.

3. **Prise en compte des réservations**
   - Given des réservations existent pour certaines dates  
   - When j’affiche le calendrier  
   - Then :
     - Les dates avec réservations confirmées sont automatiquement marquées comme occupées / indisponibles.  
     - Je ne peux pas les rendre disponibles manuellement sans casser la logique métier (bloqué côté backend).

4. **Synchronisation avec les réservations**
   - Given une nouvelle réservation est créée (Epic 5)  
   - When la réservation est confirmée  
   - Then les dates correspondantes sont automatiquement reflétées comme indisponibles dans le calendrier.

5. **Sauvegarde en temps réel**
   - Given je modifie le calendrier  
   - When je sors de la page  
   - Then mes modifications sont persistées et visibles à la prochaine ouverture.

## Tâches / Sous-tâches

### 1. Modèle de données calendrier

- [ ] Ajouter un modèle `ListingAvailability` (ou similaire) dans `schema.prisma` :
  - `id`, `listingId`, `date`, `status` (`AVAILABLE`, `BLOCKED`, `BOOKED`).  
  - `source` (optionnel : `MANUAL`, `BOOKING`).  
  - Index sur (`listingId`, `date`).
- [ ] Migration Prisma.

### 2. Services de calendrier

- [ ] Créer `calendar.service.ts` dans `server/services/listings/` :
  - [ ] `getCalendarForListing(listingId, month, year)`  
  - [ ] `setAvailability(listingId, hostId, { from, to, status })`  
  - [ ] Intégration avec le service de réservation (pour marquer `BOOKED`).

### 3. APIs calendrier

- [ ] Routes :
  - `GET /api/listings/[id]/calendar?month=&year=`  
  - `POST /api/listings/[id]/calendar` pour modifier des plages (body `{ from, to, status }`).
- [ ] Auth + rôle `host` + ownership pour modifications.

### 4. UI hôte – calendrier

- [ ] Composant `ListingCalendarSection` :
  - [ ] Affiche un calendrier mensuel interactif.  
  - [ ] Permet sélection d’une date ou plage (drag ou sélecteurs).  
  - [ ] Envoie les modifications au backend.  
  - [ ] Affiche un code couleur clair (disponible, bloqué, réservé).

### 5. Intégration réservations

- [ ] Lors de la confirmation de réservation :
  - [ ] Le service de réservation met à jour `ListingAvailability` pour les dates (`status = BOOKED`, `source = BOOKING`).  
  - [ ] Le calendrier se base sur ce modèle pour affichage.

### 6. Tests

- [ ] Services :
  - [ ] Gestion correcte des statuts (priorité aux réservations).  
- [ ] API :
  - [ ] Contrôle d’accès, validation des plages.  
- [ ] UI :
  - [ ] Interaction naturelle pour l’hôte, cohérente avec NFR UX.

## Dev Notes (guardrails techniques)

- Garder la logique d’agrégation (calendrier complet) côté backend.  
- Penser aux futurs connecteurs (Epic Growth pour calendriers externes), mais se concentrer sur l’interne pour le MVP.

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (modèle `ListingAvailability`).  
  - `src/server/services/listings/calendar.service.ts`.  
  - `src/app/api/listings/[id]/calendar/route.ts`.
- Frontend :
  - `src/components/features/listings/ListingCalendarSection.tsx`.

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 3, Story 3.7).  
- `_bmad-output/planning-artifacts/prd.md` (Calendar, Booking).  
- `_bmad-output/planning-artifacts/architecture.md`.

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 3, Story 3.7)

### Completion Notes List

- [x] Story 3.7 détaillée, calendrier interne aligné sur flux de réservation.  

### File List

- `_bmad-output/implementation-artifacts/3-7-gestion-disponibilite-via-calendrier-interne.md`.

