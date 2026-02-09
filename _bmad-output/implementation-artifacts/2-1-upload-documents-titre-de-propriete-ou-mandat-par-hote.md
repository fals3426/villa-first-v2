# Story 2.1: Upload documents titre de propriété ou mandat par hôte

Status: ready-for-dev

## Story

As a **hôte**  
I want **uploader mes documents de titre de propriété ou mandat**  
so that **je peux demander la vérification de mon annonce et obtenir le badge vérifié**.

## Contexte fonctionnel (Epic 2)

- **Epic 2 – Vérification Hôte & Système de Confiance**  
  Les hôtes peuvent être vérifiés et obtenir un badge "Annonce vérifiée" pour gagner la confiance des locataires, différenciateur clé de la plateforme.
- **FR couverts par cette story** :  
  - **FR7**: Upload documents titre de propriété ou mandat  
  - Prépare le terrain pour **FR8–FR12** (badge vérifié, interface support, suspension, différenciation visuelle).

## Acceptance Criteria

Repris et légèrement raffinés à partir de `epics.md` (Story 2.1) et du PRD :

1. **Accès réservé aux hôtes vérifiés KYC**
   - Given je suis un hôte connecté avec KYC vérifié  
   - When j’accède à la page de vérification de mon annonce  
   - Then je peux voir un module “Vérification de l’annonce” associé à une annonce donnée.

2. **Upload de document titre de propriété / mandat**
   - Given je suis sur la page de vérification de mon annonce  
   - When j’uploade un document de titre de propriété ou mandat  
   - Then le système accepte **uniquement** les formats `PDF`, `JPG`, `PNG`  
   - And la taille maximale par fichier est **10 Mo**  
   - And tout fichier ne respectant pas ces contraintes est refusé avec un message d’erreur clair en français.

3. **Stockage sécurisé des documents**
   - Given un document valide est uploadé  
   - When l’upload est complété  
   - Then le document est stocké via un service de stockage (ex: S3/Cloudinary)  
   - And l’URL du document et ses métadonnées (type, taille, hôte, annonce) sont enregistrées en base  
   - And le stockage au repos est compatible avec les exigences de sécurité (chiffrement côté provider, accès restreint via URL signée ou équivalent).

4. **Création d’une demande de vérification**
   - Given j’ai uploadé au moins un document valide pour une annonce  
   - When je clique sur “Soumettre pour vérification”  
   - Then une **demande de vérification** est créée avec le statut initial `"pending"`  
   - And la demande est liée à l’hôte, à l’annonce et aux documents uploadés  
   - And la date de création est auditée (`createdAt`, `createdBy`).

5. **Feedback utilisateur et UX**
   - Given ma demande a bien été enregistrée  
   - When la création est réussie  
   - Then je vois un état de statut clair pour mon annonce : `En cours de vérification`  
   - And un message de confirmation s’affiche (“Votre demande de vérification a été envoyée au support.”)  
   - And en cas d’échec technique, un message d’erreur **non technique** et actionnable est affiché (“Une erreur est survenue lors de l’envoi de vos documents. Merci de réessayer.”).

6. **Suivi du statut par l’hôte**
   - Given j’ai déjà soumis une demande de vérification pour cette annonce  
   - When je reviens sur la page de vérification de l’annonce  
   - Then je peux voir le **statut actuel** de ma demande (`pending`, `in_review`, `approved`, `rejected`, `suspended`, `revoked`)  
   - And pour les statuts `rejected`, `suspended`, `revoked`, une raison textuelle est visible (si existante).

7. **Traçabilité / audit**
   - Given une demande de vérification existe  
   - When une action liée à la demande est effectuée (création, resoumission, changement de statut par support dans une story future)  
   - Then un log d’audit est possible via le modèle de données (identifiants d’hôte, d’annonce, de la demande, timestamps) conformément aux exigences de traçabilité du PRD.

## Tâches / Sous-tâches

### 1. Modélisation et persistence

- [ ] **Définir le modèle Prisma pour la vérification hôte** (en cohérence avec `architecture.md`)
  - [ ] Modèle `VerificationRequest` (ou équivalent) :
    - `id: string` (cuid)
    - `hostId: string` (relation vers `User`)
    - `listingId: string` (relation vers `Listing`)
    - `status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'suspended' | 'revoked'`
    - `reason: string | null` (motif pour rejet/suspension/révocation, rempli dans des stories ultérieures)
    - `createdAt`, `updatedAt`
  - [ ] Modèle `VerificationDocument` (si séparation souhaitée) :
    - `id`, `verificationRequestId`, `storageUrl`, `fileType`, `fileSize`, `originalFileName`
    - `createdAt`, `createdBy`
