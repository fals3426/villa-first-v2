# Story 6.2: Centralisation échanges dans chat masqué

Status: ready-for-dev

## Story

As a **système**  
I want **centraliser tous les échanges dans le chat masqué**  
so that **toutes les communications sont tracées et protégées par la plateforme**.

## Contexte fonctionnel (Epic 6)

- **FR couvert** :
  - **FR38**: Centralisation échanges dans chat masqué.
- Consolide le système de chat (6.1) avec traçabilité complète et protection plateforme.

## Acceptance Criteria

Basés sur `epics.md` (Story 6.2) :

1. **Stockage centralisé**
   - Given des utilisateurs communiquent via le chat  
   - When des messages sont envoyés  
   - Then tous les messages sont stockés dans la base de données (table `Chat`/`Message`).  
   - And tous les échanges sont centralisés (pas de communication externe requise).

2. **Liaison avec annonce et utilisateurs**
   - Given un message est envoyé  
   - When il est stocké  
   - Then :
     - Le message est lié à l'annonce (`listingId`).  
     - Le message est lié aux utilisateurs participants (`tenantId`, `hostId`).  
     - Le message identifie l'expéditeur (`senderId`).

3. **Audit log pour chaque message**
   - Given un message est créé  
   - When il est sauvegardé  
   - Then un audit log est créé avec :
     - Type d'action : `MESSAGE_SENT`.  
     - Utilisateur expéditeur.  
     - Date/heure précise.  
     - Chat concerné.

4. **Accès support**
   - Given le support a besoin de consulter les échanges  
   - When il accède au back-office (Epic 9)  
   - Then les messages peuvent être consultés par le support en cas d'incident.  
   - And tous les messages sont traçables pour résolution de litiges.

5. **Protection contre contournement**
   - Given les utilisateurs communiquent  
   - When ils tentent d'exposer leurs coordonnées  
   - Then :
     - Les emails/téléphones ne sont pas visibles dans le chat.  
     - Les utilisateurs ne peuvent pas contourner le chat pour communiquer (pas d'exposition d'emails/téléphones dans l'UI).

## Tâches / Sous-tâches

### 1. Système d'audit log

- [ ] Créer modèle `AuditLog` dans `schema.prisma` :
  - `id: string @id @default(cuid())`  
  - `action: string` (ex: `'MESSAGE_SENT'`, `'CHAT_CREATED'`)  
  - `userId: string` (relation vers `User`)  
  - `entityType: string` (ex: `'Chat'`, `'Message'`)  
  - `entityId: string`  
  - `metadata: Json?` (détails additionnels)  
  - `createdAt`.
- [ ] Migration Prisma.

### 2. Service d'audit

- [ ] Créer `audit.service.ts` dans `server/services/` :
  - [ ] Fonction `logAction(action, userId, entityType, entityId, metadata?)` :
    - Crée une entrée `AuditLog`.  
    - Utilisée par tous les services pour traçabilité.

### 3. Intégration audit dans chat service

- [ ] Dans `chat.service.ts` :
  - [ ] Après sauvegarde d'un message, appeler `auditService.logAction('MESSAGE_SENT', senderId, 'Message', messageId)`.  
  - [ ] Après création d'un chat, appeler `auditService.logAction('CHAT_CREATED', userId, 'Chat', chatId)`.

### 4. API support – consultation messages

- [ ] Route `GET /api/admin/chat/[chatId]` :
  - [ ] Auth via `getServerSession`, rôle `support`.  
  - [ ] Retourne tous les messages du chat pour consultation support.  
  - [ ] Utilisé par Epic 9 (back-office support).

### 5. Protection contre exposition coordonnées

- [ ] Dans `MaskedChat` et toutes les vues utilisateur :
  - [ ] Ne jamais afficher emails/téléphones bruts.  
  - [ ] Utiliser des identifiants génériques ("Locataire", "Hôte", ou pseudos si système de pseudos).
- [ ] Filtrage côté backend :
  - [ ] Dans les DTOs de messages, ne jamais inclure emails/téléphones des utilisateurs.

### 6. Tests

- [ ] Services :
  - [ ] Tous les messages sont bien stockés.  
  - [ ] Audit logs créés pour chaque message.
- [ ] API :
  - [ ] Support peut consulter les messages.  
  - [ ] Coordonnées jamais exposées.
- [ ] UI :
  - [ ] Masquage coordonnées visible partout.

## Dev Notes (guardrails techniques)

- **CRITICAL** : Ne jamais exposer emails/téléphones dans les réponses API ou l'UI.  
- S'assurer que tous les messages passent par le système centralisé (pas de communication externe possible).  
- Les audit logs doivent être complets pour traçabilité légale et résolution litiges.

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (modèle `AuditLog`).  
  - `src/server/services/audit.service.ts`.  
  - `src/server/services/chat/chat.service.ts` (intégration audit).  
  - `src/app/api/admin/chat/[chatId]/route.ts` (support).
- Frontend :
  - Composants chat (masquage coordonnées partout).

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 6, Story 6.2 + Epic 9 pour support).  
- `_bmad-output/planning-artifacts/prd.md` (Communication, audit logs, support).  
- `_bmad-output/planning-artifacts/architecture.md` (Audit patterns, support access).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 6, Story 6.2)

### Completion Notes List

- [x] Story 6.2 détaillée, centralisation complète avec audit logs et protection coordonnées.  
- [x] Accès support préparé pour Epic 9.

### File List

- `_bmad-output/implementation-artifacts/6-2-centralisation-echanges-dans-chat-masque.md`.
