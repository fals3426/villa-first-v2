# Story 3.9: Définition et modification des prix

Status: ready-for-dev

## Story

As a **hôte**  
I want **définir et modifier les prix de ma coloc**  
so that **les locataires connaissent le coût et je peux ajuster selon la demande**.

## Contexte fonctionnel (Epic 3)

- **FR couvert** :
  - **FR21**: Définition et modification des prix.  
- Prépare plusieurs comportements de l’Epic 5 (blocage réservation si prix modifié sans revalidation, cohérence avec paiements).

## Acceptance Criteria

Basés sur `epics.md` (Story 3.9) :

1. **Définition du prix de base**
   - Given j’ai une annonce  
   - When j’accède à la section “Prix”  
   - Then :
     - Je peux définir un **prix par place** (en euros).  
     - Le prix est validé (montant positif, format numérique).

2. **Prix par périodes (saisonnalité – optionnel MVP)**
   - Given je souhaite gérer des saisons (optionnel)  
   - When je configure différents prix selon des périodes  
   - Then :
     - Je peux définir des plages de dates avec des prix différents.  
     - Ces prix saisonniers sont pris en compte dans le calcul du prix affiché et des réservations.

3. **Modification à tout moment**
   - Given j’ai déjà défini un prix  
   - When je le modifie  
   - Then :
     - La modification est sauvegardée en base.  
     - Le nouveau prix est utilisé pour les futures réservations.  
     - La logique de blocage des réservations en attente (FR31 / Epic 5) est appelée si besoin.

4. **Affichage clair côté locataire**
   - Given un prix est défini  
   - When un locataire consulte la page de détail de l’annonce  
   - Then :
     - Le prix par place est affiché clairement (€/mois ou autre unité définie dans le PRD).  
     - Les éventuelles variations saisonnières sont indiquées (ex: info bulle, message).

5. **Lien avec complétude**
   - Given le prix est défini  
   - When le score de complétude est recalculé  
   - Then la partie “Prix” (5 %) est considérée comme remplie.

## Tâches / Sous-tâches

### 1. Modèle de données prix

- [ ] Étendre `Listing` :
  - `basePrice: Int` (en centimes pour éviter les flottants).  
  - `currency: String` (ex: `'EUR'`, configurable).  
- [ ] Optionnel : table `ListingSeasonPrice` si pricing saisonnier (MVP = basePrice seul possible).

### 2. Service de pricing

- [ ] Créer `pricing.service.ts` dans `server/services/listings/` :
  - [ ] Méthode `updateListingPrice(listingId, hostId, payload)` :
    - Valide ownership.  
    - Valide le schéma : montant > 0, currency supportée.  
    - Met à jour le prix.  
    - Appelle `recalculateAndPersistCompleteness(listingId)`.  
    - Notifie (ou déclenche la logique) du côté réservation pour FR31 (Epic 5).

### 3. API

- [ ] Route `PATCH /api/listings/[id]/price` :
  - Auth via `getServerSession`, rôle `host`.  
  - Body Zod : `{ basePrice: number, currency?: string }`.  
  - Utilise `pricing.service`.

### 4. UI hôte – édition prix

- [ ] Composant `ListingPriceSection` :
  - [ ] Champ input pour prix (avec conversion centimes ↔ affichage).  
  - [ ] Champ sélection de currency (si multi monnaie prévu, sinon valeur figée).  
  - [ ] Sauvegarde via API + feedback visuel.

### 5. UI locataire – affichage prix

- [ ] Dans `ListingCard` et `ListingDetail` :
  - [ ] Afficher le prix formaté (ex: `1 000 € / mois`).  
  - [ ] Utiliser un helper `formatPrice` partagé (`lib/utils.ts` ou `lib/formatters.ts`).

### 6. Tests

- [ ] Services :
  - [ ] Refus des prix <= 0.  
  - [ ] Correct mapping centimes ↔ euros.  
- [ ] API :
  - [ ] Comportement sur rôles, validation, erreurs.  
- [ ] UI :
  - [ ] Affichage prix côté card & détail cohérent avec PRD.

## Dev Notes (guardrails techniques)

- Toujours manipuler les montants monétaires en **entiers** (centimes) côté backend.  
- Ne jamais formater la monnaie en backend pour affichage final (laisser le front faire via helpers).

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (champs prix).  
  - `src/server/services/listings/pricing.service.ts`.  
  - `src/app/api/listings/[id]/price/route.ts`.
- Frontend :
  - `src/components/features/listings/ListingPriceSection.tsx`.  
  - `src/components/features/listings/ListingCard.tsx` / `ListingDetail.tsx`.  
  - `src/lib/formatters.ts` (formatage prix).

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 3, Story 3.9).  
- `_bmad-output/planning-artifacts/prd.md` (pricing, business model).  
- `_bmad-output/planning-artifacts/architecture.md`.

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 3, Story 3.9)

### Completion Notes List

- [x] Story 3.9 détaillée, pricing aligné avec modèle économique.  

### File List

- `_bmad-output/implementation-artifacts/3-9-definition-et-modification-des-prix.md`.

