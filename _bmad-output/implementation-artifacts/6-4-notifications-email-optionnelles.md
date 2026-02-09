# Story 6.4: Notifications email optionnelles

Status: ready-for-dev

## Story

As a **utilisateur**  
I want **recevoir des notifications par email (optionnel)**  
so that **je peux être informé même si je ne suis pas sur l'app**.

## Contexte fonctionnel (Epic 6)

- **FR couvert** :
  - **FR40**: Notifications email optionnelles.
- Utilise un service tiers (SendGrid, Mailgun, etc.) pour l'envoi d'emails.

## Acceptance Criteria

Basés sur `epics.md` (Story 6.4) :

1. **Activation des notifications email**
   - Given je suis un utilisateur connecté  
   - When j'active les notifications email dans mes préférences  
   - Then je commence à recevoir des emails pour les événements importants.

2. **Types d'événements**
   - Given les notifications email sont activées  
   - When des événements se produisent  
   - Then je reçois des emails pour :
     - Nouvelles demandes de réservation  
     - Nouveaux messages  
     - Validation de colocation  
     - Problèmes check-in  
     - Etc. (selon préférences Story 6.6).

3. **Design professionnel**
   - Given je reçois un email  
   - When je l'ouvre  
   - Then l'email a un design professionnel avec :
     - Logo/branding de la plateforme.  
     - Informations clés mises en évidence.  
     - Liens vers l'app pour actions rapides.

4. **Envoi via service tiers**
   - Given un email doit être envoyé  
   - When le système traite l'envoi  
   - Then les emails sont envoyés via un service tiers (SendGrid, Mailgun, etc.).  
   - And les erreurs d'envoi sont gérées (retry, logging).

5. **Désactivation**
   - Given je veux arrêter les emails  
   - When je désactive les notifications email dans mes préférences  
   - Then je ne reçois plus d'emails (sauf emails transactionnels critiques si nécessaire).

## Tâches / Sous-tâches

### 1. Service email backend

- [ ] Créer `email.service.ts` dans `server/services/notifications/` :
  - [ ] Fonction `sendEmail(to, { subject, template, data })` :
    - Utilise un service tiers (SendGrid, Mailgun, Resend, etc.).  
    - Gère les templates d'emails.  
    - Gère les erreurs et retry.
  - [ ] Fonction `sendNotificationEmail(userId, eventType, data)` :
    - Vérifie les préférences utilisateur (Story 6.6).  
    - Appelle `sendEmail` si autorisé.

### 2. Templates d'emails

- [ ] Créer des templates d'emails (HTML + texte) :
  - [ ] Template base avec header/footer.  
  - [ ] Templates spécifiques :
    - Nouvelle demande de réservation.  
    - Nouveau message.  
    - Validation colocation.  
    - Problème check-in.  
    - Etc.

### 3. Configuration service email

- [ ] Intégrer service tiers :
  - [ ] Choisir provider (SendGrid, Mailgun, Resend recommandé pour Next.js).  
  - [ ] Configurer clés API dans variables d'environnement.  
  - [ ] Créer client email dans `lib/email.ts`.

### 4. Intégration avec événements

- [ ] Dans les services concernés :
  - [ ] Après événement, appeler `emailService.sendNotificationEmail(userId, eventType, data)`.  
  - [ ] Respecter les préférences utilisateur.

### 5. UI – préférences email

- [ ] Dans la page de préférences notifications (Story 6.6) :
  - [ ] Toggle pour activer/désactiver notifications email.  
  - [ ] Sauvegarde via API.

### 6. Tests

- [ ] Services :
  - [ ] Envoi emails fonctionne.  
  - [ ] Templates corrects.  
  - [ ] Gestion erreurs fonctionne.
- [ ] Intégration :
  - [ ] Emails envoyés pour événements importants.  
  - [ ] Préférences respectées.

## Dev Notes (guardrails techniques)

- Ne jamais exposer les clés API dans le code (variables d'environnement uniquement).  
- Gérer les erreurs d'envoi (service tiers indisponible, adresse invalide, etc.).  
- S'assurer que les emails sont bien formatés (HTML + texte pour compatibilité).

## Project Structure Notes

- Backend :
  - `src/lib/email.ts` (client service tiers).  
  - `src/server/services/notifications/email.service.ts`.  
  - `src/templates/emails/` (templates HTML).
- Frontend :
  - Page préférences notifications (toggle email).

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 6, Story 6.4).  
- `_bmad-output/planning-artifacts/prd.md` (Notifications, email service).  
- `_bmad-output/planning-artifacts/architecture.md` (Notification services, email patterns).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 6, Story 6.4)

### Completion Notes List

- [x] Story 6.4 détaillée, notifications email avec service tiers et templates professionnels.  
- [x] Intégration avec préférences utilisateur et événements métier.

### File List

- `_bmad-output/implementation-artifacts/6-4-notifications-email-optionnelles.md`.
