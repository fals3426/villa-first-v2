# Story 9.7: Relogement locataire en cas d'incident

Status: ready-for-dev

## Story

As a **support**  
I want **reloger un locataire en cas d'incident**  
so that **le locataire peut trouver une solution alternative rapidement**.

## Contexte fonctionnel (Epic 9)

- **FR couvert** :
  - **FR56**: Relogement locataire en cas d'incident.
- Workflow de relogement avec recherche d'alternatives et création automatique de réservation.

## Acceptance Criteria

Basés sur `epics.md` (Story 9.7) :

1. **Recherche alternatives**
   - Given je suis support et un incident nécessite un relogement  
   - When j'initie un relogement pour un locataire  
   - Then je peux rechercher des annonces alternatives disponibles.

2. **Proposition options**
   - Given j'ai trouvé des alternatives  
   - When je les propose  
   - Then je peux proposer des options de relogement au locataire.

3. **Acceptation/refus locataire**
   - Given des options sont proposées  
   - When le locataire les consulte  
   - Then le locataire peut accepter ou refuser les options proposées.

4. **Création réservation automatique**
   - Given le locataire accepte une option  
   - When l'acceptation est confirmée  
   - Then une nouvelle réservation est créée automatiquement.

5. **Remboursement ancienne réservation**
   - Given une nouvelle réservation est créée  
   - When le processus se termine  
   - Then le remboursement de l'ancienne réservation peut être effectué si nécessaire (Story 9.6).

6. **Notifications**
   - Given un relogement est effectué  
   - When le processus se termine  
   - Then :
     - L'hôte de l'ancienne annonce est notifié du relogement.  
     - Un audit log est créé avec tous les détails du relogement.

## Tâches / Sous-tâches

### 1. Modèle de relogement

- [ ] Créer modèle `Relocation` dans `schema.prisma` :
  - `id: string @id @default(cuid())`  
  - `originalBookingId: string` (relation vers `Booking`, réservation originale)  
  - `newBookingId?: string` (relation vers `Booking`, nouvelle réservation si acceptée)  
  - `tenantId: string` (relation vers `User`)  
  - `proposedListingIds: Json` (liste IDs annonces proposées)  
  - `status: Enum` (`'proposed' | 'accepted' | 'rejected' | 'completed'`)  
  - `reason: string` (raison du relogement)  
  - `createdBy: string` (relation vers `User`, support)  
  - `createdAt: DateTime`  
  - `updatedAt: DateTime`.
- [ ] Migration Prisma.

### 2. Service de relogement

- [ ] Créer `relocation.service.ts` dans `server/services/support/` :
  - [ ] Fonction `proposeRelocation(bookingId, proposedListingIds, reason, supportUserId)` :
    - Vérifie que l'utilisateur a le rôle support.  
    - Vérifie que les annonces proposées sont disponibles.  
    - Crée l'entrée `Relocation` en base.  
    - Envoie notification au locataire avec options.  
    - Crée audit log.  
    - Retourne le relogement créé.
  - [ ] Fonction `acceptRelocation(relocationId, selectedListingId, tenantId)` :
    - Vérifie que le locataire est bien le propriétaire.  
    - Crée une nouvelle réservation pour l'annonce sélectionnée (via `booking.service.ts`).  
    - Met à jour le statut du relogement à `accepted`.  
    - Optionnellement, rembourse l'ancienne réservation (via `refund.service.ts`).  
    - Envoie notifications (locataire, hôte ancienne annonce, hôte nouvelle annonce).  
    - Crée audit log.
  - [ ] Fonction `rejectRelocation(relocationId, tenantId)` :
    - Met à jour le statut à `rejected`.  
    - Envoie notification au support.  
    - Crée audit log.

### 3. Recherche alternatives

- [ ] Dans `relocation.service.ts` :
  - [ ] Fonction `findAlternativeListings(bookingId)` :
    - Récupère les préférences du locataire (budget, localisation, vibes).  
    - Recherche des annonces disponibles correspondantes (via `listing.service.ts`).  
    - Retourne liste d'annonces alternatives.

