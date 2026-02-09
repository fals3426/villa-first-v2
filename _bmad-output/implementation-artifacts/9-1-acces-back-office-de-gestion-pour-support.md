# Story 9.1: Accès back-office de gestion pour support

Status: ready-for-dev

## Story

As a **support**  
I want **accéder à un back-office de gestion**  
so that **je peux gérer tous les aspects opérationnels de la plateforme**.

## Contexte fonctionnel (Epic 9)

- **Epic 9 – Support & Opérations**  
  Le support peut gérer les incidents, la fraude, et assurer la qualité de la plateforme via un back-office complet.
- **FR couvert** :
  - **FR50**: Accès back-office de gestion pour support.
- Story de base pour le système de back-office support avec dashboard et sections de gestion.

## Acceptance Criteria

Basés sur `epics.md` (Story 9.1) :

1. **Accès sécurisé**
   - Given je suis un utilisateur avec rôle "support"  
   - When je me connecte  
   - Then j'accède au back-office avec authentification forte requise.  
   - And toutes mes actions sont tracées dans les audit logs.

2. **Dashboard complet**
   - Given je suis connecté en tant que support  
   - When j'accède au back-office  
   - Then je peux voir un dashboard complet avec statistiques clés :
     - Nombre d'incidents.  
     - Vérifications en attente.  
     - Réservations en cours.  
     - Utilisateurs actifs.  
     - Etc.

3. **Sections de gestion**
   - Given je suis dans le back-office  
   - When je navigue  
   - Then j'ai accès aux sections :
     - Gestion des vérifications (Epic 2).  
     - Gestion des incidents (Story 9.2).  
     - Gestion des utilisateurs.  
     - Gestion des annonces.  
     - Gestion des réservations.  
     - Audit logs (Story 9.9).

## Tâches / Sous-tâches

### 1. Extension modèle User pour rôle support

- [ ] Vérifier que `UserType` enum contient `support` :
  - [ ] `enum UserType { tenant, host, support }`.  
- [ ] Migration Prisma si nécessaire.

### 2. Middleware d'authentification support

- [ ] Créer `lib/middleware/support-guard.ts` :
  - [ ] Fonction `requireSupport(session)` :
    - Vérifie que l'utilisateur a le rôle `support`.  
    - Lance erreur 403 si non autorisé.

### 3. Service de statistiques dashboard

- [ ] Créer `support.service.ts` dans `server/services/support/` :
  - [ ] Fonction `getDashboardStats()` :
    - Nombre d'incidents (par statut).  
    - Vérifications en attente.  
    - Réservations en cours.  
    - Utilisateurs actifs (derniers 30 jours).  
    - Retourne un DTO avec toutes les stats.

### 4. API – dashboard

- [ ] Route `GET /api/admin/dashboard` :
  - [ ] Auth via `getServerSession`, rôle `support` (via `support-guard`).  
  - [ ] Appelle `supportService.getDashboardStats()`.  
  - [ ] Retourne `{ data: DashboardStatsDTO }`.

### 5. Layout back-office

- [ ] Créer `app/admin/layout.tsx` :
  - [ ] Vérifie le rôle support (redirection si non autorisé).  
  - [ ] Affiche navigation avec sections :
    - Dashboard.  
    - Vérifications.  
    - Incidents.  
    - Utilisateurs.  
    - Annonces.  
    - Réservations.  
    - Audit logs.

### 6. Page dashboard

- [ ] Page `app/admin/dashboard/page.tsx` :
  - [ ] Server Component qui charge les stats.  
  - [ ] Affiche composants :
    - Cartes statistiques (incidents, vérifications, etc.).  
    - Graphiques (optionnel, pour MVP simple tableaux).  
    - Liste incidents urgents (si Story 9.3 implémentée).

### 7. Navigation admin

- [ ] Composant `AdminNavigation` dans `components/admin/AdminNavigation.tsx` :
  - [ ] Menu latéral avec toutes les sections.  
  - [ ] Indicateur de section active.

### 8. Audit logs pour actions support

- [ ] Dans toutes les actions support :
  - [ ] Appeler `auditService.logAction(action, supportUserId, entityType, entityId, metadata)`.

### 9. Tests

- [ ] Services :
  - [ ] Récupération stats fonctionne.
- [ ] API :
  - [ ] GET dashboard fonctionne.  
  - [ ] Vérification rôle support fonctionne.
- [ ] UI :
  - [ ] Dashboard affiche toutes les stats.  
  - [ ] Navigation fonctionne.

## Dev Notes (guardrails techniques)

- **CRITICAL** : Ne jamais permettre l'accès au back-office sans vérification du rôle support côté backend.  
- Toutes les actions support doivent être tracées dans les audit logs.  
- Le dashboard doit être performant (utiliser des requêtes optimisées, cache si nécessaire).

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (rôle `support` dans `UserType`).  
  - `src/lib/middleware/support-guard.ts`.  
  - `src/server/services/support/support.service.ts`.  
  - `src/app/api/admin/dashboard/route.ts`.
- Frontend :
  - `src/app/admin/layout.tsx`.  
  - `src/app/admin/dashboard/page.tsx`.  
  - `src/components/admin/AdminNavigation.tsx`.

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 9, Story 9.1).  
- `_bmad-output/planning-artifacts/prd.md` (Support, back-office, dashboard).  
- `_bmad-output/planning-artifacts/architecture.md` (Admin routes, support patterns).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 9, Story 9.1)

### Completion Notes List

- [x] Story 9.1 détaillée, back-office support avec dashboard et sections de gestion.  
- [x] Authentification forte et audit logs pour toutes les actions.

### File List

- `_bmad-output/implementation-artifacts/9-1-acces-back-office-de-gestion-pour-support.md`.
