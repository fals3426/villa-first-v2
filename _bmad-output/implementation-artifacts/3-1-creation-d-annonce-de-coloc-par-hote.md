# Story 3.1: Création d'annonce de coloc par hôte

Status: ready-for-dev

## Story

As a **hôte**  
I want **créer une nouvelle annonce de colocation**  
so that **je peux proposer ma villa/coloc aux locataires potentiels**.

## Contexte fonctionnel (Epic 3)

- **Epic 3 – Création & Gestion d'Annonces**  
  Les hôtes peuvent créer, compléter et publier des annonces de colocation avec photos, vidéos, règles et calendrier de disponibilité.
- **FR couvert** :
  - **FR13**: Création annonce de coloc.
- Cette story pose la base de l’objet `Listing` utilisé ensuite par tout le parcours (recherche, réservation, vérification, etc.).

## Acceptance Criteria

Basés sur `epics.md` (Story 3.1) :

1. **Accès à la création d’annonce**
   - Given je suis un hôte connecté avec KYC vérifié  
   - When j’accède à la page de création d’annonce  
   - Then je peux ouvrir un formulaire “Créer une annonce de coloc”.

2. **Champs obligatoires et validation**
   - Given je suis sur la page de création d’annonce  
   - When je saisis les **informations de base** :
     - Titre  
     - Description  
     - Adresse (ou zone de localisation type “Canggu, Ubud…”)  
     - Nombre de places  
     - Type de coloc (ex: villa entière, chambre privée, etc.)  
   - Then :
     - Ces champs sont validés côté client ET côté serveur (Zod + API).  
     - Les erreurs (champs manquants / formats invalides) sont affichées clairement en français.

3. **Création en base**
   - Given les données sont valides  
   - When je soumets le formulaire  
   - Then :
     - Une entrée `Listing` est créée en base de données avec au minimum :
       - `id`, `title`, `description`, `address`/`location`, `capacity`/`numberOfPlaces`, `listingType`  
       - `status = 'draft'`  
       - `hostId = user.id`  
       - `createdAt`, `updatedAt`.  
     - Aucune publication publique n’a lieu tant que l’annonce reste `draft`.

4. **Redirection et UX post-création**
   - Given la création réussit  
   - When la réponse backend est `200/201`  
   - Then :
     - Je suis redirigé vers la page d’édition de l’annonce (ou un dashboard listant mes annonces).  
     - Un message de confirmation s’affiche (“Annonce créée en brouillon. Complétez les infos pour pouvoir la publier.”).

5. **Traçabilité**
   - Given une annonce est créée  
   - When je consulte les logs d’audit en back-office (Epic 9)  
   - Then je peux voir une entrée indiquant la création de l’annonce (qui, quand, quelle annonce).

## Tâches / Sous-tâches

### 1. Modèle de données

- [ ] Dans `prisma/schema.prisma`, définir le modèle `Listing` (si non encore fait) :
  - `id: string @id @default(cuid())`  
  - `title: string`  
  - `description: string`  
  - `address` ou `location` (à choisir selon PRD / architecture)  
  - `capacity` / `numberOfPlaces: Int`  
  - `listingType: Enum` (ex: `VILLA`, `ROOM`, etc., à affiner)  
  - `status: Enum` (ex: `'draft' | 'published' | 'suspended'`)  
  - `hostId: string` (relation vers `User`)  
  - `createdAt`, `updatedAt`.
- [ ] Lancer une migration : `npx prisma migrate dev`.

### 2. Service de listings

- [ ] Créer `listing.service.ts` dans `server/services/listings/` :
  - [ ] Fonction `createListing(hostId, data)` :
    - Valide que l’utilisateur est de rôle `host` et KYC vérifié (en se reposant sur les services d’auth/profil).  
    - Crée le `Listing` avec `status = 'draft'`.  
    - Retourne un DTO typé.

### 3. API de création d’annonce

- [ ] Dans `app/api/listings/route.ts` :
  - [ ] Méthode `POST` :
    - Authentifie via `getServerSession(authOptions)`.  
    - Vérifie le rôle `host`.  
    - Valide le body via Zod (`title`, `description`, `location/address`, `capacity`, `listingType`).  
    - Appelle `listingService.createListing`.  
    - Retourne une réponse `{ data: listing, meta: { timestamp } }` avec code HTTP `201`.

### 4. UI hôte – formulaire de création

- [ ] Page `app/(protected)/host/listings/new/page.tsx` :
  - [ ] Server Component qui vérifie le rôle (ou laisse la middleware le faire) puis rend un composant client.
- [ ] Composant client `ListingForm` (réutilisable pour création/édition) dans `components/features/listings/ListingForm.tsx` :
  - [ ] Champs contrôlés pour titre, description, adresse, nombre de places, type.  
  - [ ] Validation instantanée (optionnel) alignée sur Zod côté serveur.  
  - [ ] Appel à l’API `POST /api/listings` et gestion des états `isSubmitting`, `error`, `success`.  
  - [ ] Redirection vers la page d’édition après succès (ou via callback fourni par la page).

### 5. Tests

- [ ] Tests services :
  - [ ] `createListing` crée un brouillon lié au bon `hostId`.  
  - [ ] Erreur si rôle non `host` / KYC non vérifié.
- [ ] Tests API :
  - [ ] Non authentifié → `401`.  
  - [ ] Rôle non `host` → `403`.  
  - [ ] Body invalide → `400` avec `code: 'VALIDATION_ERROR'`.  
  - [ ] Cas nominal → `201` + `data`.
- [ ] Tests UI :
  - [ ] Erreurs de validation client affichées correctement.  
  - [ ] Redirection et message de succès.

## Dev Notes (guardrails techniques)

- Respecter les règles globales :
  - Prisma uniquement dans `server/services/*`.  
  - Format de réponse API standardisé (voir `project-context.md`).  
  - Types partagés dans `types/listing.ts`.

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (modèle `Listing`).  
  - `src/server/services/listings/listing.service.ts`.  
  - `src/app/api/listings/route.ts`.
- Frontend :
  - `src/app/(protected)/host/listings/new/page.tsx`.  
  - `src/components/features/listings/ListingForm.tsx`.

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 3, Story 3.1).  
- `_bmad-output/planning-artifacts/prd.md` (Listing Management, Project Type).  
- `_bmad-output/planning-artifacts/architecture.md` (Data Architecture, Project Structure).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 3, Story 3.1)

### Completion Notes List

- [x] Story 3.1 détaillée, avec modèle `Listing`, API et UI hôte.  

### File List

- `_bmad-output/implementation-artifacts/3-1-creation-d-annonce-de-coloc-par-hote.md`.

