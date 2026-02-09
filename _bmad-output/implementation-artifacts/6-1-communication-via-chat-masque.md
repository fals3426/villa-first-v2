# Story 6.1: Communication via chat masqué

Status: ready-for-dev

## Story

As a **utilisateur (locataire ou hôte)**  
I want **communiquer via un chat masqué avec l'autre partie**  
so that **je peux poser des questions et échanger en toute sécurité sans exposer mes coordonnées**.

## Contexte fonctionnel (Epic 6)

- **Epic 6 – Communication & Notifications**  
  Les utilisateurs peuvent communiquer via chat masqué et recevoir des notifications pour rester informés.
- **FR couvert** :
  - **FR37**: Communication via chat masqué.
- Story de base pour le système de communication, utilisant Socket.IO pour le temps réel.

## Acceptance Criteria

Basés sur `epics.md` (Story 6.1) :

1. **Accès au chat**
   - Given je suis connecté et j'ai une réservation active (locataire) ou je suis hôte avec des demandes  
   - When j'accède à la page de chat pour une annonce/réservation  
   - Then je peux voir l'interface de chat masqué.

2. **Envoi de messages texte**
   - Given je suis dans le chat  
   - When j'envoie un message texte  
   - Then :
     - Le message est envoyé via Socket.IO en temps réel.  
     - Le message est stocké dans la base de données avec timestamp.  
     - Le message apparaît immédiatement dans la conversation.

3. **Masquage des coordonnées**
   - Given je communique via le chat  
   - When je vois les messages  
   - Then les emails/téléphones ne sont pas visibles (masqués ou remplacés par des identifiants génériques).  
   - And seule la communication via la plateforme est possible.

4. **Historique des messages**
   - Given je consulte le chat  
   - When la page se charge  
   - Then je peux voir l'historique des messages précédents.  
   - And les messages sont liés à l'annonce/réservation spécifique.

5. **Restrictions d'accès**
   - Given je suis un locataire  
   - When j'essaie d'accéder au chat  
   - Then le chat n'est accessible qu'après réservation (pas avant).  
   - Given je suis un hôte  
   - When j'essaie d'accéder au chat  
   - Then le chat est accessible pour les demandes reçues.

## Tâches / Sous-tâches

### 1. Modèle de données chat

- [ ] Dans `prisma/schema.prisma`, créer les modèles :
  - `Chat` :
    - `id: string @id @default(cuid())`  
    - `listingId: string` (relation vers `Listing`)  
    - `tenantId: string` (relation vers `User`)  
    - `hostId: string` (relation vers `User`)  
    - `createdAt`, `updatedAt`.  
  - `Message` :
    - `id: string @id @default(cuid())`  
    - `chatId: string` (relation vers `Chat`)  
    - `senderId: string` (relation vers `User`)  
    - `content: string`  
    - `createdAt`.  
- [ ] Migration Prisma.

### 2. Service Socket.IO – serveur séparé

- [ ] Dans `server-socket/src/socket/handlers/chat.handler.ts` :
  - [ ] Gérer l'événement `chat:message` :
    - Recevoir le message depuis le client.  
    - Vérifier l'authentification (via middleware auth).  
    - Vérifier que l'utilisateur a accès au chat (réservation active ou hôte).  
    - Sauvegarder le message en base via `chat.service.ts`.  
    - Diffuser le message aux participants du chat (locataire + hôte).
  - [ ] Gérer l'événement `chat:typing` (optionnel, indique que quelqu'un tape).

### 3. Service de chat backend

- [ ] Créer `chat.service.ts` dans `server/services/chat/` :
  - [ ] Fonction `getOrCreateChat(listingId, tenantId, hostId)` :
    - Trouve ou crée un chat pour cette combinaison.  
    - Vérifie que le locataire a une réservation active.
  - [ ] Fonction `saveMessage(chatId, senderId, content)` :
    - Sauvegarde le message en base.  
    - Retourne le message avec timestamp.
  - [ ] Fonction `getChatHistory(chatId, userId)` :
    - Retourne l'historique des messages.  
    - Vérifie que l'utilisateur a accès au chat.

### 4. API – récupération historique

- [ ] Route `GET /api/chat/[chatId]` :
  - [ ] Auth via `getServerSession`.  
  - [ ] Vérifie l'accès au chat (ownership).  
  - [ ] Appelle `chatService.getChatHistory`.  
  - [ ] Retourne `{ data: MessageDTO[], meta }`.

### 5. Client Socket.IO côté frontend

- [ ] Créer `lib/socket.ts` :
  - [ ] Configuration connexion Socket.IO vers le serveur séparé.  
  - [ ] Gestion authentification (envoi token JWT).  
  - [ ] Fonctions utilitaires pour émettre/recevoir messages.

### 6. UI – composant chat masqué

- [ ] Composant `MaskedChat` dans `components/features/chat/MaskedChat.tsx` :
  - [ ] Interface de chat avec zone de saisie et liste de messages.  
  - [ ] Connexion Socket.IO pour temps réel.  
  - [ ] Affichage des messages avec timestamp et indicateur expéditeur.  
  - [ ] Masquage des coordonnées (afficher "Locataire" / "Hôte" au lieu de noms/emails).

### 7. Vérification accès chat

- [ ] Middleware ou vérification dans les composants :
  - [ ] Locataire : vérifier qu'une réservation active existe.  
  - [ ] Hôte : vérifier qu'il y a des demandes pour cette annonce.  
  - [ ] Afficher message "Réservez pour débloquer le chat" si accès refusé.

### 8. Tests

- [ ] Services :
  - [ ] Création/récupération chat fonctionne.  
  - [ ] Sauvegarde messages correcte.
- [ ] Socket.IO :
  - [ ] Émission/réception messages fonctionne.  
  - [ ] Auth vérifiée.
- [ ] UI :
  - [ ] Chat temps réel fonctionne.  
  - [ ] Masquage coordonnées visible.  
  - [ ] Restrictions d'accès respectées.

## Dev Notes (guardrails techniques)

- **CRITIQUE** : Socket.IO serveur séparé selon architecture (voir `architecture.md`).  
- Ne jamais exposer emails/téléphones dans les messages ou l'UI.  
- Toujours vérifier l'accès au chat côté backend (jamais faire confiance au front seul).  
- Gérer les reconnexions Socket.IO (reconnexion automatique si déconnexion).

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (modèles `Chat`, `Message`).  
  - `src/server/services/chat/chat.service.ts`.  
  - `src/app/api/chat/[chatId]/route.ts`.
- Socket.IO Server :
  - `server-socket/src/socket/handlers/chat.handler.ts`.  
  - `server-socket/src/socket/middleware/auth.middleware.ts`.
- Frontend :
  - `src/lib/socket.ts` (client Socket.IO).  
  - `src/components/features/chat/MaskedChat.tsx`.

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 6, Story 6.1).  
- `_bmad-output/planning-artifacts/prd.md` (Communication, masked chat).  
- `_bmad-output/planning-artifacts/architecture.md` (Socket.IO patterns, real-time communication).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 6, Story 6.1)

### Completion Notes List

- [x] Story 6.1 détaillée, chat masqué avec Socket.IO temps réel et restrictions d'accès.  
- [x] Protection coordonnées et vérification accès côté backend.

### File List

- `_bmad-output/implementation-artifacts/6-1-communication-via-chat-masque.md`.
