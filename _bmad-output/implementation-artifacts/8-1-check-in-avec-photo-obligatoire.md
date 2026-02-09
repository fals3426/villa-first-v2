# Story 8.1: Check-in avec photo obligatoire

Status: ready-for-dev

## Story

As a **locataire**  
I want **effectuer un check-in avec photo obligatoire**  
so that **je peux prouver mon arrivée à la coloc**.

## Contexte fonctionnel (Epic 8)

- **Epic 8 – Check-in & Vérification d'Arrivée**  
  Les locataires peuvent effectuer un check-in avec photo et GPS pour prouver leur arrivée, et signaler des problèmes si nécessaire.
- **FR couvert** :
  - **FR45**: Check-in avec photo obligatoire.
- Première story du système de check-in, avec upload et validation photo.

## Acceptance Criteria

Basés sur `epics.md` (Story 8.1) :

1. **Accès à la page de check-in**
   - Given j'ai une réservation confirmée et je suis arrivé à la coloc  
   - When j'accède à la page de check-in pour ma réservation  
   - Then je peux voir l'interface de check-in avec champ photo obligatoire.

2. **Upload/téléchargement photo**
   - Given je suis sur la page de check-in  
   - When j'effectue le check-in  
   - Then je dois prendre ou uploader une photo pour le check-in.  
   - And la photo est validée (format JPG/PNG, max 10MB).  
   - And je ne peux pas compléter le check-in sans photo (champ obligatoire).

3. **Stockage sécurisé**
   - Given j'ai uploadé une photo valide  
   - When le check-in est soumis  
   - Then :
     - La photo est stockée de manière sécurisée (S3/Cloudinary).  
     - Le check-in est enregistré avec timestamp.  
     - La photo est visible dans l'historique de la réservation.

4. **Notification hôte**
   - Given le check-in est complété  
   - When le processus se termine  
   - Then l'hôte est notifié du check-in effectué (push/email selon préférences Story 6.6).

## Tâches / Sous-tâches

### 1. Modèle de données check-in

- [ ] Créer modèle `CheckIn` dans `schema.prisma` :
  - `id: string @id @default(cuid())`  
  - `bookingId: string` (relation vers `Booking`)  
  - `photoUrl: string` (URL photo stockée)  
  - `latitude?: Float` (optionnel, pour Story 8.2)  
  - `longitude?: Float` (optionnel, pour Story 8.2)  
  - `distanceFromListing?: Float` (optionnel, distance en mètres)  
  - `createdAt: DateTime` (timestamp check-in).  
- [ ] Migration Prisma.

### 2. Service de check-in

- [ ] Créer `checkin.service.ts` dans `server/services/checkin/` :
  - [ ] Fonction `createCheckIn(tenantId, bookingId, photoFile)` :
    - Vérifie que l'utilisateur est le locataire de la réservation.  
    - Vérifie que la réservation est confirmée (`status = 'confirmed'` ou `'accepted'`).  
    - Valide la photo (format, taille).  
    - Upload la photo via `photo.service.ts` (S3/Cloudinary).  
    - Crée l'entrée `CheckIn` en base.  
    - Crée un audit log.  
    - Retourne le check-in créé.

### 3. Validation photo

- [ ] Dans `photo.service.ts` ou `checkin.service.ts` :
  - [ ] Fonction `validateCheckInPhoto(file)` :
    - Vérifie le format (JPG, PNG uniquement).  
    - Vérifie la taille (max 10MB).  
    - Retourne erreur si invalide.

### 4. Upload photo check-in

- [ ] Étendre `photo.service.ts` :
  - [ ] Fonction `uploadCheckInPhoto(file, bookingId)` :
    - Upload vers S3/Cloudinary dans dossier `check-ins/`.  
    - Retourne l'URL de la photo.

### 5. API – création check-in

- [ ] Route `POST /api/bookings/[id]/checkin` :
  - [ ] Auth via `getServerSession`, rôle `tenant`.  
  - [ ] Body FormData : `{ photo: File }`.  
  - [ ] Valide la photo.  
  - [ ] Appelle `checkinService.createCheckIn(tenantId, bookingId, photoFile)`.  
  - [ ] Retourne `{ data: CheckInDTO }`.

### 6. UI – page check-in

- [ ] Page `app/(protected)/bookings/[id]/checkin/page.tsx` :
  - [ ] Server Component qui vérifie que la réservation existe et appartient à l'utilisateur.  
  - [ ] Affiche composant client `CheckInForm` :
    - [ ] Zone de drag & drop ou bouton pour prendre/uploader photo.  
    - [ ] Prévisualisation photo avant soumission.  
    - [ ] Validation côté client (format, taille).  
    - [ ] Bouton "Confirmer le check-in" (désactivé si pas de photo).  
    - [ ] Soumission via API.

### 7. UI – historique check-in

- [ ] Dans la page détail réservation :
  - [ ] Afficher la photo de check-in si disponible.  
  - [ ] Afficher la date/heure du check-in.

### 8. Notifications

- [ ] Dans `checkin.service.ts`, après création :
  - [ ] Appeler `notificationService.sendCheckInNotification(hostId, bookingId)` :
    - Envoie notification push/email selon préférences.

### 9. Tests

- [ ] Services :
  - [ ] Création check-in fonctionne.  
  - [ ] Validation photo fonctionne.
- [ ] API :
  - [ ] POST check-in fonctionne.  
  - [ ] Vérification ownership fonctionne.
- [ ] UI :
  - [ ] Upload photo fonctionne.  
  - [ ] Validation côté client fonctionne.

## Dev Notes (guardrails techniques)

- Photo obligatoire : ne jamais permettre de soumettre sans photo.  
- Stockage sécurisé : utiliser S3/Cloudinary, jamais stocker directement en base.  
- Vérifier que seul le locataire propriétaire peut faire le check-in.

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (modèle `CheckIn`).  
  - `src/server/services/checkin/checkin.service.ts`.  
  - `src/server/services/photos/photo.service.ts` (upload check-in).  
  - `src/app/api/bookings/[id]/checkin/route.ts`.
- Frontend :
  - `src/app/(protected)/bookings/[id]/checkin/page.tsx`.  
  - `src/components/features/checkin/CheckInForm.tsx`.

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 8, Story 8.1).  
- `_bmad-output/planning-artifacts/prd.md` (Check-in, photo upload).  
- `_bmad-output/planning-artifacts/architecture.md` (Photo storage, PWA patterns).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 8, Story 8.1)

### Completion Notes List

- [x] Story 8.1 détaillée, check-in avec photo obligatoire, validation et stockage sécurisé.  
- [x] Notifications hôte et historique réservation.

### File List

- `_bmad-output/implementation-artifacts/8-1-check-in-avec-photo-obligatoire.md`.
