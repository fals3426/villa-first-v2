# Story 6.6: Configuration préférences de notifications

Status: ready-for-dev

## Story

As a **utilisateur**  
I want **configurer mes préférences de notifications**  
so that **je contrôle quels types de notifications je reçois et par quels canaux**.

## Contexte fonctionnel (Epic 6)

- **FR couvert** :
  - **FR42**: Configuration préférences de notifications.
- Centralise la gestion des préférences pour toutes les stories de notifications (6.3, 6.4, 6.5, 6.7, 6.8).

## Acceptance Criteria

Basés sur `epics.md` (Story 6.6) :

1. **Accès aux préférences**
   - Given je suis un utilisateur connecté  
   - When j'accède à la page de préférences de notifications  
   - Then je peux voir et modifier toutes mes préférences de notifications.

2. **Activation/désactivation par canal**
   - Given je consulte les préférences  
   - When je modifie les canaux  
   - Then je peux activer/désactiver indépendamment :
     - Notifications push.  
     - Notifications email.  
     - Notifications SMS.

3. **Choix des types d'événements**
   - Given je configure mes préférences  
   - When je sélectionne les types d'événements  
   - Then je peux choisir pour lesquels je veux être notifié :
     - Nouvelles demandes de réservation.  
     - Nouveaux messages.  
     - Validation de colocation.  
     - Problèmes check-in.  
     - Annonces correspondant à mes critères.  
     - Places libérées dans colocs suivies.

4. **Sauvegarde et application**
   - Given je modifie mes préférences  
   - When je sauvegarde  
   - Then :
     - Mes préférences sont sauvegardées dans mon profil.  
     - Les préférences s'appliquent immédiatement après sauvegarde.  
     - Je peux voir un aperçu de mes préférences actuelles.

## Tâches / Sous-tâches

### 1. Modèle de données préférences

- [ ] Étendre le modèle `User` dans `schema.prisma` :
  - `notificationPreferences: Json` :
    - `push: { enabled: boolean, events: string[] }`  
    - `email: { enabled: boolean, events: string[] }`  
    - `sms: { enabled: boolean, events: string[] }`  
  - Ou créer modèle `NotificationPreferences` séparé si structure complexe.
- [ ] Migration Prisma.

### 2. Service de préférences

- [ ] Créer `notificationPreferences.service.ts` dans `server/services/notifications/` :
  - [ ] Fonction `getUserPreferences(userId)` :
    - Retourne les préférences de l'utilisateur (avec valeurs par défaut si absentes).
  - [ ] Fonction `updateUserPreferences(userId, preferences)` :
    - Met à jour les préférences.  
    - Valide la structure (événements autorisés, etc.).

### 3. API – gestion préférences

- [ ] Route `GET /api/notifications/preferences` :
  - [ ] Auth via `getServerSession`.  
  - [ ] Retourne les préférences de l'utilisateur.
- [ ] Route `PATCH /api/notifications/preferences` :
  - [ ] Auth via `getServerSession`.  
  - [ ] Body Zod : structure complète des préférences.  
  - [ ] Appelle `notificationPreferencesService.updateUserPreferences`.  
  - [ ] Retourne confirmation.

### 4. UI – page préférences

- [ ] Page `app/(protected)/settings/notifications/page.tsx` :
  - [ ] Server Component qui charge les préférences.  
  - [ ] Affiche un composant client `NotificationPreferencesForm` :
    - [ ] Sections par canal (Push, Email, SMS).  
    - [ ] Checkboxes pour chaque type d'événement.  
    - [ ] Sauvegarde via API + message de confirmation.

### 5. Intégration avec services de notification

- [ ] Dans `push.service.ts`, `email.service.ts`, `sms.service.ts` :
  - [ ] Avant envoi, vérifier `notificationPreferencesService.shouldNotify(userId, channel, eventType)`.  
  - [ ] Ne pas envoyer si préférence désactivée.

### 6. Valeurs par défaut

- [ ] Définir des préférences par défaut raisonnables :
  - [ ] Push : activé pour événements importants.  
  - [ ] Email : activé pour événements importants.  
  - [ ] SMS : désactivé par défaut (coût).

### 7. Tests

- [ ] Services :
  - [ ] Récupération/sauvegarde préférences fonctionne.  
  - [ ] Vérification préférences avant envoi fonctionne.
- [ ] API :
  - [ ] GET/PATCH préférences fonctionnent.  
  - [ ] Validation structure correcte.
- [ ] UI :
  - [ ] Formulaire complet et intuitif.  
  - [ ] Sauvegarde fonctionne.

## Dev Notes (guardrails techniques)

- Toujours vérifier les préférences avant d'envoyer une notification (ne jamais envoyer si désactivé).  
- Fournir des valeurs par défaut sensées pour nouveaux utilisateurs.  
- S'assurer que la structure JSON des préférences est validée côté backend (Zod).

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (champ `notificationPreferences`).  
  - `src/server/services/notifications/notificationPreferences.service.ts`.  
  - `src/app/api/notifications/preferences/route.ts`.  
  - Intégration dans `push.service.ts`, `email.service.ts`, `sms.service.ts`.
- Frontend :
  - `src/app/(protected)/settings/notifications/page.tsx`.  
  - `src/components/features/notifications/NotificationPreferencesForm.tsx`.

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 6, Story 6.6).  
- `_bmad-output/planning-artifacts/prd.md` (Notifications, user preferences).  
- `_bmad-output/planning-artifacts/architecture.md` (Notification patterns, preferences).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 6, Story 6.6)

### Completion Notes List

- [x] Story 6.6 détaillée, système complet de préférences avec canaux et types d'événements.  
- [x] Intégration avec tous les services de notification.

### File List

- `_bmad-output/implementation-artifacts/6-6-configuration-preferences-de-notifications.md`.
