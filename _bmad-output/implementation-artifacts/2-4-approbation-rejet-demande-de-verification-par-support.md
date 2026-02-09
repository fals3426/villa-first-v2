# Story 2.4: Approbation/rejet demande de vérification par support

Status: ready-for-dev

## Story

As a **support**  
I want **approuver ou rejeter une demande de vérification**  
so that **les hôtes peuvent obtenir leur badge vérifié ou comprendre pourquoi leur demande est rejetée**.

## Contexte fonctionnel (Epic 2)

- Suite directe des stories **2.1 (création de demande)** et **2.3 (interface support)**.  
- **FR couverts** :
  - **FR10**: Le support peut approuver ou rejeter une demande de vérification.
- Impacts :
  - Alimente **FR8/Story 2.2** (badge “Annonce vérifiée”).  
  - Prépare **FR11/Story 2.5** (suspension/révocation ultérieures).

## Acceptance Criteria

Basés sur `epics.md` (Story 2.4) :

1. **Approbation d’une demande**
   - Given je suis support et j’ai examiné les documents d’un hôte  
   - When j’approuve la demande de vérification dans l’interface back-office  
   - Then le statut de la demande passe à `"approved"`  
   - And le statut de vérification de toutes les annonces concernées est mis à jour (ex: `verificationStatus = 'verified'`)  
   - And le badge “Annonce vérifiée” peut être affiché pour ces annonces (Story 2.2)  
   - And l’hôte reçoit une notification de confirmation (canal défini : email/push plus tard).  
   - And un audit log est créé contenant : id support, id hôte, id annonce, date, action `approved`.

2. **Rejet d’une demande**
   - Given je suis support sur la page détail d’une demande  
   - When je clique sur “Rejeter”  
   - Then je suis obligé de saisir une **raison de rejet** (champ obligatoire, texte libre)  
   - And le statut de la demande passe à `"rejected"`  
   - And l’hôte reçoit une notification avec la raison (au moins disponible dans l’UI hôte)  
   - And l’hôte peut plus tard créer une nouvelle demande avec des documents mis à jour.  
   - And un audit log est créé avec la raison de rejet.

3. **Règles métier sur les statuts**
   - Given une demande a un statut terminal (`approved` ou `rejected`)  
   - When un support tente de la ré-approuver ou de la ré-rejeter via l’UI  
   - Then l’action est empêchée côté backend (validation métier) et une erreur claire est retournée (par ex. `code: 'INVALID_STATUS_TRANSITION'`).  
   - And aucune duplication de logs ou changement incohérent n’est effectué.

4. **Effets sur les annonces**
   - Given une demande approuvée est liée à une annonce spécifique (ou à toutes les annonces de l’hôte si modèle ainsi défini)  
   - When la demande passe à `"approved"`  
   - Then les annonces correspondantes sont marquées comme vérifiées dans la base (champ `verificationStatus` ou équivalent), sans affecter des annonces non couvertes par cette demande.

## Tâches / Sous-tâches

### 1. Logique métier de transition de statut

- [ ] Dans `verification.service.ts` :
  - [ ] Ajouter une fonction `approveRequest(requestId, supportUserId)` :
    - Charge la demande (`pending` ou `in_review`) + relations nécessaires.  
    - Vérifie que le statut courant autorise la transition → sinon lève une erreur métier (`INVALID_STATUS_TRANSITION`).  
    - Met à jour la demande en `approved`, `updatedAt`, `approvedBy`.  
    - Met à jour les annonces ciblées (champ `verificationStatus = 'verified'`).  
    - Crée un log d’audit correspondant.
  - [ ] Ajouter une fonction `rejectRequest(requestId, supportUserId, reason)` :
    - Idem, mais passe en `rejected` et stocke la `reason` textuelle.

### 2. API admin – actions d’approbation/rejet

