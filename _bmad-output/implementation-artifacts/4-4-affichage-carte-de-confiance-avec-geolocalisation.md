# Story 4.4: Affichage carte de confiance avec géolocalisation

Status: ready-for-dev

## Story

As a **locataire**  
I want **voir une carte de confiance avec géolocalisation des annonces**  
so that **je peux visualiser la localisation et la proximité des colocs**.

## Contexte fonctionnel (Epic 4)

- **FR couvert** :
  - **FR27**: Carte de confiance (géolocalisation).
- Utilise l’API Browser géolocalisation (PWA) pour afficher les annonces sur une carte interactive.

## Acceptance Criteria

Basés sur `epics.md` (Story 4.4) :

1. **Vue carte interactive**
   - Given je suis sur la page de recherche/liste des annonces  
   - When j’accède à la vue carte  
   - Then une carte interactive affiche les annonces avec leurs positions géographiques.  
   - And chaque annonce est représentée par un marqueur sur la carte.

2. **Différenciation des annonces vérifiées**
   - Given des annonces vérifiées et non vérifiées sont affichées  
   - When je consulte la carte  
   - Then les annonces vérifiées ont un marqueur distinct (couleur/icône différente) des non vérifiées.

3. **Aperçu au clic**
   - Given je clique sur un marqueur  
   - When l’interaction est détectée  
   - Then je vois un aperçu de l’annonce :
     - Titre  
     - Prix  
     - Photo principale.  
   - And je peux cliquer sur l’aperçu pour accéder au détail complet.

4. **Géolocalisation**
   - Given la carte s’affiche  
   - When le système demande la géolocalisation  
   - Then :
     - L’API Browser géolocalisation (PWA) est utilisée avec précision acceptable pour MVP.  
     - La carte peut être centrée sur ma position (optionnel) ou sur la zone de recherche.

5. **Basculement liste ↔ carte**
   - Given je suis sur la vue liste  
   - When je clique sur un bouton "Vue carte"  
   - Then je bascule vers la vue carte.  
   - And inversement, je peux revenir à la vue liste.

6. **Responsive mobile**
   - Given j’utilise un appareil mobile  
   - When j’accède à la carte  
   - Then la carte est responsive et fonctionne correctement (zoom, pan, clics tactiles).

## Tâches / Sous-tâches

### 1. Stockage des coordonnées géographiques

- [ ] Étendre le modèle `Listing` dans `schema.prisma` :
  - `latitude?: Float`  
  - `longitude?: Float`.  
- [ ] Migration Prisma.
- [ ] Note : Les coordonnées peuvent être dérivées de l’adresse via géocodage (service externe) ou saisies manuellement par l’hôte (MVP = optionnel, à valider avec UX).

### 2. Service de géolocalisation

- [ ] Créer `geolocation.service.ts` dans `server/services/listings/` :
  - [ ] Fonction `getListingsWithCoordinates(filters)` :
    - Retourne les listings avec `latitude`/`longitude` non null.  
    - Filtre selon les critères de recherche (localisation, budget, vibes).

### 3. API – données pour carte

- [ ] Route `GET /api/listings/map` ou étendre `/api/listings/search` avec param `view=map` :
  - [ ] Retourne les listings avec coordonnées + données minimales (titre, prix, photo, `isVerified`).  
  - [ ] Format optimisé pour affichage carte (moins de données que la liste complète).

### 4. UI – composant carte

- [ ] Intégrer une librairie de carte (ex: Leaflet, Mapbox GL JS, Google Maps) :
  - [ ] Créer `MapView` dans `components/features/search/MapView.tsx`.  
  - [ ] Affiche les marqueurs pour chaque annonce.  
  - [ ] Marqueurs différenciés selon `isVerified` (couleur/icône).  
  - [ ] Popup/aperçu au clic sur marqueur.

### 5. UI – basculement liste ↔ carte

- [ ] Dans la page de recherche :
  - [ ] Boutons toggle "Liste" / "Carte".  
  - [ ] Affiche `ListingList` ou `MapView` selon l’état sélectionné.  
  - [ ] Persiste le choix dans l’URL ou le state local.

### 6. Géolocalisation utilisateur (optionnel MVP)

- [ ] Demander permission géolocalisation côté client (API Browser).  
- [ ] Centrer la carte sur la position utilisateur si autorisée (ou sur zone par défaut).

### 7. Tests

- [ ] Services :
  - [ ] Retourne uniquement les listings avec coordonnées valides.  
- [ ] API :
  - [ ] Format de réponse optimisé pour carte.
- [ ] UI :
  - [ ] Carte s’affiche correctement avec marqueurs.  
  - [ ] Basculement liste ↔ carte fonctionne.  
  - [ ] Responsive sur mobile.

## Dev Notes (guardrails techniques)

- Choisir une librairie de carte légère et compatible PWA (Leaflet recommandé pour MVP).  
- Gérer les cas où les coordonnées ne sont pas disponibles (masquer ces annonces de la carte ou géocoder à la volée).  
- Respecter les contraintes de performance (limiter le nombre de marqueurs affichés simultanément si nécessaire).

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (champs `latitude`/`longitude`).  
  - `src/server/services/listings/geolocation.service.ts`.  
  - `src/app/api/listings/map/route.ts` ou extension de `/search`.
- Frontend :
  - `src/components/features/search/MapView.tsx`.  
  - Page de recherche (intègre le toggle liste/carte).

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 4, Story 4.4).  
- `_bmad-output/planning-artifacts/prd.md` (Search & Discovery, Trust Map, NFR Geolocation).  
- `_bmad-output/planning-artifacts/architecture.md` (Geolocation patterns, PWA).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 4, Story 4.4)

### Completion Notes List

- [x] Story 4.4 détaillée, carte interactive avec marqueurs différenciés et basculement liste/carte.  
- [x] Intégration géolocalisation PWA et responsive mobile.

### File List

- `_bmad-output/implementation-artifacts/4-4-affichage-carte-de-confiance-avec-geolocalisation.md`.
