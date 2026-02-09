# Story 9.4: Visualisation dossiers complets (KYC, chats, check-in, statut calendrier)

Status: ready-for-dev

## Story

As a **support**  
I want **voir les dossiers complets avec toutes les informations (KYC, chats, check-in, calendrier)**  
so that **je peux prendre des décisions éclairées lors de la résolution d'incidents**.

## Contexte fonctionnel (Epic 9)

- **FR couvert** :
  - **FR53**: Visualisation dossiers complets (KYC, chats, check-in, calendrier).
- Vue centralisée de toutes les informations utilisateur/annonce/réservation pour le support.

## Acceptance Criteria

Basés sur `epics.md` (Story 9.4) :

1. **Accès au dossier complet**
   - Given je suis support et je consulte un incident ou un utilisateur  
   - When j'accède au dossier complet  
   - Then je peux voir toutes les informations pertinentes.

2. **Informations affichées**
   - Given je consulte un dossier  
   - When je le vois  
   - Then je peux voir :
     - Statut KYC de l'utilisateur (Epic 1).  
     - Historique des conversations (chats, Epic 6).  
     - Preuves de check-in (photos, GPS, Story 8.3).  
     - Statut du calendrier et réservations (Epic 3, Epic 5).  
     - Historique des actions précédentes (audit logs).

3. **Vue centralisée**
   - Given je consulte un dossier  
   - When je navigue  
   - Then :
     - Toutes les informations sont centralisées dans une vue unique.  
     - Je peux naviguer entre les différentes sections du dossier.  
     - Les informations sont présentées de manière claire et organisée.

4. **Export**
   - Given je consulte un dossier  
   - When je veux l'exporter  
   - Then je peux exporter le dossier complet si nécessaire (pour arbitrage externe).

## Tâches / Sous-tâches

### 1. Service de récupération dossier complet

- [ ] Créer `dossier.service.ts` dans `server/services/support/` :
  - [ ] Fonction `getUserDossier(userId)` :
    - Récupère statut KYC.  
    - Récupère historique chats.  
    - Récupère réservations avec check-ins.  
    - Récupère statut calendrier (annonces).  
    - Récupère audit logs liés.  
    - Retourne DTO complet.
  - [ ] Fonction `getBookingDossier(bookingId)` :
    - Récupère toutes les informations liées à une réservation.  
    - Retourne DTO complet.

### 2. DTO dossier complet

- [ ] Créer type `DossierDTO` :
  - [ ] Section KYC :
    - Statut vérification.  
    - Documents uploadés (URLs masquées si nécessaire).
  - [ ] Section Chats :
    - Liste des conversations avec timestamps.  
    - Messages (masqués si nécessaire pour conformité).
  - [ ] Section Check-ins :
    - Preuves de check-in (photos, GPS, dates).
  - [ ] Section Calendrier/Réservations :
    - Annonces de l'utilisateur.  
    - Réservations (passées, en cours, futures).  
    - Statut disponibilité.
  - [ ] Section Audit :
    - Historique des actions (logs).

### 3. API – dossier utilisateur

- [ ] Route `GET /api/admin/users/[id]/dossier` :
  - [ ] Auth via `getServerSession`, rôle `support`.  
  - [ ] Appelle `dossierService.getUserDossier(userId)`.  
  - [ ] Retourne `{ data: DossierDTO }`.

### 4. API – dossier réservation

- [ ] Route `GET /api/admin/bookings/[id]/dossier` :
  - [ ] Auth via `getServerSession`, rôle `support`.  
  - [ ] Appelle `dossierService.getBookingDossier(bookingId)`.  
  - [ ] Retourne `{ data: DossierDTO }`.

### 5. UI – page dossier utilisateur

- [ ] Page `app/admin/users/[id]/dossier/page.tsx` :
  - [ ] Server Component qui charge le dossier.  
  - [ ] Affiche composant client `DossierView` :
    - [ ] Onglets par section (KYC, Chats, Check-ins, Calendrier, Audit).  
    - [ ] Affichage organisé de chaque section.  
    - [ ] Bouton "Exporter le dossier" (PDF ou JSON).

### 6. UI – composant sections dossier

- [ ] Composants :
  - [ ] `DossierKycSection.tsx` (statut KYC, documents).  
  - [ ] `DossierChatsSection.tsx` (historique conversations).  
  - [ ] `DossierCheckInsSection.tsx` (preuves check-in).  
  - [ ] `DossierCalendarSection.tsx` (annonces, réservations).  
  - [ ] `DossierAuditSection.tsx` (audit logs).

### 7. Export dossier

- [ ] Fonction `exportDossier(dossier)` :
  - [ ] Format PDF (optionnel, pour MVP JSON suffit).  
  - [ ] Format JSON (export complet structuré).  
  - [ ] Génère fichier téléchargeable.

### 8. Tests

- [ ] Services :
  - [ ] Récupération dossier complet fonctionne.  
  - [ ] Toutes les sections sont incluses.
- [ ] API :
  - [ ] GET dossier utilisateur/réservation fonctionnent.
- [ ] UI :
  - [ ] Affichage organisé fonctionne.  
  - [ ] Export fonctionne.

## Dev Notes (guardrails techniques)

- Ne jamais exposer données sensibles non nécessaires (emails/téléphones masqués, documents avec URLs sécurisées).  
- S'assurer que seuls les utilisateurs avec rôle support peuvent accéder aux dossiers.  
- Optimiser les requêtes (éviter N+1, utiliser `include` Prisma efficacement).

## Project Structure Notes

- Backend :
  - `src/server/services/support/dossier.service.ts`.  
  - `src/app/api/admin/users/[id]/dossier/route.ts`.  
  - `src/app/api/admin/bookings/[id]/dossier/route.ts`.
- Frontend :
  - `src/app/admin/users/[id]/dossier/page.tsx`.  
  - `src/components/admin/dossier/DossierView.tsx`.  
  - `src/components/admin/dossier/DossierKycSection.tsx`.  
  - `src/components/admin/dossier/DossierChatsSection.tsx`.  
  - `src/components/admin/dossier/DossierCheckInsSection.tsx`.  
  - `src/components/admin/dossier/DossierCalendarSection.tsx`.  
  - `src/components/admin/dossier/DossierAuditSection.tsx`.

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 9, Story 9.4).  
- `_bmad-output/planning-artifacts/prd.md` (Support, dossier complet, audit).  
- `_bmad-output/planning-artifacts/architecture.md` (Admin patterns, data aggregation).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 9, Story 9.4)

### Completion Notes List

- [x] Story 9.4 détaillée, visualisation dossiers complets avec toutes les sections et export.  
- [x] Protection données sensibles et optimisation requêtes.

### File List

- `_bmad-output/implementation-artifacts/9-4-visualisation-dossiers-complets-kyc-chats-check-in-calendrier.md`.
