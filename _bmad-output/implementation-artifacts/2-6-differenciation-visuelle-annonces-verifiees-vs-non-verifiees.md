# Story 2.6: Différenciation visuelle annonces vérifiées vs non vérifiées

Status: ready-for-dev

## Story

As a **locataire**  
I want **voir clairement la différence entre annonces vérifiées et non vérifiées**  
so that **je peux faire un choix éclairé basé sur le niveau de confiance**.

## Contexte fonctionnel (Epic 2)

- Consolide le travail de 2.1–2.5 côté UX/UI.  
- **FR couvert** :
  - **FR12**: Différenciation visuelle annonces vérifiées vs non vérifiées.
- Lien fort avec :
  - Le badge `VerifiedBadge` (Story 2.2).  
  - Les statuts de vérification (approved/suspended/revoked) et flux de fraude (2.5, Epic 9).

## Acceptance Criteria

Basés sur `epics.md` (Story 2.6) :

1. **Différenciation dans la liste des annonces**
   - Given je consulte la liste des annonces  
   - When il y a un mix d’annonces vérifiées et non vérifiées  
   - Then :
     - Les annonces vérifiées affichent **clairement** le badge “Annonce vérifiée” (Story 2.2).  
     - Les annonces non vérifiées n’affichent pas ce badge (ou un indicateur explicite “Non vérifiée” si décidé avec UX).  
     - La différence visuelle est nette (positionnement, couleur, icône).

2. **Différenciation cohérente sur toutes les vues**
   - Given j’accède à différentes vues : liste, détail, carte, comparaison  
   - When une annonce est vérifiée  
   - Then elle est marquée comme telle de façon cohérente sur toutes ces vues (mêmes règles de badge / style).

3. **Filtre par statut de vérification**
   - Given je suis sur la page de recherche/liste des annonces  
   - When j’utilise un filtre “Statut de vérification”  
   - Then je peux choisir au minimum :
     - “Annonces vérifiées uniquement”  
     - “Toutes les annonces”  
   - And les résultats sont mis à jour en conséquence.

4. **Priorisation optionnelle des annonces vérifiées**
   - Given j’ai choisi “Toutes les annonces”  
   - When les résultats sont affichés  
   - Then les annonces vérifiées peuvent (MVP optionnel) être affichées en premier dans l’ordre de tri, conformément aux règles de tri définies (par ex. `verified` → complétude → date).

5. **Accessibilité & consistance**
   - Given un utilisateur utilisant un lecteur d’écran  
   - When il navigue sur les cartes d’annonces  
   - Then l’information de vérification est disponible sous forme textuelle (“Annonce vérifiée” / “Annonce non vérifiée”) via ARIA ou texte visible.

## Tâches / Sous-tâches

### 1. Extension du modèle de recherche / filtres

- [ ] Dans le service `listing.service.ts` (ou recherche dédiée) :
  - [ ] Étendre la fonction de recherche pour accepter un filtre `verificationStatus` ou `verifiedOnly: boolean`.  
  - [ ] Implémenter la logique de filtrage au niveau Prisma (WHERE `verificationStatus = 'verified'` si `verifiedOnly = true`).
- [ ] Mettre à jour l’API `GET /api/listings/search` pour exposer ce filtre :
  - [ ] Ajouter `verifiedOnly?: boolean` ou param `verificationStatus` dans le schéma Zod de requête.  
  - [ ] Documenter/valider ce paramètre.

### 2. UI – filtre “Annonces vérifiées”

- [ ] Dans les composants de filtres (`SearchFilters`, `ListingFilters`, etc.) :
  - [ ] Ajouter un contrôle (checkbox ou toggle) “Afficher uniquement les annonces vérifiées”.  
  - [ ] Lier ce contrôle aux query params de la page (`?verifiedOnly=true`).  
  - [ ] S’assurer que le filtre est reflété dans l’URL et que le SSR/Server Components le prennent en compte.

### 3. UI – différenciation visuelle

- [ ] Réutiliser/améliorer `VerifiedBadge` :
  - [ ] S’assurer qu’il est toujours affiché de manière proéminente sur les cartes + pages détaillées quand `isVerified = true`.
- [ ] Pour les annonces non vérifiées :
  - [ ] Option A (sobre) : aucun badge, mais la carte vérifiée utilise un layout plus mis en avant (par ex. bordure ou label supplémentaire).  
  - [ ] Option B (plus explicite) : un indicateur texte/icon discret “Non vérifiée” (à valider avec UX).  
- [ ] Sur la carte :
  - [ ] Conserver l’alignement avec les règles de `project-context.md` sur design, contrastes, etc.

### 4. Intégration dans la carte & comparaison

- [ ] Composant “carte de confiance” (Epic 4) :
  - [ ] Utiliser des marqueurs différenciés pour les annonces vérifiées (couleur/icône différente).  
  - [ ] Légende de la carte expliquant la signification.  
- [ ] Vue comparaison :
  - [ ] Ajouter une ligne “Statut de vérification” indiquant `Vérifiée` / `Non vérifiée`.

### 5. Tests

- [ ] Services :
  - [ ] Recherche avec `verifiedOnly = true` ne retourne que des annonces vérifiées.  
  - [ ] Sans filtre, mélange cohérent.
- [ ] UI :
  - [ ] Le filtre agit correctement sur les résultats (nombre d’annonces, contenu).  
  - [ ] Un utilisateur peut identifier visuellement et via lecteur d’écran le statut de vérification.

## Dev Notes (guardrails techniques)

- Ne pas dupliquer la logique de “vérifié ou non” dans plusieurs endroits :
  - Centraliser le calcul dans le service listings/verification, et ne passer au front que des champs simples (`isVerified`, `verificationStatus`).
- Toujours respecter la structure d’API et les patterns de filtres existants (composition de query params, pas de nouveaux endpoints inutiles).

## Project Structure Notes

- Backend :
  - `src/server/services/listings/listing.service.ts` (ajout du filtre et tri).  
  - `src/app/api/listings/search/route.ts` (prise en compte du param `verifiedOnly`).
- Frontend :
  - Composants de filtre dans `components/features/search/` / `components/features/listings/`.  
  - Carte et comparaison (features `search` / `vibes` / `listings`).

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 2, Story 2.6 + Epic 4 pour recherche/carte/comparaison).  
- `_bmad-output/planning-artifacts/prd.md` (Search & Discovery, Trust Map).  
- `_bmad-output/planning-artifacts/architecture.md` (Search flow, listing service, map).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 2, Story 2.6)

### Completion Notes List

- [x] Story 2.6 détaillée, couvrant filtre, affichage et accessibilité.  
- [x] Intégration propre avec badge vérifié, carte et comparaison.  

### File List

- `_bmad-output/implementation-artifacts/2-6-differenciation-visuelle-annonces-verifiees-vs-non-verifiees.md`.

