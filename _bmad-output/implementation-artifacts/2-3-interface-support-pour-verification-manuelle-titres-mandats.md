# Story 2.3: Interface support pour vérification manuelle titres/mandats

Status: ready-for-dev

## Story

As a **support**  
I want **accéder à une interface pour vérifier manuellement les titres/mandats des hôtes**  
so that **je peux examiner les documents et prendre une décision de vérification**.

## Contexte fonctionnel (Epic 2)

- **Epic 2 – Vérification Hôte & Système de Confiance**  
  Cette story couvre la partie **back-office support** pour traiter les demandes créées par 2.1.
- **FR couverts** :
  - **FR9**: Le support peut vérifier manuellement les titres/mandats des hôtes.
  - Prépare directement FR10 (approbation/rejet), FR11 (suspension/révocation) et FR12 (différenciation visuelle via statut).

## Acceptance Criteria

Basés sur `epics.md` (Story 2.3) + PRD/Architecture (sections Support & back-office) :

1. **Accès restreint au rôle support**
   - Given je suis un utilisateur **support** authentifié  
   - When j’accède au back-office de vérification (par ex. `/admin/verifications`)  
   - Then j’y ai accès uniquement si mon rôle est `support`  
   - And sinon je suis redirigé / reçois une réponse `403 Forbidden` côté API.

2. **Liste des demandes de vérification en attente**
   - Given des demandes de vérification existent (créées via Story 2.1)  
   - When j’affiche la page de liste des vérifications  
   - Then je vois toutes les demandes avec statut `"pending"` (et éventuellement `"in_review"`)  
   - And pour chaque demande je vois au minimum :
     - Informations hôte (nom, email, statut KYC)  
     - Informations annonce (titre, localisation, statut de publication)  
     - Date de création de la demande  
     - Statut actuel de vérification.

3. **Accès au détail d’une demande**
   - Given je suis sur la liste des vérifications  
   - When je clique sur une demande  
   - Then j’accède à une page ou un panneau de détail montrant :
     - Les documents uploadés (titres/mandats) avec liens de téléchargement/visualisation sécurisés  
     - Le contexte de l’annonce (résumé)  
     - L’historique des vérifications précédentes pour cet hôte (s’il existe)  
     - Les logs/audit principaux liés à cette vérification (si disponibles).

4. **Contraintes de sécurité des documents**
   - Given je visualise une demande  
   - When je télécharge/visualise un document  
   - Then l’URL utilisée est conforme aux contraintes de sécurité (signée/privée)  
   - And aucune URL brute publique donnant accès permanent au document n’est stockée côté client.

5. **Traçabilité**
   - Given un membre du support consulte ou modifie une demande  
   - When je réalise des actions (ex : marquer comme “en cours de revue” dans cette story, ou approuver/rejeter dans 2.4)  
   - Then un log d’audit est conservé (identité du support, date/heure, action).

## Tâches / Sous-tâches

### 1. Modèle de données / services (compléments à 2.1)

- [ ] Vérifier/compléter le modèle `VerificationRequest` / `VerificationDocument` créé en 2.1 :
  - Statuts supportés : `'pending' | 'in_review' | 'approved' | 'rejected' | 'suspended' | 'revoked'`.
- [ ] Dans `server/services/verification/verification.service.ts` :
  - [ ] Ajouter une méthode `listPendingRequests()` :
    - Retourne les demandes `pending` (et éventuellement `in_review`), triées par date de création.
    - Joint les données basiques d’hôte et d’annonce (via Prisma `include` ou DTO).
  - [ ] Ajouter une méthode `getRequestById(id)` :
    - Retourne la demande + documents + infos de contexte (hôte, annonce).

### 2. API admin de vérification

- [ ] Créer/compléter les routes API dans `app/api/admin/verifications/` :
  - [ ] `GET /api/admin/verifications` :
    - Auth via `getServerSession`, vérification rôle `support`.  
    - Appelle `verificationService.listPendingRequests()`.  
    - Réponse standard `{ data: VerificationRequestDTO[], meta }`.
  - [ ] `GET /api/admin/verifications/[id]` :
    - Idem authentification/autorisation.  
    - Appelle `verificationService.getRequestById(id)`.  
    - Ne retourne que les URLs de documents prêtes à l’emploi côté support (pas les secrets).