- [ ] **Mettre à jour `prisma/schema.prisma`** et exécuter `npx prisma migrate dev` (nom de migration explicite).

### 2. API et service de vérification

- [ ] **Créer le service métier** `verification.service.ts` dans `server/services/verification/` :
  - [ ] Fonction `createVerificationRequest({ hostId, listingId, documents })` :
    - Valide que l’hôte est de rôle `host` et KYC vérifié (en cohérence avec auth/roles définis dans `architecture.md`).
    - Valide que la combinaison `(hostId, listingId)` n’a pas déjà une demande `pending` ou `in_review` (sinon renvoyer une erreur métier).
    - Crée la `VerificationRequest` et les `VerificationDocument` associés.
- [ ] **Exposer une API REST** sous `app/api/verifications/route.ts` :
  - Méthode `POST` sécurisée :
    - Auth obligatoire via `getServerSession` (`NextAuth`).
    - Vérifie le rôle (`host`), le statut KYC et la propriété de l’annonce.
    - Utilise Zod pour valider le payload (listingId, métadonnées des fichiers).
    - Appelle `verificationService.createVerificationRequest`.
    - Répond dans le **format d’API standardisé** :
      - Succès : `{ data: { verificationRequest }, meta: { timestamp } }`
      - Erreur : `{ error: { code, message, details? } }` avec codes HTTP corrects.

### 3. Upload et stockage des fichiers

- [ ] **Mettre en place un utilitaire d’upload** dans `lib/` (ou réutiliser s’il existe déjà) :
  - [ ] Valider côté serveur : MIME type (`application/pdf`, `image/jpeg`, `image/png`), taille max 10 Mo.
  - [ ] Intégrer le stockage (S3/Cloudinary/équivalent) suivant les décisions d’infrastructure (voir `architecture.md`).
  - [ ] Retourner des URLs sécurisées (idéalement pré-signées ou contrôlées).
- [ ] Gérer la configuration des buckets/containers via variables d’environnement (`.env.local`, `.env.production`), **sans** committer de secrets.

### 4. UI hôte – page de vérification annonce

- [ ] **Créer ou compléter une page protégée** pour la vérification d’une annonce :  
  - Probablement sous `app/(protected)/host/listings/[id]/verification/page.tsx`.
- [ ] Ajouter un composant client `VerificationUploadForm` dans `components/features/verification/` :
  - [ ] Interface de sélection de fichiers avec drag & drop + liste des fichiers sélectionnés.
  - [ ] Affichage clair des contraintes : formats autorisés, taille max.
  - [ ] Affichage du statut courant de la demande (si elle existe) : `pending`, `in_review`, `approved`, `rejected`, etc.
  - [ ] Bouton “Soumettre pour vérification” désactivé tant qu’aucun fichier valide n’est sélectionné.
  - [ ] Gestion des états `isLoading`, `error`, `success` dans l’UI, cohérents avec les patterns du projet.

### 5. Statut et feedback

- [ ] **Mettre à jour le modèle `Listing`** (si non prévu) pour exposer un champ `verificationStatus` (ou utiliser uniquement `VerificationRequest` + vues agrégées).
- [ ] Sur la page d’édition d’annonce et dans le tableau de bord hôte :
  - [ ] Afficher un chip/badge de statut : `Non vérifiée`, `En cours de vérification`, `Vérifiée`, `Suspendue`.
  - [ ] Lier ce statut à l’existence et au statut de la `VerificationRequest`.

### 6. Tests

- [ ] **Tests unitaires** (services) :
  - [ ] `verification.service.test.ts` pour la création de demande :
    - Cas nominal (hôte KYC vérifié + annonce valide).
    - Refus si hôte non KYC ou rôle incorrect.
    - Refus si demande déjà `pending`/`in_review`.
- [ ] **Tests d’intégration API** :
  - [ ] `tests/integration/api/verifications/route.test.ts` :
    - Auth absente → `401`.
    - Rôle différent de `host` → `403`.
    - Payload invalide → `400` avec `code: 'VALIDATION_ERROR'`.
    - Succès → `201`/`200` avec `data` et `meta.timestamp`.
- [ ] **Tests UI** (si infra de tests déjà en place) :
  - [ ] Composant de formulaire affiche les erreurs de validation client (taille/format).
  - [ ] Le bouton “Soumettre” se désactive pendant l’appel réseau et évite le double envoi.

## Dev Notes (contexte technique & guardrails)

