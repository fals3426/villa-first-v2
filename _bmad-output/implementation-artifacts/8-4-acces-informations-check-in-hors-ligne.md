# Story 8.4: Accès informations check-in hors ligne

Status: ready-for-dev

## Story

As a **locataire**  
I want **accéder aux informations de check-in hors ligne (adresse, codes, contact)**  
so that **je peux arriver à la coloc même sans connexion internet**.

## Contexte fonctionnel (Epic 8)

- **FR couvert** :
  - **FR48**: Accès informations check-in hors ligne.
- Utilise le service worker PWA pour précharger les informations essentielles.

## Acceptance Criteria

Basés sur `epics.md` (Story 8.4) :

1. **Informations essentielles disponibles**
   - Given j'ai une réservation confirmée  
   - When je suis en mode hors ligne  
   - Then je peux accéder aux informations essentielles de check-in :
     - Adresse complète de la coloc.  
     - Codes d'accès (si fournis par l'hôte).  
     - Contact de l'hôte (téléphone, email masqués mais accessibles).  
     - Instructions d'arrivée (si fournies).

2. **Préchargement via service worker**
   - Given j'ai une réservation confirmée  
   - When l'app se charge  
   - Then les informations sont préchargées via service worker (PWA).  
   - And elles sont stockées dans IndexedDB ou Cache API.

3. **Accès depuis page réservation**
   - Given je suis hors ligne  
   - When j'accède à la page de ma réservation  
   - Then les informations sont accessibles depuis la page de ma réservation.  
   - And elles sont affichées même sans connexion.

4. **Check-in hors ligne**
   - Given je suis hors ligne  
   - When j'effectue le check-in  
   - Then je peux effectuer le check-in même hors ligne.  
   - And les données sont synchronisées quand la connexion revient (queue de synchronisation).

## Tâches / Sous-tâches

### 1. Extension modèle Booking/Listing

- [ ] Vérifier que les informations nécessaires sont disponibles :
  - [ ] `Listing.address` (adresse complète).  
  - [ ] `Listing.accessCodes?: string` (codes d'accès, à ajouter si absent).  
  - [ ] `Listing.arrivalInstructions?: string` (instructions, à ajouter si absent).  
  - [ ] `User.phone`, `User.email` (contact hôte, masqués).
- [ ] Migration Prisma si nécessaire.

### 2. Service de préchargement données

- [ ] Créer `offline.service.ts` dans `server/services/` :
  - [ ] Fonction `getCheckInData(bookingId)` :
    - Récupère toutes les informations nécessaires pour le check-in.  
    - Retourne un DTO avec adresse, codes, contact, instructions.

### 3. API – données check-in

- [ ] Route `GET /api/bookings/[id]/checkin-data` :
  - [ ] Auth via `getServerSession`, rôle `tenant`.  
  - [ ] Vérifie que l'utilisateur est le locataire.  
  - [ ] Retourne les données de check-in (adresse, codes, contact masqué, instructions).

### 4. Service Worker – cache données

- [ ] Dans le service worker (PWA) :
  - [ ] Écouter les requêtes vers `/api/bookings/[id]/checkin-data`.  
  - [ ] Mettre en cache les réponses dans Cache API.  
  - [ ] Servir depuis le cache si hors ligne.

### 5. IndexedDB – stockage local

- [ ] Créer `lib/offline-storage.ts` :
  - [ ] Fonction `storeCheckInData(bookingId, data)` :
    - Stocke les données dans IndexedDB.  
  - [ ] Fonction `getCheckInData(bookingId)` :
    - Récupère les données depuis IndexedDB si hors ligne.

### 6. UI – affichage informations hors ligne

- [ ] Dans la page détail réservation :
  - [ ] Afficher les informations de check-in :
    - [ ] Adresse complète.  
    - [ ] Codes d'accès (si disponibles).  
    - [ ] Contact hôte (masqué, accessible via chat uniquement).  
    - [ ] Instructions d'arrivée (si disponibles).
  - [ ] Détecter le mode hors ligne et afficher depuis cache/IndexedDB.

### 7. Queue de synchronisation check-in

- [ ] Créer `lib/sync-queue.ts` :
  - [ ] Fonction `queueCheckIn(bookingId, checkInData)` :
    - Stocke le check-in dans IndexedDB en attente de synchronisation.  
  - [ ] Fonction `syncPendingCheckIns()` :
    - Envoie tous les check-ins en attente quand connexion revient.

### 8. UI – indicateur mode hors ligne

- [ ] Dans la page check-in :
  - [ ] Afficher indicateur "Mode hors ligne" si pas de connexion.  
  - [ ] Permettre de faire le check-in quand même.  
  - [ ] Afficher message "Synchronisation en attente".

### 9. Tests

- [ ] Services :
  - [ ] Préchargement données fonctionne.  
  - [ ] Stockage IndexedDB fonctionne.
- [ ] UI :
  - [ ] Affichage hors ligne fonctionne.  
  - [ ] Synchronisation fonctionne quand connexion revient.

## Dev Notes (guardrails techniques)

- Ne jamais exposer emails/téléphones bruts (masqués ou via chat uniquement).  
- Gérer les cas où les données ne sont pas encore en cache (première visite hors ligne).  
- S'assurer que la synchronisation est robuste (retry si échec).

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (champs `accessCodes`, `arrivalInstructions` si nécessaires).  
  - `src/server/services/offline.service.ts`.  
  - `src/app/api/bookings/[id]/checkin-data/route.ts`.
- Frontend :
  - `src/lib/offline-storage.ts` (IndexedDB).  
  - `src/lib/sync-queue.ts` (queue synchronisation).  
  - Service worker (cache données).  
  - `src/components/features/checkin/CheckInOfflineInfo.tsx`.

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 8, Story 8.4).  
- `_bmad-output/planning-artifacts/prd.md` (Check-in, offline mode, PWA).  
- `_bmad-output/planning-artifacts/architecture.md` (PWA patterns, offline-first, IndexedDB).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 8, Story 8.4)

### Completion Notes List

- [x] Story 8.4 détaillée, accès hors ligne avec préchargement PWA et synchronisation.  
- [x] Protection données sensibles et queue de synchronisation.

### File List

- `_bmad-output/implementation-artifacts/8-4-acces-informations-check-in-hors-ligne.md`.
