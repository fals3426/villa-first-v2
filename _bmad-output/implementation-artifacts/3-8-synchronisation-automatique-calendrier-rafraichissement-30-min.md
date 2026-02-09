# Story 3.8: Synchronisation automatique calendrier (rafraîchissement 30 min)

Status: ready-for-dev

## Story

As a **système**  
I want **synchroniser automatiquement le calendrier toutes les 30 minutes**  
so that **la disponibilité affichée est toujours à jour**.

## Contexte fonctionnel (Epic 3)

- **FR couvert** :
  - **FR20**: Synchronisation automatique calendrier (rafraîchissement 30 min).
- Pour le MVP, la sync concerne principalement les données internes (réservations, blocs manuels) et prépare la logique future d’intégrations externes.

## Acceptance Criteria

Basés sur `epics.md` (Story 3.8) :

1. **Rafraîchissement périodique**
   - Given un calendrier d’annonce existe  
   - When le système exécute la synchronisation automatique  
   - Then :
     - Le calendrier est rafraîchi toutes les **30 minutes**.  
     - Les réservations récentes (nouvelles/annulées) sont prises en compte.  
     - Les modifications manuelles de l’hôte sont préservées.

2. **Journalisation et logs de synchronisation**
   - Given une sync s’exécute  
   - When elle réussit  
   - Then un log minimal est créé (pour traçabilité) :
     - Annonce concernée, période, résultats.  
   - When elle échoue  
   - Then une alerte est créée (utilisée par Epic 9 pour gérer les échecs).

3. **Possibilité de sync manuelle**
   - Given un hôte souhaite rafraîchir sans attendre  
   - When il clique sur un bouton “Synchroniser maintenant”  
   - Then une sync ad hoc est déclenchée pour son annonce, avec les mêmes règles de sécurité et de logging.

## Tâches / Sous-tâches

### 1. Mécanisme de synchronisation

- [ ] Choisir l’implantation pour le MVP :
  - Job cron côté backend (Node process) ou planification via provider (ex. Vercel cron, external scheduler).  
- [ ] Implémenter une fonction `syncListingCalendars()` dans un service dédié (par ex. `calendarSync.service.ts`) :
  - [ ] Parcourt les annonces actives.  
  - [ ] Met à jour `ListingAvailability` selon :
    - Réservations existantes.  
    - Règles internes (aucune intégration externe pour MVP).

### 2. Intégration avec réservations

- [ ] Assurer que les réservations confirmées/annulées sont prises en compte :
  - [ ] `BOOKED` vs `AVAILABLE/BLOCKED` mis à jour correctement lors de la sync.

### 3. API de sync manuelle

- [ ] `POST /api/listings/[id]/calendar/sync` :
  - Auth hôte + ownership.  
  - Appelle la logique de sync **pour cette annonce seulement**.

### 4. UI – bouton “Synchroniser maintenant”

- [ ] Dans `ListingCalendarSection` :
  - [ ] Bouton “Synchroniser maintenant”.  
  - [ ] Affichage d’un état de chargement et d’un message de succès/erreur.

### 5. Tests

- [ ] Services : cohérence des statuts avant/après sync.  
- [ ] API : contrôle d’accès, comportement sur annonces inactives.  
- [ ] UI : UX claire, pas de double sync concurrente côté front.

## Dev Notes (guardrails techniques)

- Penser long terme (intégrations externes Epic Growth) mais garder la V1 simple : pas d’appel vers Airbnb/Booking.  
- Journaliser proprement les échecs pour qu’Epic 9 puisse déclencher des alertes.

## Project Structure Notes

- Backend :
  - `src/server/services/listings/calendar.service.ts` (existant) + `calendarSync.service.ts`.  
  - Process/cron externe pour lancer la sync.  
  - `src/app/api/listings/[id]/calendar/sync/route.ts` pour la sync manuelle.
- Frontend :
  - Bouton de sync dans `ListingCalendarSection`.

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 3, Story 3.8).  
- `_bmad-output/planning-artifacts/prd.md` (NFR – Sync calendrier, fiabilité).  
- `_bmad-output/planning-artifacts/architecture.md` (section sur sync/calendar/monitoring).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 3, Story 3.8)

### Completion Notes List

- [x] Story 3.8 détaillée, sync automatique + manuelle, prête pour dev.  

### File List

- `_bmad-output/implementation-artifacts/3-8-synchronisation-automatique-calendrier-rafraichissement-30-min.md`.

