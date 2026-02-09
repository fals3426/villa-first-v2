# Story 9.2: Visualisation incidents de check-in

Status: ready-for-dev

## Story

As a **support**  
I want **voir les incidents de check-in signalés**  
so that **je peux intervenir rapidement pour résoudre les problèmes**.

## Contexte fonctionnel (Epic 9)

- **FR couvert** :
  - **FR51**: Visualisation incidents de check-in.
- Utilise le modèle `Incident` créé dans Story 8.5.

## Acceptance Criteria

Basés sur `epics.md` (Story 9.2) :

1. **Liste des incidents**
   - Given je suis support et j'accède au back-office  
   - When je consulte la section incidents  
   - Then je peux voir tous les incidents de check-in signalés.

2. **Informations par incident**
   - Given je consulte un incident  
   - When je le vois dans la liste  
   - Then je peux voir :
     - Informations locataire et hôte.  
     - Détails de la réservation.  
     - Type de problème signalé.  
     - Description et photos jointes.  
     - Date et heure du signalement.  
     - Statut (nouveau, en cours, résolu).

3. **Tri et filtres**
   - Given je consulte la liste  
   - When je navigue  
   - Then :
     - Les incidents sont triés par priorité (urgents en premier).  
     - Je peux filtrer par statut.  
     - Je peux filtrer par type.  
     - Je peux filtrer par date.

4. **Historique des actions**
   - Given je consulte un incident  
   - When j'accède au détail  
   - Then je peux voir l'historique des actions prises sur chaque incident.

## Tâches / Sous-tâches

### 1. Service de récupération incidents

- [ ] Étendre `support.service.ts` :
  - [ ] Fonction `getIncidents(filters?)` :
    - Récupère tous les incidents avec relations (`booking`, `reportedBy`, `booking.listing`, `booking.listing.host`).  
    - Filtre par statut si fourni.  
    - Filtre par type si fourni.  
    - Filtre par date si fourni.  
    - Trie par priorité (urgents en premier, puis date création desc).  
    - Retourne liste d'incidents avec toutes les informations.

### 2. API – liste incidents

- [ ] Route `GET /api/admin/incidents` :
  - [ ] Auth via `getServerSession`, rôle `support`.  
  - [ ] Query params Zod :
    - `status?: IncidentStatus`  
    - `type?: IncidentType`  
    - `startDate?: string`  
    - `endDate?: string`  
  - [ ] Appelle `supportService.getIncidents(filters)`.  
  - [ ] Retourne `{ data: IncidentDTO[], meta }`.

### 3. API – détail incident

- [ ] Route `GET /api/admin/incidents/[id]` :
  - [ ] Auth via `getServerSession`, rôle `support`.  
  - [ ] Retourne l'incident avec toutes les relations et historique.

### 4. DTO incident

- [ ] Créer type `IncidentDTO` :
  - [ ] Informations incident (id, type, description, statut, photos).  
  - [ ] Informations locataire (id, nom, email masqué).  
  - [ ] Informations hôte (id, nom, email masqué).  
  - [ ] Détails réservation (id, dates, annonce).  
  - [ ] Date/heure signalement.  
  - [ ] Historique actions (audit logs).

### 5. UI – page liste incidents

- [ ] Page `app/admin/incidents/page.tsx` :
  - [ ] Server Component qui charge les incidents.  
  - [ ] Affiche composant client `IncidentsList` :
    - [ ] Liste des incidents avec toutes les informations.  
    - [ ] Filtres (statut, type, date).  
    - [ ] Tri par priorité.  
    - [ ] Carte incident cliquable vers détail.

### 6. UI – composant carte incident

- [ ] Composant `IncidentCard` dans `components/admin/IncidentCard.tsx` :
  - [ ] Affiche type problème (badge).  
  - [ ] Affiche statut (badge coloré).  
  - [ ] Affiche informations locataire/hôte.  
  - [ ] Affiche date signalement.  
  - [ ] Badge "Urgent" si priorité élevée.

### 7. UI – page détail incident

- [ ] Page `app/admin/incidents/[id]/page.tsx` :
  - [ ] Affiche toutes les informations de l'incident.  
  - [ ] Affiche photos jointes.  
  - [ ] Affiche historique des actions (audit logs).  
  - [ ] Boutons actions (marquer en cours, résoudre, etc. - Story 9.3).

### 8. Tests

- [ ] Services :
  - [ ] Récupération incidents fonctionne.  
  - [ ] Filtres fonctionnent correctement.
- [ ] API :
  - [ ] GET incidents fonctionne.  
  - [ ] GET détail incident fonctionne.
- [ ] UI :
  - [ ] Liste affiche toutes les informations.  
  - [ ] Filtres et tri fonctionnent.

## Dev Notes (guardrails techniques)

- Ne jamais exposer emails/téléphones bruts (masqués dans les DTOs).  
- S'assurer que seuls les utilisateurs avec rôle support peuvent accéder aux incidents.  
- Optimiser les requêtes avec `include` Prisma pour éviter N+1 queries.

## Project Structure Notes

- Backend :
  - `src/server/services/support/support.service.ts` (fonction `getIncidents`).  
  - `src/app/api/admin/incidents/route.ts`.  
  - `src/app/api/admin/incidents/[id]/route.ts`.
- Frontend :
  - `src/app/admin/incidents/page.tsx`.  
  - `src/components/admin/IncidentCard.tsx`.  
  - `src/app/admin/incidents/[id]/page.tsx`.

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 9, Story 9.2 + Story 8.5 pour modèle Incident).  
- `_bmad-output/planning-artifacts/prd.md` (Support, incident management).  
- `_bmad-output/planning-artifacts/architecture.md` (Admin patterns, incident workflows).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 9, Story 9.2)

### Completion Notes List

- [x] Story 9.2 détaillée, visualisation incidents avec filtres, tri et historique actions.  
- [x] Protection données sensibles et optimisation requêtes.

### File List

- `_bmad-output/implementation-artifacts/9-2-visualisation-incidents-de-check-in.md`.