### 4. API – proposer relogement

- [ ] Route `POST /api/admin/bookings/[id]/relocate` :
  - [ ] Auth via `getServerSession`, rôle `support`.  
  - [ ] Body Zod : `{ proposedListingIds: string[], reason: string }`.  
  - [ ] Appelle `relocationService.proposeRelocation(bookingId, proposedListingIds, reason, supportUserId)`.  
  - [ ] Retourne `{ data: RelocationDTO }`.

### 5. API – accepter relogement

- [ ] Route `PATCH /api/relocations/[id]/accept` :
  - [ ] Auth via `getServerSession`, rôle `tenant`.  
  - [ ] Body Zod : `{ selectedListingId: string }`.  
  - [ ] Appelle `relocationService.acceptRelocation(relocationId, selectedListingId, tenantId)`.  
  - [ ] Retourne confirmation.

### 6. API – refuser relogement

- [ ] Route `PATCH /api/relocations/[id]/reject` :
  - [ ] Auth via `getServerSession`, rôle `tenant`.  
  - [ ] Appelle `relocationService.rejectRelocation(relocationId, tenantId)`.  
  - [ ] Retourne confirmation.

### 7. Notifications

- [ ] Dans `relocation.service.ts` :
  - [ ] Après proposition : `notificationService.sendRelocationProposalNotification(tenantId, relocationId, options)`.  
  - [ ] Après acceptation : notifications à tous les hôtes concernés.  
  - [ ] Après refus : notification au support.

### 8. UI – proposition relogement (support)

- [ ] Dans la page détail réservation (back-office) :
  - [ ] Bouton "Proposer un relogement" :
    - Modal avec :
      - Recherche d'annonces alternatives (avec filtres).  
      - Sélection multiple d'annonces proposées.  
      - Champ "Raison du relogement" (obligatoire).  
      - Confirmation avant soumission.

### 9. UI – acceptation relogement (locataire)

- [ ] Page `app/(protected)/relocations/[id]/page.tsx` :
  - [ ] Affiche les annonces proposées.  
  - [ ] Bouton "Accepter" pour chaque annonce.  
  - [ ] Bouton "Refuser toutes les options".  
  - [ ] Confirmation avant acceptation.

### 10. Tests

- [ ] Services :
  - [ ] Proposition relogement fonctionne.  
  - [ ] Acceptation crée nouvelle réservation.  
  - [ ] Recherche alternatives fonctionne.
- [ ] API :
  - [ ] POST/PATCH relocations fonctionnent.
- [ ] UI :
  - [ ] Formulaire proposition complet.  
  - [ ] Acceptation locataire fonctionne.

## Dev Notes (guardrails techniques)

- Vérifier que les annonces proposées sont bien disponibles avant de proposer.  
- S'assurer que la nouvelle réservation est créée correctement (même dates si possible, ou dates ajustées).  
- Gérer les cas où le locataire refuse toutes les options (notification au support pour autres solutions).

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (modèle `Relocation`).  
  - `src/server/services/support/relocation.service.ts`.  
  - `src/app/api/admin/bookings/[id]/relocate/route.ts`.  
  - `src/app/api/relocations/[id]/accept/route.ts`.  
  - `src/app/api/relocations/[id]/reject/route.ts`.
- Frontend :
  - `src/components/admin/RelocationProposalModal.tsx`.  
  - `src/app/(protected)/relocations/[id]/page.tsx`.

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 9, Story 9.7 + Story 9.6 pour remboursement).  
- `_bmad-output/planning-artifacts/prd.md` (Support, relocation, incident resolution).  
- `_bmad-output/planning-artifacts/architecture.md` (Admin patterns, relocation workflows).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 9, Story 9.7)

### Completion Notes List

- [x] Story 9.7 détaillée, relogement locataire avec recherche alternatives et création automatique réservation.  
- [x] Intégration avec remboursement et notifications complètes.

### File List

- `_bmad-output/implementation-artifacts/9-7-relogement-locataire-en-cas-d-incident.md`.
