# Story 6.7: Notifications quand annonce correspond aux critères

Status: ready-for-dev

## Story

As a **locataire**  
I want **recevoir une notification quand une nouvelle annonce correspond à mes critères**  
so that **je peux découvrir rapidement des colocs qui m'intéressent**.

## Contexte fonctionnel (Epic 6)

- **FR couvert** :
  - **FR43**: Notifications quand annonce correspond aux critères.
- Utilise les préférences de recherche (budget, localisation, vibes) et les préférences de notifications (Story 6.6).

## Acceptance Criteria

Basés sur `epics.md` (Story 6.7) :

1. **Matching automatique**
   - Given je suis un locataire avec des préférences définies (budget, localisation, vibes)  
   - When une nouvelle annonce est publiée qui correspond à mes critères  
   - Then le matching se fait automatiquement en arrière-plan.

2. **Réception de notification**
   - Given une annonce correspond à mes critères  
   - When le matching est détecté  
   - Then je reçois une notification (push/email/SMS selon mes préférences Story 6.6).

3. **Contenu de la notification**
   - Given je reçois une notification  
   - When je la consulte  
   - Then la notification contient un aperçu de l'annonce :
     - Titre.  
     - Localisation.  
     - Prix.  
     - Photo principale (si push/email).

4. **Redirection**
   - Given je clique sur la notification  
   - When l'action est déclenchée  
   - Then je suis redirigé vers le détail de l'annonce.

5. **Éviter les doublons**
   - Given plusieurs annonces correspondent simultanément  
   - When les notifications sont envoyées  
   - Then je ne reçois pas de doublons (regroupement ou limitation de fréquence).

6. **Désactivation**
   - Given je ne veux plus recevoir ces notifications  
   - When je modifie mes préférences  
   - Then je peux désactiver ce type de notification dans mes préférences (Story 6.6).

## Tâches / Sous-tâches

### 1. Service de matching automatique

- [ ] Créer `matching.service.ts` dans `server/services/notifications/` :
  - [ ] Fonction `checkListingMatchesUserPreferences(listingId, userId)` :
    - Récupère les préférences de recherche de l'utilisateur (budget, localisation, vibes).  
    - Compare avec les caractéristiques de l'annonce.  
    - Retourne `true` si correspondance.
  - [ ] Fonction `notifyMatchingUsers(listingId)` :
    - Trouve tous les utilisateurs dont les préférences correspondent.  
    - Pour chaque utilisateur, vérifie préférences notifications (Story 6.6).  
    - Envoie notifications via `push.service.ts`, `email.service.ts`, `sms.service.ts`.

### 2. Déclenchement lors publication

- [ ] Dans `listing.service.ts`, après publication d'une annonce (Story 3.5) :
  - [ ] Appeler `matchingService.notifyMatchingUsers(listingId)` en arrière-plan (queue ou job).

### 3. Stockage préférences de recherche

- [ ] S'assurer que les préférences de recherche sont stockées :
  - [ ] Option A : dans `User` (champs `preferredLocation`, `preferredBudget`, `vibesPreferences`).  
  - [ ] Option B : dans un modèle `SearchPreferences` séparé.

### 4. Prévention doublons

- [ ] Implémenter un système de regroupement ou limitation :
  - [ ] Option A : Regrouper plusieurs annonces en une seule notification ("3 nouvelles annonces correspondent à vos critères").  
  - [ ] Option B : Limiter à 1 notification par période (ex: max 1 par heure).

### 5. UI – aperçu notification

- [ ] Dans les templates de notifications (push/email) :
  - [ ] Afficher aperçu annonce avec titre, localisation, prix, photo.  
  - [ ] Lien vers détail annonce.

### 6. Tests

- [ ] Services :
  - [ ] Matching fonctionne correctement.  
  - [ ] Notifications envoyées aux bons utilisateurs.  
  - [ ] Prévention doublons fonctionne.
- [ ] Intégration :
  - [ ] Déclenchement lors publication fonctionne.  
  - [ ] Préférences notifications respectées.

## Dev Notes (guardrails techniques)

- Exécuter le matching en arrière-plan (queue/job) pour ne pas bloquer la publication d'annonce.  
- S'assurer que le matching est performant (indexer les préférences utilisateur si nécessaire).  
- Limiter la fréquence des notifications pour éviter spam.

## Project Structure Notes

- Backend :
  - `src/server/services/notifications/matching.service.ts`.  
  - `src/server/services/listings/listing.service.ts` (intégration déclenchement).  
  - Job/queue pour traitement asynchrone.
- Frontend :
  - Templates notifications (aperçu annonce).

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 6, Story 6.7 + Epic 4 pour recherche).  
- `_bmad-output/planning-artifacts/prd.md` (Notifications, matching, discovery).  
- `_bmad-output/planning-artifacts/architecture.md` (Notification patterns, background jobs).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 6, Story 6.7)

### Completion Notes List

- [x] Story 6.7 détaillée, matching automatique avec notifications et prévention doublons.  
- [x] Intégration avec préférences recherche et notifications.

### File List

- `_bmad-output/implementation-artifacts/6-7-notifications-quand-annonce-correspond-aux-criteres.md`.
