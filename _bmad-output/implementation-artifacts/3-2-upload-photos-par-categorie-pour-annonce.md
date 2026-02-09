# Story 3.2: Upload photos par catégorie pour annonce

Status: ready-for-dev

## Story

As a **hôte**  
I want **uploader des photos par catégorie (cuisine, chambres, SDB, extérieurs)**  
so that **les locataires peuvent voir tous les aspects de ma coloc**.

## Contexte fonctionnel (Epic 3)

- Suite directe de 3.1 (création d’annonce, statut `draft`).  
- **FR couvert** :
  - **FR14**: Upload photos par catégorie.
- Contribue au score de complétude (Story 3.4) et à la qualité globale des listings.

## Acceptance Criteria

Basés sur `epics.md` (Story 3.2) :

1. **Accès à la section photos**
   - Given j’ai créé une annonce (même en `draft`)  
   - When j’accède à la section “Photos” de cette annonce  
   - Then je vois des zones d’upload organisées par catégorie :
     - Cuisine  
     - Chambres  
     - Salles de bain (SDB)  
     - Extérieurs.

2. **Upload multi-photos par catégorie**
   - Given je suis sur la section photos  
   - When j’upload des photos dans une catégorie  
   - Then :
     - Je peux uploader plusieurs photos par catégorie.  
     - Chaque catégorie a au moins 1 photo “recommandée” pour complétude (utilisé plus tard dans le calcul de score).

3. **Validation fichiers**
   - Given je tente d’uploader des fichiers  
   - When les fichiers ne sont pas au bon format ou dépassent la taille max  
   - Then le système refuse ces fichiers avec un message d’erreur clair.  
   - Contraintes :
     - Formats acceptés : `JPG`, `PNG`  
     - Taille max : **10Mo** par photo (aligné sur autres stories).

4. **Optimisation et stockage**
   - Given une photo est acceptée  
   - When le backend la traite  
   - Then :
     - La photo est redimensionnée et optimisée (conversion en WebP si possible pour performance).  
     - La photo est stockée dans un service de stockage externe (S3/Cloudinary ou équivalent).  
     - L’URL optimisée + métadonnées (catégorie, ordre, etc.) sont stockées en base et rattachées à l’annonce.

5. **Réorganisation et suppression**
   - Given des photos sont déjà uploadées  
   - When j’édite la section photos  
   - Then :
     - Je peux modifier l’ordre des photos dans chaque catégorie (drag & drop ou flèches).  
     - Je peux supprimer une photo (avec confirmation minimale).  
     - L’état se reflète en base (ordre et suppression persistants).

6. **Aperçu et affichage**
   - Given des photos sont enregistrées  
   - When j’affiche l’annonce (côté locataire)  
   - Then :
     - Les photos sont affichées par catégorie (carrousel ou sections).  
     - Au moins 1 photo par catégorie est utilisée dans la composante de complétude (Story 3.4).

## Tâches / Sous-tâches

### 1. Modèle de données

- [ ] Étendre `prisma/schema.prisma` avec un modèle `ListingPhoto` :
  - `id: string @id @default(cuid())`  
  - `listingId: string` (relation vers `Listing`)  
  - `category: Enum` (`KITCHEN`, `BEDROOM`, `BATHROOM`, `OUTDOOR`, éventuellement `OTHER`)  
  - `url: string` (URL optimisée)  
  - `originalUrl?: string` (optionnel)  
  - `position: Int` (ordre d’affichage)  
  - `createdAt`, `createdBy`.  
- [ ] Migrer : `npx prisma migrate dev`.

### 2. Service d’upload photos

- [ ] Créer `photo.service.ts` dans `server/services/listings/` ou `server/services/media/` :
  - [ ] Fonctions :
    - `addListingPhotos(listingId, category, files)`  
    - `reorderListingPhotos(listingId, updates)`  
    - `deleteListingPhoto(photoId, hostId)`.
  - [ ] Vérifier :
    - Propriété de l’annonce (`listing.hostId === currentUser.id`).  
    - Formats et tailles max (utiliser un utilitaire partagé d’upload).

### 3. API d’upload et gestion photos

- [ ] Routes API (pattern depuis `architecture.md`) :
  - `POST /api/listings/[id]/photos` pour ajouter des photos à une catégorie.  
  - `PATCH /api/listings/[id]/photos` pour réorganiser.  
  - `DELETE /api/listings/[id]/photos/[photoId]` pour supprimer.  
- [ ] Toutes protégées par :
  - `getServerSession`, rôle `host`, contrôle ownership.
- [ ] Validation via Zod sur :
  - Catégorie (enum).  
  - Format files (côté serveur).  
  - Données de réorganisation (liste d’ids + positions).

### 4. Intégration stockage et optimisation

- [ ] Réutiliser/ajouter un utilitaire `uploadImage` dans `lib/` :
  - [ ] Gère :
    - Conversion/optimisation WebP.  
    - Upload vers le provider choisi.  
    - Retourne l’URL finale optimisée.  
  - [ ] Gère les erreurs (retourne erreur non technique côté API).

### 5. UI hôte – gestion photos

- [ ] Composant `ListingPhotosSection` dans `components/features/listings/` :
  - [ ] UI par catégories avec dropzones ou boutons “Ajouter des photos”.  
  - [ ] Aperçus des vignettes par catégorie.  
  - [ ] Contrôles de réorganisation/suppression.  
  - [ ] Gestion des états de chargement et d’erreur.

### 6. Tests

- [ ] Services :
  - [ ] Ajout, réorganisation, suppression respectant les règles de sécurité.  
- [ ] API :
  - [ ] Requêtes invalides (formats, tailles, catégories) → `400`.  
  - [ ] Hôte non propriétaire → `403`.  
- [ ] UI :
  - [ ] Upload multi-photos par catégorie.  
  - [ ] Re-order persistant après reload.

## Dev Notes (guardrails techniques)

- **Pas de stockage de fichiers dans le repo** : utiliser un provider externe.  
- Toujours respecter les patterns d’erreur/API décrits dans `project-context.md`.  
- Alignement avec la stratégie performance (WebP, lazy loading, etc. dans l’affichage, même si cela relève d’autres stories).

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (modèle `ListingPhoto`).  
  - `src/server/services/listings/photo.service.ts`.  
  - `src/app/api/listings/[id]/photos/*`.
- Frontend :
  - `src/components/features/listings/ListingPhotosSection.tsx`.  
  - Page d’édition d’annonce hôte (intègre cette section).

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 3, Story 3.2).  
- `_bmad-output/planning-artifacts/prd.md` (Listing Management, NFR Performance/Images).  
- `_bmad-output/planning-artifacts/architecture.md` (project structure, media patterns si présents).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 3, Story 3.2)

### Completion Notes List

- [x] Story 3.2 détaillée, pipeline complet d’upload photos par catégorie.  

### File List

- `_bmad-output/implementation-artifacts/3-2-upload-photos-par-categorie-pour-annonce.md`.

