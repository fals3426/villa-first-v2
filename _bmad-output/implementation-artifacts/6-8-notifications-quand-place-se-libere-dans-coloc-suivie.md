# Story 6.8: Notifications quand place se libère dans coloc suivie

Status: ready-for-dev

## Story

As a **locataire**  
I want **recevoir une notification quand une place se libère dans une coloc que je suis**  
so that **je peux réserver rapidement si une place devient disponible**.

## Contexte fonctionnel (Epic 6)

- **FR couvert** :
  - **FR44**: Notifications quand place se libère dans coloc suivie.
- Détecte les libérations de places (annulations, modifications calendrier) et notifie les utilisateurs intéressés.

## Acceptance Criteria

Basés sur `epics.md` (Story 6.8) :

1. **Détection d'intérêt**
   - Given je suis un locataire et j'ai marqué une annonce comme "suivie" ou j'ai tenté de réserver une coloc complète  
   - When une place se libère dans cette coloc  
   - Then le système détecte mon intérêt et prépare une notification.

2. **Événements déclencheurs**
   - Given une place se libère  
   - When cela se produit  
   - Then les événements suivants peuvent déclencher une notification :
     - Annulation d'une réservation.  
     - Modification du calendrier (dates libérées).  
     - Réduction du nombre de places occupées.

3. **Réception de notification**
   - Given une place se libère dans une coloc que je suis  
   - When l'événement est détecté  
   - Then je reçois une notification (push/email/SMS selon mes préférences Story 6.6).  
   - And la notification indique qu'une place est disponible.

4. **Redirection vers réservation**
   - Given je clique sur la notification  
   - When l'action est déclenchée  
   - Then je suis redirigé vers l'annonce pour réserver.

5. **Respect des préférences**
   - Given je n'ai pas activé ce type de notification  
   - When une place se libère  
   - Then la notification est envoyée uniquement si j'ai activé ce type de notification dans mes préférences.

6. **Éviter notifications inutiles**
   - Given une place se libère  
   - When elle est déjà réservée par quelqu'un d'autre  
   - Then je ne reçois pas de notification (la place n'est plus disponible).

## Tâches / Sous-tâches

### 1. Modèle de données "suivi"

- [ ] Créer modèle `ListingFollow` dans `schema.prisma` :
  - `id: string @id @default(cuid())`  
  - `userId: string` (relation vers `User`)  
  - `listingId: string` (relation vers `Listing`)  
  - `createdAt`.  
- [ ] Migration Prisma.

### 2. Service de détection de libération

- [ ] Créer `availability.service.ts` dans `server/services/notifications/` :
  - [ ] Fonction `detectPlaceAvailability(listingId)` :
    - Vérifie si des places sont disponibles (comparaison capacité vs réservations actives).  
    - Retourne le nombre de places disponibles.
  - [ ] Fonction `notifyInterestedUsers(listingId)` :
    - Trouve les utilisateurs qui suivent cette annonce (`ListingFollow`).  
    - Trouve les utilisateurs qui ont tenté de réserver une coloc complète (réservations `expired` ou `cancelled` récentes).  
    - Vérifie que des places sont disponibles.  
    - Envoie notifications via services de notification.

### 3. Déclenchement lors événements

- [ ] Dans `booking.service.ts` :
  - [ ] Après annulation de réservation (`status = 'cancelled'`), appeler `availabilityService.notifyInterestedUsers(listingId)`.  
- [ ] Dans `calendar.service.ts` :
  - [ ] Après libération de dates (modification calendrier), vérifier disponibilité et notifier si nécessaire.

### 4. UI – système de suivi

- [ ] Dans `ListingDetail` :
  - [ ] Bouton "Suivre cette annonce" (toggle).  
  - [ ] Enregistre/ supprime `ListingFollow` via API.

### 5. API – gestion suivi

- [ ] Route `POST /api/listings/[id]/follow` :
  - [ ] Auth via `getServerSession`, rôle `tenant`.  
  - [ ] Crée un `ListingFollow`.
- [ ] Route `DELETE /api/listings/[id]/follow` :
  - [ ] Supprime le suivi.

### 6. Tests

- [ ] Services :
  - [ ] Détection disponibilité fonctionne.  
  - [ ] Notifications envoyées aux utilisateurs intéressés.  
  - [ ] Pas de notification si place déjà réservée.
- [ ] API :
  - [ ] Suivi/désabonnement fonctionne.
- [ ] UI :
  - [ ] Bouton suivi visible et fonctionnel.

## Dev Notes (guardrails techniques)

- Vérifier la disponibilité réelle avant d'envoyer la notification (ne pas notifier si place déjà réservée).  
- Limiter la fréquence des notifications (ne pas spammer si plusieurs places se libèrent rapidement).  
- Gérer les cas où l'utilisateur a déjà réservé cette annonce (ne pas notifier).

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (modèle `ListingFollow`).  
  - `src/server/services/notifications/availability.service.ts`.  
  - `src/server/services/bookings/booking.service.ts` (intégration déclenchement).  
  - `src/app/api/listings/[id]/follow/route.ts`.
- Frontend :
  - `src/components/features/listings/ListingDetail.tsx` (bouton suivi).

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 6, Story 6.8).  
- `_bmad-output/planning-artifacts/prd.md` (Notifications, availability alerts).  
- `_bmad-output/planning-artifacts/architecture.md` (Notification patterns, availability detection).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 6, Story 6.8)

### Completion Notes List

- [x] Story 6.8 détaillée, détection libération places avec système de suivi et notifications.  
- [x] Prévention notifications inutiles et respect préférences.

### File List

- `_bmad-output/implementation-artifacts/6-8-notifications-quand-place-se-libere-dans-coloc-suivie.md`.
