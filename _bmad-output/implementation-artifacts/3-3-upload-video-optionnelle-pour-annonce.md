# Story 3.3: Upload vidéo optionnelle pour annonce

Status: ready-for-dev

## Story

As a **hôte**  
I want **uploader une vidéo optionnelle pour mon annonce**  
so that **je peux donner une meilleure vue d’ensemble de ma coloc aux locataires**.

## Contexte fonctionnel (Epic 3)

- Complète la partie média de l’annonce (après les photos).  
- **FR couvert** :
  - **FR15**: Upload vidéo optionnelle pour annonce.
- La vidéo est **optionnelle** (ne doit pas bloquer la publication si absente).

## Acceptance Criteria

Basés sur `epics.md` (Story 3.3) :

1. **Accès à la section vidéo**
   - Given j’ai une annonce existante  
   - When j’accède à la section “Vidéo” de mon annonce  
   - Then je peux uploader une vidéo unique liée à cette annonce.

2. **Validation de la vidéo**
   - Given je tente d’uploader une vidéo  
   - When le fichier ne respecte pas les contraintes  
   - Then il est refusé avec un message clair.  
   - Contraintes :
     - Formats acceptés : `MP4`, `MOV`  
     - Taille max : **100 Mo**.

3. **Encodage/optimisation et stockage**
   - Given une vidéo valide est uploadée  
   - When le backend la traite  
   - Then :
     - La vidéo est encodée/optimisée pour le web si nécessaire (selon le provider utilisé).  
     - Elle est stockée dans un service externe (S3/Cloudinary/équivalent).  
     - L’URL accessible + métadonnées sont stockées en base, associées à l’annonce.

4. **Aperçu & suppression**
   - Given une vidéo est déjà enregistrée pour l’annonce  
   - When j’ouvre la section vidéo  
   - Then :
     - Je vois un player/aperçu.  
     - Je peux supprimer la vidéo (avec confirmation), ce qui supprime le lien en base (et éventuellement le fichier côté provider).

5. **Non-blocage de la complétude**
   - Given aucune vidéo n’est uploadée  
   - When j’essaie de publier mon annonce  
   - Then l’absence de vidéo ne bloque pas la publication (elle n’entre pas dans les conditions bloquantes de complétude).

## Tâches / Sous-tâches

### 1. Modèle de données

- [ ] Étendre `Listing` ou créer un modèle `ListingVideo` :
  - Option simple (MVP) : champs dans `Listing` :
    - `videoUrl?: string`  
    - `videoProvider?: string`  
    - `videoDuration?: Int` (optionnel).  
  - Ou modèle dédié `ListingVideo` si on prévoit plusieurs vidéos à terme.
- [ ] Ajouter/mettre à jour `schema.prisma` + migration.

### 2. Service vidéo

- [ ] Créer `video.service.ts` (ou intégrer à `media.service.ts`) :
  - [ ] `uploadListingVideo(listingId, file, hostId)` :
    - Vérifie ownership.  
    - Valide format/taille.  
    - Uploade vers le provider vidéo.  
    - Sauvegarde URL + métadonnées dans Prisma.
  - [ ] `deleteListingVideo(listingId, hostId)` :
    - Supprime la référence en base.  
    - Optionnel : supprime le fichier côté provider.

### 3. API vidéo

- [ ] Créer route(s) :
  - `POST /api/listings/[id]/video` pour upload.  
  - `DELETE /api/listings/[id]/video` pour suppression.
- [ ] Auth + rôle `host` + ownership comme pour les photos.

### 4. UI hôte – section vidéo

- [ ] Composant `ListingVideoSection` :
  - [ ] Dropzone/bouton pour uploader une vidéo.  
  - [ ] Affichage d’un player HTML5 (ou composant player) si une vidéo existe.  
  - [ ] Bouton de suppression.  
  - [ ] Messages de contraintes (formats/taille).

### 5. Tests

- [ ] Services : validation stricte et respect de l’ownership.  
- [ ] API : cas d’erreur (formats, taille, rôle, etc.).  
- [ ] UI : upload + suppression + non-blocage de complétude.

## Dev Notes (guardrails techniques)

- S’aligner sur les décisions d’architecture pour stockage vidéo (pas de fichiers dans le repo).  
- Bien gérer les temps de traitement (encodage/optimisation) – éventuellement asynchrone/futur, mais au minimum ne pas geler l’UI.

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (`Listing` ou `ListingVideo`).  
  - `src/server/services/listings/video.service.ts`.  
  - `src/app/api/listings/[id]/video/route.ts`.
- Frontend :
  - `src/components/features/listings/ListingVideoSection.tsx`.  
  - Page d’édition d’annonce.

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 3, Story 3.3).  
- `_bmad-output/planning-artifacts/prd.md` (Listing Management, UX média).  
- `_bmad-output/planning-artifacts/architecture.md`.

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 3, Story 3.3)

### Completion Notes List

- [x] Story 3.3 détaillée, upload vidéo optionnelle aligné avec UX et NFR.  

### File List

- `_bmad-output/implementation-artifacts/3-3-upload-video-optionnelle-pour-annonce.md`.

