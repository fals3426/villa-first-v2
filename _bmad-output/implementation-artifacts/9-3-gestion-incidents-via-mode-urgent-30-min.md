# Story 9.3: Gestion incidents via mode urgent (<30 min)

Status: ready-for-dev

## Story

As a **support**  
I want **gérer les incidents via un mode urgent avec réponse <30 min**  
so that **les problèmes critiques sont résolus rapidement**.

## Contexte fonctionnel (Epic 9)

- **FR couvert** :
  - **FR52**: Gestion incidents via mode urgent (<30 min).
- Système d'alertes et escalade automatique pour incidents urgents.

## Acceptance Criteria

Basés sur `epics.md` (Story 9.3) :

1. **Marquage incident urgent**
   - Given un incident de check-in est signalé  
   - When l'incident est marqué comme urgent  
   - Then une alerte est générée pour le support.

2. **Timer et SLA**
   - Given un incident urgent est créé  
   - When le support le consulte  
   - Then :
     - Le support doit répondre dans les 30 minutes (premier accusé de réception).  
     - Un timer affiche le temps écoulé depuis le signalement.  
     - Si aucune réponse dans les 30 min, une escalade automatique est déclenchée.

3. **Priorité dans dashboard**
   - Given je suis support  
   - When j'accède au dashboard  
   - Then je peux voir tous les incidents urgents en priorité dans le dashboard.

4. **Notifications**
   - Given un incident urgent est créé  
   - When l'alerte est générée  
   - Then les incidents urgents sont notifiés via notifications push/email au support.

5. **Audit logs**
   - Given des actions sont effectuées sur un incident urgent  
   - When elles sont enregistrées  
   - Then un audit log est créé pour chaque action sur un incident urgent.

## Tâches / Sous-tâches

### 1. Extension modèle Incident

- [ ] Ajouter champs dans `Incident` :
  - [ ] `isUrgent: Boolean @default(false)`.  
  - [ ] `reportedAt: DateTime` (timestamp signalement).  
  - [ ] `firstResponseAt?: DateTime` (première réponse support).  
  - [ ] `escalatedAt?: DateTime` (escalade automatique).
- [ ] Migration Prisma.

### 2. Service de gestion incidents urgents

- [ ] Étendre `support.service.ts` :
  - [ ] Fonction `markIncidentAsUrgent(incidentId)` :
    - Marque l'incident comme urgent.  
    - Crée une alerte.  
    - Envoie notifications au support.
  - [ ] Fonction `acknowledgeIncident(incidentId, supportUserId)` :
    - Enregistre la première réponse (accusé de réception).  
    - Met à jour `firstResponseAt`.  
    - Crée audit log.
  - [ ] Fonction `checkUrgentIncidentsSLA()` :
    - Vérifie les incidents urgents sans réponse >30min.  
    - Déclenche escalade automatique si nécessaire.

### 3. Job d'escalade automatique

- [ ] Créer job/cron `check-urgent-incidents.ts` :
  - [ ] S'exécute toutes les 5 minutes.  
  - [ ] Appelle `supportService.checkUrgentIncidentsSLA()`.  
  - [ ] Envoie notifications d'escalade si nécessaire.

### 4. Service d'escalade

- [ ] Dans `support.service.ts` :
  - [ ] Fonction `escalateIncident(incidentId)` :
    - Met à jour `escalatedAt`.  
    - Envoie notifications d'escalade (email/SMS au manager support).  
    - Crée audit log.

### 5. API – marquer urgent

- [ ] Route `PATCH /api/admin/incidents/[id]/urgent` :
  - [ ] Auth via `getServerSession`, rôle `support`.  
  - [ ] Appelle `supportService.markIncidentAsUrgent(incidentId)`.  
  - [ ] Retourne confirmation.

### 6. API – accusé de réception

- [ ] Route `PATCH /api/admin/incidents/[id]/acknowledge` :
  - [ ] Auth via `getServerSession`, rôle `support`.  
  - [ ] Appelle `supportService.acknowledgeIncident(incidentId, supportUserId)`.  
  - [ ] Retourne confirmation.

### 7. Notifications support

- [ ] Dans `notification.service.ts` :
  - [ ] Fonction `sendUrgentIncidentAlert(incidentId)` :
    - Envoie notification push/email/SMS au support (canal prioritaire).  
    - Contenu : "Incident urgent signalé - Réponse requise dans 30 min".

### 8. UI – timer et indicateurs

- [ ] Dans `IncidentCard` et page détail :
  - [ ] Afficher badge "Urgent" si `isUrgent = true`.  
  - [ ] Afficher timer temps écoulé depuis `reportedAt`.  
  - [ ] Afficher indicateur "SLA dépassé" si >30min sans réponse.  
  - [ ] Bouton "Prendre en charge" (accusé de réception).

### 9. UI – dashboard incidents urgents

- [ ] Dans le dashboard support :
  - [ ] Section "Incidents urgents" en haut.  
  - [ ] Liste des incidents urgents avec timer.  
  - [ ] Alertes visuelles si SLA dépassé.

### 10. Tests

- [ ] Services :
  - [ ] Marquage urgent fonctionne.  
  - [ ] Accusé de réception fonctionne.  
  - [ ] Escalade automatique fonctionne.
- [ ] API :
  - [ ] PATCH urgent/acknowledge fonctionnent.
- [ ] UI :
  - [ ] Timer affiché correctement.  
  - [ ] Alertes visuelles fonctionnent.

## Dev Notes (guardrails techniques)

- Le job d'escalade doit être robuste (gérer les erreurs, retry si nécessaire).  
- Les notifications support doivent être prioritaires (canal dédié si possible).  
- Le timer doit être précis (utiliser temps serveur, pas client).

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (champs urgents dans `Incident`).  
  - `src/server/services/support/support.service.ts` (gestion urgents).  
  - `src/jobs/check-urgent-incidents.ts` (cron job).  
  - `src/app/api/admin/incidents/[id]/urgent/route.ts`.  
  - `src/app/api/admin/incidents/[id]/acknowledge/route.ts`.
- Frontend :
  - `src/components/admin/IncidentCard.tsx` (timer, badge urgent).  
  - Dashboard (section incidents urgents).

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 9, Story 9.3).  
- `_bmad-output/planning-artifacts/prd.md` (Support SLA, urgent incidents).  
- `_bmad-output/planning-artifacts/architecture.md` (Background jobs, notification patterns).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 9, Story 9.3)

### Completion Notes List

- [x] Story 9.3 détaillée, gestion incidents urgents avec SLA 30min et escalade automatique.  
- [x] Timer, notifications prioritaires et job d'escalade.

### File List

- `_bmad-output/implementation-artifacts/9-3-gestion-incidents-via-mode-urgent-30-min.md`.
