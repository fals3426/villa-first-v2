# Story 6.3: Notifications push sur mobile

Status: ready-for-dev

## Story

As a **utilisateur**  
I want **recevoir des notifications push sur mobile**  
so that **je suis informé des événements importants même quand l'app n'est pas ouverte**.

## Contexte fonctionnel (Epic 6)

- **FR couvert** :
  - **FR39**: Notifications push sur mobile.
- Utilise l'API Notifications du navigateur (PWA) pour les notifications push.

## Acceptance Criteria

Basés sur `epics.md` (Story 6.3) :

1. **Demande de permission**
   - Given je suis un utilisateur avec l'app installée (PWA)  
   - When j'accède à l'app pour la première fois  
   - Then le système demande la permission pour les notifications push.  
   - And je peux accepter ou refuser.

2. **Réception de notifications**
   - Given j'ai autorisé les notifications push  
   - When un événement important se produit (nouvelle demande, message, validation colocation, etc.)  
   - Then je reçois une notification push sur mon mobile.  
   - And la notification affiche un titre et un message clair en français.

3. **Action au clic**
   - Given je reçois une notification push  
   - When je clique dessus  
   - Then je suis redirigé vers la page pertinente dans l'app (ex: détail réservation, chat, etc.).

4. **Fonctionnement PWA**
   - Given l'app est installée en PWA  
   - When les notifications sont envoyées  
   - Then les notifications push fonctionnent via le service natif du navigateur (PWA).  
   - And elles fonctionnent même si l'app n'est pas ouverte.

5. **Gestion des préférences**
   - Given je veux contrôler mes notifications  
   - When j'accède aux préférences  
   - Then je peux activer/désactiver les notifications push.  
   - And les notifications sont envoyées uniquement si j'ai autorisé les notifications push.

## Tâches / Sous-tâches

### 1. Service de notifications push backend

- [ ] Créer `push.service.ts` dans `server/services/notifications/` :
  - [ ] Fonction `sendPushNotification(userId, { title, message, url, data })` :
    - Récupère les tokens de notification push de l'utilisateur (stockés en base).  
    - Envoie la notification via service push (Web Push API ou service tiers).  
    - Gère les erreurs (token invalide, etc.).

### 2. Stockage des tokens push

- [ ] Étendre le modèle `User` ou créer `PushSubscription` :
  - `id: string @id @default(cuid())`  
  - `userId: string` (relation vers `User`)  
  - `endpoint: string` (URL du service push)  
  - `keys: Json` (clés de chiffrement)  
  - `createdAt`, `updatedAt`.  
- [ ] Migration Prisma.

### 3. API – enregistrement subscription

- [ ] Route `POST /api/notifications/push/subscribe` :
  - [ ] Auth via `getServerSession`.  
  - [ ] Body Zod : `{ endpoint: string, keys: { p256dh: string, auth: string } }` (format Web Push API).  
  - [ ] Sauvegarde la subscription en base.  
  - [ ] Retourne confirmation.

### 4. API – désinscription

- [ ] Route `DELETE /api/notifications/push/subscribe` :
  - [ ] Supprime la subscription de l'utilisateur.

### 5. UI – demande permission et enregistrement

- [ ] Hook `usePushNotifications` dans `hooks/usePushNotifications.ts` :
  - [ ] Demande permission via `Notification.requestPermission()`.  
  - [ ] Crée une subscription via Service Worker.  
  - [ ] Envoie la subscription au backend via API.

### 6. Service Worker – gestion notifications

- [ ] Dans le service worker (généré par PWA) :
  - [ ] Écouter l'événement `push` :
    - Afficher la notification avec titre et message.  
    - Gérer le clic pour redirection vers l'URL fournie.

### 7. Intégration avec événements

- [ ] Dans les services concernés (booking, chat, etc.) :
  - [ ] Après événement important, appeler `pushService.sendPushNotification(userId, {...})`.  
  - [ ] Respecter les préférences utilisateur (Story 6.6).

### 8. Tests

- [ ] Services :
  - [ ] Envoi notifications fonctionne.  
  - [ ] Gestion tokens/subscriptions correcte.
- [ ] API :
  - [ ] Enregistrement/désinscription fonctionne.
- [ ] UI :
  - [ ] Permission demandée correctement.  
  - [ ] Notifications reçues et cliquables.

## Dev Notes (guardrails techniques)

- Utiliser Web Push API (standard PWA) plutôt qu'un service tiers pour MVP.  
- Gérer les cas où la permission est refusée (ne pas spammer l'utilisateur).  
- S'assurer que les notifications fonctionnent sur différents navigateurs (Chrome, Firefox, Safari iOS avec limitations).

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (modèle `PushSubscription`).  
  - `src/server/services/notifications/push.service.ts`.  
  - `src/app/api/notifications/push/subscribe/route.ts`.
- Frontend :
  - `src/hooks/usePushNotifications.ts`.  
  - Service worker (généré par PWA, customisation pour gestion push).

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 6, Story 6.3).  
- `_bmad-output/planning-artifacts/prd.md` (Notifications, PWA).  
- `_bmad-output/planning-artifacts/architecture.md` (PWA, notification patterns).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 6, Story 6.3)

### Completion Notes List

- [x] Story 6.3 détaillée, notifications push PWA avec Web Push API et gestion préférences.  
- [x] Intégration avec événements métier et redirection au clic.

### File List

- `_bmad-output/implementation-artifacts/6-3-notifications-push-sur-mobile.md`.
