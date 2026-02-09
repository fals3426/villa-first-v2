# Story 9.8: Génération alertes pour sync calendrier en échec

Status: ready-for-dev

## Story

As a **système**  
I want **générer des alertes pour les synchronisations de calendrier en échec**  
so that **le support peut intervenir rapidement pour résoudre les problèmes techniques**.

## Contexte fonctionnel (Epic 9)

- **FR couvert** :
  - **FR57**: Génération alertes pour sync calendrier en échec.
- Système d'alertes automatiques pour problèmes techniques de synchronisation calendrier (Story 3.8).

## Acceptance Criteria

Basés sur `epics.md` (Story 9.8) :

1. **Détection échec**
   - Given une synchronisation automatique de calendrier échoue  
   - When l'échec est détecté  
   - Then une alerte est générée dans le back-office support.

2. **Contenu alerte**
   - Given une alerte est générée  
   - When je la consulte  
   - Then l'alerte contient :
     - Identifiant de l'annonce concernée.  
     - Type d'erreur.  
     - Date et heure de l'échec.  
     - Nombre de tentatives échouées.

3. **Visibilité dashboard**
   - Given des alertes sont générées  
   - When je consulte le dashboard support  
   - Then les alertes sont visibles dans le dashboard support.

4. **Historique**
   - Given je consulte les alertes  
   - When je navigue  
   - Then je peux voir l'historique des alertes.

5. **Résolution**
   - Given je consulte une alerte  
   - When je la résous  
   - Then le support peut marquer les alertes comme résolues.

6. **Escalade**
   - Given plusieurs échecs consécutifs se produisent  
   - When le seuil est atteint  
   - Then un email de notification est envoyé au support si plusieurs échecs consécutifs.

## Tâches / Sous-tâches

### 1. Modèle d'alerte

- [ ] Créer modèle `CalendarSyncAlert` dans `schema.prisma` :
  - `id: string @id @default(cuid())`  
  - `listingId: string` (relation vers `Listing`)  
  - `errorType: string` (type d'erreur)  
  - `errorMessage: string` (message d'erreur détaillé)  
  - `failedAttempts: Int @default(1)` (nombre tentatives échouées)  
  - `firstFailedAt: DateTime` (première échec)  
  - `lastFailedAt: DateTime` (dernier échec)  
  - `status: Enum` (`'active' | 'resolved' | 'escalated'`)  
  - `resolvedAt?: DateTime`  
  - `resolvedBy?: string` (relation vers `User`, support)  
  - `createdAt: DateTime`  
  - `updatedAt: DateTime`.
- [ ] Migration Prisma.

### 2. Service de gestion alertes

- [ ] Créer `alert.service.ts` dans `server/services/support/` :
  - [ ] Fonction `createCalendarSyncAlert(listingId, errorType, errorMessage)` :
    - Vérifie si une alerte active existe déjà pour cette annonce.  
    - Si oui, incrémente `failedAttempts` et met à jour `lastFailedAt`.  
    - Si non, crée une nouvelle alerte.  
    - Si `failedAttempts >= 3`, marque comme `escalated` et envoie email.  
    - Crée audit log.
  - [ ] Fonction `resolveAlert(alertId, supportUserId)` :
    - Met à jour le statut à `resolved`.  
    - Met à jour `resolvedAt` et `resolvedBy`.  
    - Crée audit log.
  - [ ] Fonction `getActiveAlerts()` :
    - Récupère toutes les alertes actives.  
    - Trie par nombre tentatives (plus critiques en premier).

### 3. Intégration avec service calendrier

- [ ] Dans `calendar.service.ts`, lors d'un échec de synchronisation :
  - [ ] Appeler `alertService.createCalendarSyncAlert(listingId, errorType, errorMessage)`.

### 4. API – liste alertes

- [ ] Route `GET /api/admin/alerts/calendar-sync` :
  - [ ] Auth via `getServerSession`, rôle `support`.  
  - [ ] Query params : `status?: AlertStatus`.  
  - [ ] Appelle `alertService.getActiveAlerts()` ou filtres.  
  - [ ] Retourne `{ data: AlertDTO[], meta }`.

### 5. API – résoudre alerte

- [ ] Route `PATCH /api/admin/alerts/[id]/resolve` :
  - [ ] Auth via `getServerSession`, rôle `support`.  
  - [ ] Appelle `alertService.resolveAlert(alertId, supportUserId)`.  
  - [ ] Retourne confirmation.

### 6. Notifications escalade

- [ ] Dans `alert.service.ts`, lors de l'escalade :
  - [ ] Appeler `notificationService.sendEscalationEmail(supportEmail, alertId)` :
    - Envoie email au support avec détails de l'alerte.

### 7. UI – dashboard alertes

- [ ] Dans le dashboard support :
  - [ ] Section "Alertes calendrier" :
    - Liste des alertes actives avec nombre tentatives.  
    - Badge "Escaladé" si `status = 'escalated'`.  
    - Bouton "Résoudre" pour chaque alerte.

### 8. UI – page liste alertes

- [ ] Page `app/admin/alerts/calendar-sync/page.tsx` :
  - [ ] Liste complète des alertes avec filtres (statut, annonce).  
  - [ ] Historique des alertes résolues.  
  - [ ] Détails de chaque alerte (erreur, tentatives, dates).

### 9. Tests

- [ ] Services :
  - [ ] Création alerte fonctionne.  
  - [ ] Incrémentation tentatives fonctionne.  
  - [ ] Escalade automatique fonctionne.
- [ ] API :
  - [ ] GET/PATCH alertes fonctionnent.
- [ ] UI :
  - [ ] Dashboard affiche alertes.  
  - [ ] Résolution fonctionne.

## Dev Notes (guardrails techniques)

- Ne pas créer de doublons d'alertes pour la même annonce (mettre à jour l'existante).  
- Le seuil d'escalade (3 tentatives) doit être configurable.  
- S'assurer que les alertes sont bien nettoyées après résolution.

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (modèle `CalendarSyncAlert`).  
  - `src/server/services/support/alert.service.ts`.  
  - `src/server/services/calendar/calendar.service.ts` (intégration création alertes).  
  - `src/app/api/admin/alerts/calendar-sync/route.ts`.  
  - `src/app/api/admin/alerts/[id]/resolve/route.ts`.
- Frontend :
  - Dashboard support (section alertes).  
  - `src/app/admin/alerts/calendar-sync/page.tsx`.

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 9, Story 9.8 + Story 3.8 pour sync calendrier).  
- `_bmad-output/planning-artifacts/prd.md` (Support, technical alerts, calendar sync).  
- `_bmad-output/planning-artifacts/architecture.md` (Alert patterns, background jobs).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 9, Story 9.8)

### Completion Notes List

- [x] Story 9.8 détaillée, génération alertes pour sync calendrier avec escalade automatique.  
- [x] Intégration avec service calendrier et notifications escalade.

### File List

- `_bmad-output/implementation-artifacts/9-8-generation-alertes-pour-sync-calendrier-en-echec.md`.
