# Story 8.3: Stockage preuves de check-in (photo + GPS)

Status: ready-for-dev

## Story

As a **système**  
I want **stocker les preuves de check-in (photo + GPS)**  
so that **je peux tracer les arrivées et résoudre les litiges si nécessaire**.

## Contexte fonctionnel (Epic 8)

- **FR couvert** :
  - **FR47**: Stockage preuves de check-in (photo + GPS).
- Consolide le stockage sécurisé des preuves avec audit logs et accès hôte/support.

## Acceptance Criteria

Basés sur `epics.md` (Story 8.3) :

1. **Stockage complet**
   - Given un locataire effectue un check-in  
   - When le check-in est complété  
   - Then :
     - La photo et les coordonnées GPS sont stockées dans la base de données.  
     - Les preuves sont liées à la réservation spécifique.

2. **Sécurité**
   - Given les preuves sont stockées  
   - When elles sont sauvegardées  
   - Then les preuves sont stockées de manière sécurisée (chiffrement si nécessaire).

3. **Accès hôte et support**
   - Given les preuves sont stockées  
   - When l'hôte ou le support les consulte  
   - Then les preuves sont visibles par l'hôte et le support.  
   - And l'hôte peut voir les preuves de check-in pour ses réservations.  
   - And le support peut voir toutes les preuves (Epic 9).

4. **Audit log**
   - Given un check-in est créé  
   - When il est sauvegardé  
   - Then un audit log est créé avec :
     - Timestamp précis.  
     - Toutes les données du check-in (photo URL, GPS, distance).  
     - Utilisateur qui a effectué le check-in.

5. **Conservation légale**
   - Given les preuves sont stockées  
   - When elles sont archivées  
   - Then les preuves sont conservées selon les exigences légales (durée de rétention définie).

## Tâches / Sous-tâches

### 1. Vérification modèle CheckIn

- [ ] Vérifier que le modèle `CheckIn` contient tous les champs nécessaires :
  - [ ] `photoUrl: string` (URL sécurisée).  
  - [ ] `latitude?: Float`, `longitude?: Float`.  
  - [ ] `distanceFromListing?: Float`.  
  - [ ] `bookingId: string` (relation vers `Booking`).  
  - [ ] `createdAt: DateTime`.

### 2. Chiffrement données sensibles (si requis)

- [ ] Évaluer si chiffrement nécessaire :
  - [ ] Photos : stockées sur S3/Cloudinary (chiffrement au repos si requis).  
  - [ ] Coordonnées GPS : stockées en clair en base (acceptable pour MVP, chiffrement optionnel si requis légalement).

### 3. Audit log pour check-in

- [ ] Dans `checkin.service.ts`, après création :
  - [ ] Appeler `auditService.logAction('CHECK_IN_COMPLETED', tenantId, 'CheckIn', checkInId, { photoUrl, latitude, longitude, distance })`.

### 4. API – récupération check-in pour hôte

- [ ] Route `GET /api/host/bookings/[id]/checkin` :
  - [ ] Auth via `getServerSession`, rôle `host`.  
  - [ ] Vérifie que l'hôte est propriétaire de l'annonce.  
  - [ ] Retourne le check-in avec photo URL et GPS.

### 5. API – récupération check-in pour support

- [ ] Route `GET /api/admin/bookings/[id]/checkin` :
  - [ ] Auth via `getServerSession`, rôle `support`.  
  - [ ] Retourne le check-in avec toutes les preuves.

### 6. UI – affichage preuves pour hôte

- [ ] Dans la page détail réservation hôte :
  - [ ] Afficher la photo de check-in.  
  - [ ] Afficher les coordonnées GPS et distance si disponibles.  
  - [ ] Afficher la date/heure du check-in.

### 7. UI – affichage preuves pour support

- [ ] Dans le back-office support (Epic 9) :
  - [ ] Afficher toutes les preuves de check-in pour une réservation.  
  - [ ] Afficher les audit logs associés.

### 8. Politique de rétention

- [ ] Définir durée de rétention :
  - [ ] Photos : conserver selon exigences légales (ex: 2 ans après fin réservation).  
  - [ ] Coordonnées GPS : même durée.  
  - [ ] Audit logs : durée plus longue (ex: 5 ans).

### 9. Tests

- [ ] Services :
  - [ ] Stockage complet fonctionne.  
  - [ ] Audit logs créés correctement.
- [ ] API :
  - [ ] Accès hôte fonctionne.  
  - [ ] Accès support fonctionne.
- [ ] Sécurité :
  - [ ] Vérification ownership fonctionne.  
  - [ ] Données sensibles protégées.

## Dev Notes (guardrails techniques)

- Ne jamais supprimer les preuves avant la fin de la période de rétention légale.  
- S'assurer que seuls l'hôte propriétaire et le support peuvent voir les preuves.  
- Stocker les photos sur S3/Cloudinary avec URLs sécurisées (signed URLs si nécessaire).

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (modèle `CheckIn` complet).  
  - `src/server/services/checkin/checkin.service.ts` (audit logs).  
  - `src/server/services/audit.service.ts` (logs check-in).  
  - `src/app/api/host/bookings/[id]/checkin/route.ts`.  
  - `src/app/api/admin/bookings/[id]/checkin/route.ts`.
- Frontend :
  - `src/components/features/checkin/CheckInProofs.tsx` (affichage preuves).

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 8, Story 8.3 + Epic 9 pour support).  
- `_bmad-output/planning-artifacts/prd.md` (Check-in, audit logs, support access).  
- `_bmad-output/planning-artifacts/architecture.md` (Security patterns, audit trails).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 8, Story 8.3)

### Completion Notes List

- [x] Story 8.3 détaillée, stockage sécurisé avec audit logs et accès hôte/support.  
- [x] Politique de rétention et protection données sensibles.

### File List

- `_bmad-output/implementation-artifacts/8-3-stockage-preuves-de-check-in-photo-gps.md`.