### 3. UI back-office support – liste

- [ ] Page `app/admin/verifications/page.tsx` (Server Component) :
  - [ ] Charge les demandes via les services/API.  
  - [ ] Affiche un tableau/listing avec colonnes :
    - Hôte, annonce, statut KYC, statut vérification, date de demande.
  - [ ] Respecte les patterns de layout admin (header, navigation, etc.).
- [ ] Composant client `VerificationQueue` dans `components/admin/VerificationQueue.tsx` :
  - [ ] Gère tri/filtre de base (par statut, par date).  
  - [ ] Navigation vers le détail au clic sur une ligne.

### 4. UI back-office support – détail

- [ ] Page `app/admin/verifications/[id]/page.tsx` :
  - [ ] Affiche le contexte complet :
    - Bloc “Hôte” (identité, KYC, historique de vérification).  
    - Bloc “Annonce” (titre, localisation, résumé du contenu).  
    - Bloc “Documents” avec liste de fichiers + boutons téléchargement/visualisation.  
  - [ ] Met à disposition (dans cette story) au moins un bouton pour marquer la demande comme `"in_review"` (changement de statut simple pour activer le flux).
- [ ] S’assurer que les liens de documents passent par un service sécurisé (proxy ou URL signée).

### 5. Rôles, sécurité et navigation

- [ ] Vérifier la **middleware** de Next (`src/middleware.ts`) pour que :
  - Les routes `app/admin/*` soient protégées par un contrôle de rôle `support`.  
  - Les API `api/admin/*` renvoient `403` pour les rôles non autorisés.
- [ ] Ajouter des entrées de navigation dans le dashboard support (par ex. `AdminLayout`) vers “Vérifications”.

### 6. Tests

- [ ] Tests services :
  - [ ] `listPendingRequests` : ne retourne que les statuts ciblés, tri correct.  
  - [ ] `getRequestById` : retourne les documents associés + relations attendues.
- [ ] Tests API :
  - [ ] Accès non authentifié → `401`.  
  - [ ] Rôle non support → `403`.  
  - [ ] Cas nominal → `200` + structure `{ data, meta }`.
- [ ] Tests UI (si infra en place) :
  - [ ] La liste s’affiche avec les colonnes attendues.  
  - [ ] Le clic sur une ligne mène bien au détail.

## Dev Notes (guardrails techniques)

- **Séparation des responsabilités** :
  - Services `verification.*` font toute la logique métier / Prisma.  
  - API admin se contente de valider l’auth/role + appeler les services + formater la réponse.  
  - UI admin ne fait que consommer les DTO et rendre les écrans.
- **Confidentialité des documents** :
  - Ne jamais inclure d’URL brute longue durée ou de secrets dans la réponse API.  
  - Préférer un service de génération d’URL signée côté backend.

## Project Structure Notes

- Backend :
  - `src/server/services/verification/verification.service.ts`.  
  - `src/app/api/admin/verifications/route.ts`.  
  - `src/app/api/admin/verifications/[id]/route.ts`.  
- Frontend :
  - `src/app/admin/verifications/page.tsx`.  
  - `src/app/admin/verifications/[id]/page.tsx`.  
  - `src/components/admin/VerificationQueue.tsx`.

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 2, Story 2.3).  
- `_bmad-output/planning-artifacts/prd.md` (sections Support & Opérations, Host Verification & Trust).  
- `_bmad-output/planning-artifacts/architecture.md` (Admin routes, services, structure).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 2, Story 2.3)

### Completion Notes List

- [x] Story 2.3 détaillée, prête pour implémentation back-office support.  
- [x] Flux complet liste+détail pour demandes de vérification.  
- [x] Guardrails sécurité documents + rôles support.

### File List

- `_bmad-output/implementation-artifacts/2-3-interface-support-pour-verification-manuelle-titres-mandats.md`.

