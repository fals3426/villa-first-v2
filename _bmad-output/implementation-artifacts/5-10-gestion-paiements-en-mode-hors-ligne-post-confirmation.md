# Story 5.10: Gestion paiements en mode hors ligne (post-confirmation)

Status: ready-for-dev

## Story

As a **locataire**  
I want **accéder aux informations de paiement et réservation en mode hors ligne**  
so that **je peux consulter mes réservations même sans connexion internet**.

## Contexte fonctionnel (Epic 5)

- **FR couvert** :
  - **FR36**: Gestion paiements mode hors ligne (post-confirmation).
- Utilise les capacités PWA (service workers) pour le mode hors ligne, essentiel pour le check-in (Epic 8).

## Acceptance Criteria

Basés sur `epics.md` (Story 5.10) :

1. **Accès hors ligne aux réservations confirmées**
   - Given j'ai une réservation confirmée  
   - When je suis en mode hors ligne (pas de connexion internet)  
   - Then je peux accéder aux informations de ma réservation confirmée (données préchargées).

2. **Informations disponibles hors ligne**
   - Given je consulte ma réservation hors ligne  
   - When j'accède aux détails  
   - Then je peux voir :
     - Détails de paiement (montant 25€, date, statut).  
     - Informations de check-in (adresse, codes, contact hôte).  
     - Dates de séjour.

3. **Mise en cache via service worker**
   - Given une réservation est confirmée  
   - When je suis en ligne  
   - Then les données sont mises en cache via service worker (PWA).  
   - And ces données sont accessibles hors ligne.

4. **Gestion des paiements hors ligne**
   - Given je tente un paiement hors ligne  
   - When le système détecte l'absence de connexion  
   - Then :
     - Le système attend la reconnexion puis procède au paiement.  
     - Un message indique que le paiement sera effectué dès la reconnexion.

5. **Limitations hors ligne**
   - Given je suis hors ligne  
   - When je tente de créer une nouvelle réservation  
   - Then les nouvelles réservations ne peuvent pas être créées hors ligne (nécessite connexion).  
   - And un message clair indique cette limitation.

## Tâches / Sous-tâches

### 1. Configuration service worker PWA

- [ ] S'assurer que `@ducanh2912/next-pwa` est configuré dans `next.config.js` :
  - [ ] Service worker généré automatiquement.  
  - [ ] Cache des routes API nécessaires pour réservations.

### 2. Stratégie de cache pour réservations

- [ ] Configurer le service worker pour :
  - [ ] Mettre en cache les réponses API `/api/bookings` et `/api/bookings/[id]` pour les réservations `confirmed`.  
  - [ ] Utiliser une stratégie "Cache First" ou "Network First" avec fallback cache.

### 3. Stockage IndexedDB (optionnel)

- [ ] Créer un utilitaire `lib/offline-storage.ts` :
  - [ ] Stocke les réservations confirmées dans IndexedDB.  
  - [ ] Synchronise avec le cache service worker.

### 4. Détection mode hors ligne

- [ ] Créer un hook `useOffline` dans `hooks/useOffline.ts` :
  - [ ] Détecte l'état de connexion (`navigator.onLine`).  
  - [ ] Écoute les événements `online`/`offline`.

### 5. UI – indicateur mode hors ligne

- [ ] Dans l'application :
  - [ ] Badge ou banner indiquant "Mode hors ligne" quand pas de connexion.  
  - [ ] Afficher quelles fonctionnalités sont disponibles hors ligne.

### 6. UI – gestion paiements hors ligne

- [ ] Dans le flux de paiement :
  - [ ] Détecter si hors ligne avant de procéder.  
  - [ ] Si hors ligne : afficher message "Paiement en attente. Il sera effectué dès la reconnexion."  
  - [ ] Mettre en queue le paiement pour traitement ultérieur.

### 7. Synchronisation après reconnexion

- [ ] Créer un service de synchronisation :
  - [ ] Lors de la reconnexion, traiter les paiements en queue.  
  - [ ] Synchroniser les données mises à jour depuis le serveur.

### 8. Tests

- [ ] Service worker :
  - [ ] Cache des réservations fonctionne.  
  - [ ] Accès hors ligne aux données confirmées.
- [ ] UI :
  - [ ] Détection mode hors ligne fonctionne.  
  - [ ] Messages clairs pour limitations hors ligne.  
  - [ ] Synchronisation après reconnexion fonctionne.

## Dev Notes (guardrails techniques)

- Ne jamais mettre en cache les données sensibles (numéros de carte, etc.).  
- S'assurer que le service worker est bien généré et déployé (vérifier dans les DevTools).  
- Tester le mode hors ligne sur différents navigateurs et appareils.

## Project Structure Notes

- Backend :
  - Pas de changements backend nécessaires (PWA côté frontend).
- Frontend :
  - `next.config.js` (configuration PWA).  
  - `src/hooks/useOffline.ts`.  
  - `src/lib/offline-storage.ts` (optionnel, IndexedDB).  
  - Service worker généré automatiquement par `@ducanh2912/next-pwa`.

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 5, Story 5.10).  
- `_bmad-output/planning-artifacts/prd.md` (PWA, offline mode, NFR Accessibility).  
- `_bmad-output/planning-artifacts/architecture.md` (PWA configuration, service workers).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 5, Story 5.10)

### Completion Notes List

- [x] Story 5.10 détaillée, mode hors ligne PWA avec cache service worker et gestion paiements différés.  
- [x] UX claire pour limitations et synchronisation après reconnexion.

### File List

- `_bmad-output/implementation-artifacts/5-10-gestion-paiements-en-mode-hors-ligne-post-confirmation.md`.
