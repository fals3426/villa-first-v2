# Story 4.2: Filtrage des annonces par budget

Status: ready-for-dev

## Story

As a **locataire**  
I want **filtrer les annonces par budget**  
so that **je ne vois que les colocs dans ma fourchette de prix**.

## Contexte fonctionnel (Epic 4)

- **FR couvert** :
  - **FR25**: Filtrage par budget.
- Complète la recherche de base (4.1) avec un filtre essentiel pour les locataires.

## Acceptance Criteria

Basés sur `epics.md` (Story 4.2) :

1. **Interface de filtre budget**
   - Given je suis sur la page de recherche/liste des annonces  
   - When j’accède aux filtres  
   - Then je peux définir une fourchette de budget (min et max en euros) via :
     - Un slider avec deux curseurs (min/max).  
     - Ou des champs numériques (input min/max).

2. **Application du filtre**
   - Given j’ai défini une fourchette de budget  
   - When je modifie les valeurs  
   - Then :
     - Seules les annonces dont le prix par place (`basePrice`) est dans cette fourchette sont affichées.  
     - Les résultats sont mis à jour en temps réel (ou après validation selon UX).

3. **Feedback dynamique**
   - Given le filtre est appliqué  
   - When les résultats changent  
   - Then :
     - Le nombre de résultats est mis à jour dynamiquement.  
     - Les prix affichés sur les cartes respectent le filtre appliqué.

4. **Persistance dans l’URL**
   - Given j’applique un filtre budget  
   - When je navigue ou partage l’URL  
   - Then les paramètres de budget sont préservés dans les query params (`?minPrice=700&maxPrice=1000`).

## Tâches / Sous-tâches

### 1. Extension du service de recherche

- [ ] Dans `listing.service.ts`, étendre `searchListingsByLocation` (ou créer `searchListings(filters)`) :
  - [ ] Ajouter paramètre `priceRange?: { min: number, max: number }`.  
  - [ ] Filtrer les listings où `basePrice` (en centimes) est entre `min` et `max`.  
  - [ ] Combiner avec les autres filtres (localisation, etc.).

### 2. API – paramètres de filtre

- [ ] Étendre `GET /api/listings/search` :
  - [ ] Query params additionnels :
    - `minPrice?: number` (en euros, converti en centimes côté service).  
    - `maxPrice?: number` (en euros, converti en centimes côté service).  
  - [ ] Valide via Zod que `minPrice <= maxPrice` si les deux sont fournis.

### 3. UI – composant filtre budget

- [ ] Composant `BudgetFilter` dans `components/features/search/BudgetFilter.tsx` :
  - [ ] Slider double curseur (utiliser un composant shadcn/ui ou lib externe comme `rc-slider`).  
  - [ ] Ou inputs numériques avec validation (min < max).  
  - [ ] Met à jour les query params de l’URL.  
  - [ ] Affiche la fourchette sélectionnée (ex: "700 € - 1 000 €").

### 4. Intégration dans la page de recherche

- [ ] Dans la page de recherche/liste :
  - [ ] Intègre `BudgetFilter` dans une section "Filtres" (sidebar ou accordéon mobile).  
  - [ ] Les query params `minPrice`/`maxPrice` sont lus côté Server Component et passés au service.

### 5. Tests

- [ ] Services :
  - [ ] Filtrage par prix fonctionne correctement (inclusif des bornes).  
  - [ ] Combinaison avec recherche localisation.
- [ ] API :
  - [ ] Validation des paramètres (min <= max).  
  - [ ] Conversion euros ↔ centimes correcte.
- [ ] UI :
  - [ ] Slider/inputs mettent à jour les résultats en temps réel.  
  - [ ] URL reflète les filtres appliqués.

## Dev Notes (guardrails techniques)

- Toujours convertir les montants côté backend (centimes) ↔ frontend (euros) pour l’affichage.  
- S’assurer que les filtres sont combinables (localisation + budget + vibes futurs).

## Project Structure Notes

- Backend :
  - `src/server/services/listings/listing.service.ts` (extension recherche avec prix).  
  - `src/app/api/listings/search/route.ts` (query params prix).
- Frontend :
  - `src/components/features/search/BudgetFilter.tsx`.  
  - Page de recherche (intègre le filtre).

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 4, Story 4.2).  
- `_bmad-output/planning-artifacts/prd.md` (Search & Discovery, pricing).  
- `_bmad-output/planning-artifacts/architecture.md` (Search flow, filters).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 4, Story 4.2)

### Completion Notes List

- [x] Story 4.2 détaillée, filtre budget avec slider/inputs et mise à jour temps réel.  
- [x] Intégration propre avec recherche de base.

### File List

- `_bmad-output/implementation-artifacts/4-2-filtrage-des-annonces-par-budget.md`.