- [ ] Ajouter les endpoints :
  - [ ] `POST /api/admin/verifications/[id]/approve` :
    - Auth via `getServerSession`, contrôle rôle `support`.  
    - Body minimal (`{}`) ou méta; pas de raison requise.  
    - Appelle `verificationService.approveRequest`.  
    - Réponse succès `{ data: { status: 'approved' }, meta: { timestamp } }`.
  - [ ] `POST /api/admin/verifications/[id]/reject` :
    - Auth idem.  
    - Body avec `reason: string` obligatoire validée par Zod.  
    - Appelle `verificationService.rejectRequest`.  
    - Réponse `{ data: { status: 'rejected' }, meta }`.
- [ ] Gérer les codes d’erreurs :
  - Utiliser l’enveloppe `{ error: { code, message, details? } }` et HTTP `400/403/404/409` selon le cas.

### 3. UI back-office – interactions

- [ ] Sur la page `app/admin/verifications/[id]/page.tsx` :
  - [ ] Ajouter boutons `Approuver` et `Rejeter`.  
  - [ ] Pour “Rejeter” :
    - Ouvrir un dialog/modal demandant la raison de rejet (champ obligatoire).  
    - Valider le champ localement (non vide) avant d’appeler l’API.  
  - [ ] Gérer les états d’attente (`isSubmitting`), succès/erreur via toasts/alertes cohérents avec le reste du projet.
- [ ] Rafraîchir l’état local après succès (statut et logs visibles côté support).

### 4. Impact sur l’hôte (feedback de base)

- [ ] Sur la page hôte de suivi de vérification (vue utilisée en 2.1) :
  - [ ] Afficher :
    - `Approuvée` + texte de confirmation si `approved`.  
    - `Rejetée` + raison de rejet si `rejected`.  
  - [ ] S’assurer que ces données sont accessibles via l’API (DTO incluant statut + raison).

### 5. Tests

- [ ] Tests services :
  - [ ] `approveRequest` :
    - Cas nominal : `pending` → `approved`, annonces marquées vérifiées.  
    - Cas invalide : `approved` ou `rejected` → erreur `INVALID_STATUS_TRANSITION`.  
  - [ ] `rejectRequest` :
    - Stockage correct de la raison.  
    - Impossible sans raison.
- [ ] Tests API :
  - [ ] Rôle non support → `403`.  
  - [ ] Statut invalide → `409` ou `400` avec `code` explicite.  
  - [ ] Cas nominal → `200`.
- [ ] Tests UI :
  - [ ] L’obligation de raison pour “Rejeter” est bien appliquée.  
  - [ ] Le statut est mis à jour en temps réel dans la vue support.

## Dev Notes (guardrails techniques)

- Rappels :
  - **Pas de Prisma dans les composants/route handlers** : tout passe par les services.  
  - Les logs d’audit ne doivent pas être renvoyés tels quels aux clients finaux (sauf vues admin support).  
  - Toutes les réponses API doivent suivre le format standard documenté dans `project-context.md`.

## Project Structure Notes

- Backend :
  - `src/server/services/verification/verification.service.ts` (transition de statut).  
  - `src/app/api/admin/verifications/[id]/approve/route.ts`.  
  - `src/app/api/admin/verifications/[id]/reject/route.ts`.
- Frontend :
  - `src/app/admin/verifications/[id]/page.tsx` (ajout des actions).  
  - UI de suivi côté hôte dans `app/(protected)/host/...` (utilise les DTO mis à jour).

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 2, Story 2.4).  
- `_bmad-output/planning-artifacts/prd.md` (Host Verification & Trust, Support & Ops).  
- `_bmad-output/planning-artifacts/architecture.md` (Admin routes, services, audit logs).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 2, Story 2.4)

### Completion Notes List

- [x] Story 2.4 détaillée, flux complet d’approbation/rejet prêt à implémenter.  
- [x] Lien explicite avec badge vérifié et feedback hôte.  
- [x] Guardrails pour transitions de statuts et audit.

### File List

- `_bmad-output/implementation-artifacts/2-4-approbation-rejet-demande-de-verification-par-support.md`.

