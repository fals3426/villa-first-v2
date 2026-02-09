# Story 6.5: Notifications SMS optionnelles

Status: ready-for-dev

## Story

As a **utilisateur**  
I want **recevoir des notifications par SMS (optionnel)**  
so that **je peux être informé rapidement des événements critiques**.

## Contexte fonctionnel (Epic 6)

- **FR couvert** :
  - **FR41**: Notifications SMS optionnelles.
- Utilise un service tiers (Twilio, etc.) pour l'envoi de SMS.

## Acceptance Criteria

Basés sur `epics.md` (Story 6.5) :

1. **Activation SMS**
   - Given je suis un utilisateur connecté  
   - When j'active les notifications SMS dans mes préférences et j'ai fourni mon numéro de téléphone  
   - Then je commence à recevoir des SMS pour les événements critiques.

2. **Événements critiques**
   - Given les notifications SMS sont activées  
   - When des événements critiques se produisent  
   - Then je reçois des SMS pour :
     - Validation colocation (paiement capturé).  
     - Problème check-in.  
     - Expiration réservation.  
     - Etc. (événements critiques uniquement, pas tous les événements).

3. **Contenu concis**
   - Given je reçois un SMS  
   - When je le lis  
   - Then le SMS est concis et contient les informations essentielles.  
   - And il peut contenir un lien court vers l'app si nécessaire.

4. **Envoi via service tiers**
   - Given un SMS doit être envoyé  
   - When le système traite l'envoi  
   - Then les SMS sont envoyés via un service tiers (Twilio, etc.).  
   - And les erreurs d'envoi sont gérées.

5. **Désactivation**
   - Given je veux arrêter les SMS  
   - When je désactive les notifications SMS dans mes préférences  
   - Then je ne reçois plus de SMS.

6. **Facturation (si applicable)**
   - Given les SMS sont envoyés  
   - When je consulte mes factures  
   - Then les SMS sont facturés séparément si nécessaire (selon modèle économique).

## Tâches / Sous-tâches

### 1. Service SMS backend

- [ ] Créer `sms.service.ts` dans `server/services/notifications/` :
  - [ ] Fonction `sendSMS(to, message)` :
    - Utilise un service tiers (Twilio recommandé).  
    - Gère les erreurs et retry.
  - [ ] Fonction `sendNotificationSMS(userId, eventType, data)` :
    - Vérifie les préférences utilisateur et présence numéro téléphone.  
    - Appelle `sendSMS` si autorisé.

### 2. Stockage numéro téléphone

- [ ] S'assurer que `User.phoneNumber` existe dans `schema.prisma` :
  - `phoneNumber?: string` (optionnel, format international recommandé).  
- [ ] Migration si nécessaire.

### 3. Configuration service SMS

- [ ] Intégrer Twilio (ou équivalent) :
  - [ ] Configurer Account SID et Auth Token dans variables d'environnement.  
  - [ ] Créer client SMS dans `lib/sms.ts`.

### 4. Intégration avec événements critiques

- [ ] Dans les services concernés :
  - [ ] Après événement critique, appeler `smsService.sendNotificationSMS(userId, eventType, data)`.  
  - [ ] Limiter aux événements vraiment critiques (pas tous les événements).

### 5. UI – préférences SMS

- [ ] Dans la page de préférences notifications :
  - [ ] Toggle pour activer/désactiver notifications SMS.  
  - [ ] Champ pour saisir/modifier numéro de téléphone (si pas déjà dans profil).  
  - [ ] Validation format téléphone.

### 6. Tests

- [ ] Services :
  - [ ] Envoi SMS fonctionne.  
  - [ ] Gestion erreurs correcte.
- [ ] Intégration :
  - [ ] SMS envoyés pour événements critiques uniquement.  
  - [ ] Préférences respectées.

## Dev Notes (guardrails techniques)

- Limiter les SMS aux événements vraiment critiques (coût par SMS).  
- Valider le format du numéro de téléphone (format international).  
- Gérer les erreurs (numéro invalide, crédit insuffisant, etc.).

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (champ `phoneNumber` si nécessaire).  
  - `src/lib/sms.ts` (client Twilio).  
  - `src/server/services/notifications/sms.service.ts`.
- Frontend :
  - Page préférences notifications (toggle SMS + numéro).

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 6, Story 6.5).  
- `_bmad-output/planning-artifacts/prd.md` (Notifications, SMS service).  
- `_bmad-output/planning-artifacts/architecture.md` (Notification services, SMS patterns).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 6, Story 6.5)

### Completion Notes List

- [x] Story 6.5 détaillée, notifications SMS pour événements critiques avec service tiers.  
- [x] Gestion préférences et validation numéro téléphone.

### File List

- `_bmad-output/implementation-artifacts/6-5-notifications-sms-optionnelles.md`.
