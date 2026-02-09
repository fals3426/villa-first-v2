# Story 8.5: Signalement problème lors du check-in

Status: ready-for-dev

## Story

As a **locataire**  
I want **signaler un problème lors du check-in**  
so that **le support peut intervenir rapidement en cas d'incident**.

## Contexte fonctionnel (Epic 8)

- **FR couvert** :
  - **FR49**: Signalement problème lors du check-in.
- Crée des tickets d'incident pour le support (Epic 9) avec notification urgente.

## Acceptance Criteria

Basés sur `epics.md` (Story 8.5) :

1. **Accès au signalement**
   - Given j'effectue un check-in ou je suis arrivé à la coloc  
   - When je rencontre un problème  
   - Then je peux signaler le problème depuis la page de check-in.

2. **Types de problèmes**
   - Given je signale un problème  
   - When je remplis le formulaire  
   - Then je peux sélectionner le type de problème :
     - Code inopérant.  
     - Villa différente des photos.  
     - Problème d'accès.  
     - Autre (avec description libre).

3. **Description et photos**
   - Given je signale un problème  
   - When je remplis le formulaire  
   - Then :
     - Je peux ajouter une description détaillée du problème.  
     - Je peux joindre des photos pour illustrer le problème.

4. **Envoi immédiat au support**
   - Given je soumets le signalement  
   - When le processus se termine  
   - Then :
     - Le signalement est envoyé immédiatement au support (mode urgent).  
     - L'hôte est également notifié du signalement.  
     - Le statut de la réservation passe à "incident_reported".  
     - Un ticket d'incident est créé dans le back-office support (Epic 9).

## Tâches / Sous-tâches

### 1. Modèle de données incident

- [ ] Créer modèle `Incident` dans `schema.prisma` :
  - `id: string @id @default(cuid())`  
  - `bookingId: string` (relation vers `Booking`)  
  - `reportedBy: string` (relation vers `User`, locataire)  
  - `type: Enum` (`'CODE_INOPERANT' | 'VILLA_DIFFERENTE' | 'PROBLEME_ACCES' | 'AUTRE'`)  
  - `description: string`  
  - `status: Enum` (`'reported' | 'in_progress' | 'resolved'`)  
  - `photos: Json?` (URLs des photos)  
  - `createdAt: DateTime`  
  - `updatedAt: DateTime`.  
- [ ] Migration Prisma.

### 2. Extension modèle Booking

- [ ] Ajouter statut `incident_reported` dans `BookingStatus` enum si absent.  
- [ ] Migration Prisma.

### 3. Service de signalement

- [ ] Créer `incident.service.ts` dans `server/services/` :
  - [ ] Fonction `reportIncident(tenantId, bookingId, { type, description, photos })` :
    - Vérifie que l'utilisateur est le locataire de la réservation.  
    - Crée l'entrée `Incident` en base.  
    - Met à jour le statut de la réservation à `incident_reported`.  
    - Crée un audit log.  
    - Envoie notifications (support + hôte).  
    - Retourne l'incident créé.

### 4. Upload photos incident

- [ ] Dans `photo.service.ts` :
  - [ ] Fonction `uploadIncidentPhotos(files, incidentId)` :
    - Upload vers S3/Cloudinary dans dossier `incidents/`.  
    - Retourne les URLs des photos.

### 5. API – signalement incident

- [ ] Route `POST /api/bookings/[id]/incident` :
  - [ ] Auth via `getServerSession`, rôle `tenant`.  
  - [ ] Body Zod : `{ type: IncidentType, description: string, photos?: File[] }`.  
  - [ ] Valide les photos.  
  - [ ] Appelle `incidentService.reportIncident(tenantId, bookingId, data)`.  
  - [ ] Retourne `{ data: IncidentDTO }`.

### 6. Notifications urgentes

- [ ] Dans `incident.service.ts`, après création :
  - [ ] Appeler `notificationService.sendUrgentIncidentNotification(incidentId)` :
    - Envoie notification push/email/SMS au support (mode urgent).  
    - Envoie notification à l'hôte.  
    - Utilise un canal prioritaire pour le support.

### 7. UI – formulaire signalement

- [ ] Composant `IncidentReportForm` dans `components/features/checkin/IncidentReportForm.tsx` :
  - [ ] Sélection type de problème (radio ou select).  
  - [ ] Champ description (textarea).  
  - [ ] Upload photos multiples.  
  - [ ] Bouton "Signaler le problème" (urgent).  
  - [ ] Confirmation avant soumission.

### 8. UI – intégration dans page check-in

- [ ] Dans la page check-in :
  - [ ] Bouton "Signaler un problème" visible.  
  - [ ] Modal avec formulaire de signalement.  
  - [ ] Affichage message de confirmation après soumission.

### 9. Intégration avec back-office support

- [ ] Préparer pour Epic 9 :
  - [ ] Les incidents créés apparaîtront dans le back-office support.  
  - [ ] Statut `reported` par défaut, puis `in_progress` / `resolved`.

### 10. Tests

- [ ] Services :
  - [ ] Création incident fonctionne.  
  - [ ] Notifications envoyées correctement.
- [ ] API :
  - [ ] POST incident fonctionne.  
  - [ ] Validation photos fonctionne.
- [ ] UI :
  - [ ] Formulaire complet et intuitif.  
  - [ ] Upload photos fonctionne.

## Dev Notes (guardrails techniques)

- Mode urgent : notifications support doivent être prioritaires (<30min SLA selon PRD).  
- Ne jamais bloquer le signalement si upload photos échoue (description suffit).  
- S'assurer que seuls le locataire propriétaire peut signaler un incident pour sa réservation.

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (modèle `Incident`, statut `incident_reported` dans `BookingStatus`).  
  - `src/server/services/incident.service.ts`.  
  - `src/server/services/photos/photo.service.ts` (upload photos incident).  
  - `src/app/api/bookings/[id]/incident/route.ts`.
- Frontend :
  - `src/components/features/checkin/IncidentReportForm.tsx`.  
  - Intégration dans page check-in.

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 8, Story 8.5 + Epic 9 pour support).  
- `_bmad-output/planning-artifacts/prd.md` (Check-in incidents, support SLA).  
- `_bmad-output/planning-artifacts/architecture.md` (Incident management, support workflows).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 8, Story 8.5)

### Completion Notes List

- [x] Story 8.5 détaillée, signalement problèmes avec notifications urgentes et création tickets support.  
- [x] Intégration avec Epic 9 (back-office support) préparée.

### File List

- `_bmad-output/implementation-artifacts/8-5-signalement-probleme-lors-du-check-in.md`.