### Stack & contraintes globales (rappel)

- Frontend : **Next.js 15+ (App Router)**, **React 18+**, **TypeScript strict**.  
- Backend : API routes Next.js, **PostgreSQL 18.1** via **Prisma**, services dédiés dans `server/services/*`.  
- Auth : **NextAuth.js v4.24.13** avec rôles (tenant/host/support) et KYC progressif.  
- Stockage : documents sensibles (KYC, titres) doivent respecter les contraintes **RGPD** et législation Indonésie.  
- **CRITIQUE** :  
  - Prisma **uniquement** dans `server/services/*` et éventuellement `server/actions/*`.  
  - API routes ne doivent **jamais** appeler Prisma directement (utiliser les services).  
  - Aucune donnée sensible en clair dans les réponses API ou le front.

### Découpage technique attendu

- **API** :
  - `app/api/verifications/route.ts` :
    - `POST` : création d’une `VerificationRequest` + enregistrement des documents.
- **Services** :
  - `server/services/verification/verification.service.ts` :
    - Encapsule toute la logique métier (droits, unicité de demande, lien avec listing).
- **UI** :
  - `app/(protected)/host/listings/[id]/verification/page.tsx` (Server Component) :
    - Charge les infos de l’annonce + statut de vérification.
    - Rend un composant client `VerificationUploadForm`.

### Sécurité & conformité

- Vérifier côté serveur :
  - Rôle `host`, session valide via `getServerSession(authOptions)`.
  - Statut KYC de l’hôte (lecture via services d’auth/profil).
  - Ownership de l’annonce (le `hostId` de la `Listing` doit correspondre au `user.id`).
- **Jamais** exposer directement les URLs internes des documents si elles donnent accès brut aux fichiers :
  - Préférer des URLs signées limitées dans le temps ou un proxy contrôlé.
- Journaliser côté serveur les erreurs d’upload et de création de vérification, mais renvoyer au client uniquement des messages fonctionnels.

### Patterns de code à respecter

- Utiliser les **schémas Zod** pour toutes les entrées API (voir `project-context.md` pour les exemples).
- Respecter le format de réponse API documenté (section “API Response Format” dans `project-context.md` et `architecture.md`).
- Respecter la structure de projet :
  - `src/app/api/*` → routes HTTP.
  - `src/server/services/*` → logique métier.
  - `src/lib/*` → utilitaires (upload, auth, etc.).
  - `src/components/features/verification/*` → composants UI de cette feature.

## Project Structure Notes

- Place ce travail dans les répertoires suivants (voir `architecture.md` pour l’arborescence de référence) :
  - **Backend** :
    - `prisma/schema.prisma` → nouveaux modèles `VerificationRequest`, `VerificationDocument`.
    - `src/server/services/verification/verification.service.ts`.
    - `src/app/api/verifications/route.ts`.
  - **Frontend** :
    - `src/app/(protected)/host/listings/[id]/verification/page.tsx`.
    - `src/components/features/verification/VerificationUploadForm.tsx`.
- Veiller à aligner les imports sur les alias (`@/server/services/...`, `@/components/...`, `@/lib/...`).

## References

- Epic & stories : `_bmad-output/planning-artifacts/epics.md` (section **Epic 2: Vérification Hôte & Système de Confiance**, Story 2.1).  
- PRD : `_bmad-output/planning-artifacts/prd.md` (sections **Host Verification & Trust**, **Support & Operations**).  
- Architecture : `_bmad-output/planning-artifacts/architecture.md` (sections **Data Architecture**, **Authentication & Security**, **Project Structure & Boundaries**).  
- Règles projet / patterns : `_bmad-output/project-context.md` (naming, réponses API, erreurs, Prisma, tests).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, contexte complet PRD + Architecture + Project Context + Epics)

### Debug Log References

- Story auto-sélectionnée depuis `sprint-status.yaml` : `2-1-upload-documents-titre-de-propriete-ou-mandat-par-hote` (status initial `backlog`, epic `epic-2` passé à `in-progress` après création de cette story).  

### Completion Notes List

- [x] Story 2.1 détaillée avec alignement FR7 + Epic 2.  
- [x] Conditions d’accès (rôle, KYC, ownership annonce) explicitées.  
- [x] Guardrails techniques : structure projet, services, API, sécurité, stockage documents.  
- [x] Tests unitaires + intégration API planifiés.  

### File List

- `_bmad-output/implementation-artifacts/2-1-upload-documents-titre-de-propriete-ou-mandat-par-hote.md` (ce fichier).

