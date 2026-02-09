# Story 8.2: Check-in avec géolocalisation GPS

Status: ready-for-dev

## Story

As a **locataire**  
I want **effectuer un check-in avec géolocalisation GPS**  
so that **ma position est enregistrée pour prouver mon arrivée à l'adresse correcte**.

## Contexte fonctionnel (Epic 8)

- **FR couvert** :
  - **FR46**: Check-in avec géolocalisation GPS.
- Extension de Story 8.1 avec capture GPS et calcul de distance.

## Acceptance Criteria

Basés sur `epics.md` (Story 8.2) :

1. **Demande autorisation géolocalisation**
   - Given j'ai une réservation confirmée  
   - When j'effectue le check-in  
   - Then le système demande l'autorisation de géolocalisation (si pas déjà accordée).  
   - And je peux accepter ou refuser.

2. **Capture position GPS**
   - Given j'ai autorisé la géolocalisation  
   - When j'effectue le check-in  
   - Then ma position GPS est capturée lors du check-in.  
   - And les coordonnées GPS (latitude, longitude) sont stockées avec le check-in.

3. **Calcul distance**
   - Given ma position GPS est capturée  
   - When le check-in est complété  
   - Then la distance entre ma position et l'adresse de l'annonce est calculée.  
   - And si la distance est trop importante (>500m), un avertissement est affiché (mais le check-in peut être confirmé).

4. **Géolocalisation PWA**
   - Given j'utilise l'app PWA  
   - When la géolocalisation est demandée  
   - Then la géolocalisation utilise l'API Browser (PWA) avec précision acceptable pour MVP.

5. **Fallback si échec**
   - Given la géolocalisation échoue  
   - When j'effectue le check-in  
   - Then le check-in peut quand même être complété avec photo uniquement (GPS optionnel).

## Tâches / Sous-tâches

### 1. Extension modèle CheckIn

- [ ] Vérifier que le modèle `CheckIn` contient :
  - [ ] `latitude?: Float` (déjà prévu dans Story 8.1).  
  - [ ] `longitude?: Float` (déjà prévu dans Story 8.1).  
  - [ ] `distanceFromListing?: Float` (distance en mètres).  
- [ ] Migration Prisma si nécessaire.

### 2. Service de calcul distance

- [ ] Créer `geolocation.service.ts` dans `server/services/` (ou étendre si existe) :
  - [ ] Fonction `calculateDistance(lat1, lon1, lat2, lon2)` :
    - Calcule la distance en mètres entre deux coordonnées GPS (formule Haversine).  
    - Retourne la distance en mètres.

### 3. Extension service check-in

- [ ] Dans `checkin.service.ts` :
  - [ ] Modifier `createCheckIn` pour accepter `latitude?` et `longitude?` :
    - Si GPS fourni, calculer la distance avec l'adresse de l'annonce.  
    - Stocker latitude, longitude, distance dans le modèle `CheckIn`.

### 4. Hook géolocalisation frontend

- [ ] Créer `hooks/useGeolocation.ts` :
  - [ ] Demande permission via `navigator.geolocation.getCurrentPosition()`.  
  - [ ] Capture coordonnées GPS.  
  - [ ] Gère les erreurs (permission refusée, timeout, etc.).  
  - [ ] Retourne `{ latitude, longitude, error }`.

### 5. Extension API check-in

- [ ] Route `POST /api/bookings/[id]/checkin` :
  - [ ] Body FormData : `{ photo: File, latitude?: number, longitude?: number }`.  
  - [ ] Transmet les coordonnées GPS au service.

### 6. UI – intégration GPS dans formulaire

- [ ] Dans `CheckInForm` :
  - [ ] Bouton "Activer la géolocalisation" :
    - Demande permission via `useGeolocation`.  
    - Affiche indicateur de chargement pendant capture.  
    - Affiche coordonnées capturées si succès.
  - [ ] Affiche avertissement si distance > 500m :
    - Message : "Vous êtes à plus de 500m de l'adresse. Voulez-vous continuer ?"  
    - Permet de confirmer quand même.

### 7. UI – affichage distance

- [ ] Dans la page détail réservation :
  - [ ] Afficher la distance calculée si GPS disponible.  
  - [ ] Afficher les coordonnées GPS (optionnel, pour debug).

### 8. Tests

- [ ] Services :
  - [ ] Calcul distance fonctionne correctement.  
  - [ ] Check-in avec GPS fonctionne.
- [ ] UI :
  - [ ] Capture GPS fonctionne.  
  - [ ] Avertissement distance fonctionne.  
  - [ ] Fallback sans GPS fonctionne.

## Dev Notes (guardrails techniques)

- GPS optionnel : ne jamais bloquer le check-in si GPS échoue (photo suffit).  
- Gérer les erreurs de géolocalisation (permission refusée, timeout, précision insuffisante).  
- Calcul distance avec formule Haversine (précision acceptable pour MVP).

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (champs GPS dans `CheckIn`).  
  - `src/server/services/geolocation.service.ts` (calcul distance).  
  - `src/server/services/checkin/checkin.service.ts` (intégration GPS).
- Frontend :
  - `src/hooks/useGeolocation.ts`.  
  - `src/components/features/checkin/CheckInForm.tsx` (intégration GPS).

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 8, Story 8.2).  
- `_bmad-output/planning-artifacts/prd.md` (Check-in GPS, géolocalisation).  
- `_bmad-output/planning-artifacts/architecture.md` (PWA geolocation patterns).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 8, Story 8.2)

### Completion Notes List

- [x] Story 8.2 détaillée, géolocalisation GPS avec calcul distance et fallback si échec.  
- [x] Avertissement si distance trop importante mais check-in possible quand même.

### File List

- `_bmad-output/implementation-artifacts/8-2-check-in-avec-geolocalisation-gps.md`.
