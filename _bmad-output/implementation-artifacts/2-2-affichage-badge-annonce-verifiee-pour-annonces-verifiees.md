# Story 2.2: Affichage badge "Annonce vérifiée" pour annonces vérifiées

Status: ready-for-dev

## Story

As a **locataire**  
I want **voir un badge "Annonce vérifiée" sur les annonces vérifiées**  
so that **je peux identifier rapidement les annonces de confiance**.

## Contexte fonctionnel (Epic 2)

- **Epic 2 – Vérification Hôte & Système de Confiance**  
  Les hôtes peuvent être vérifiés et obtenir un badge "Annonce vérifiée" pour gagner la confiance des locataires, différenciateur clé de la plateforme.
- **FR couverts par cette story** :  
  - **FR8**: Affichage badge "Annonce vérifiée"  
  - S’appuie sur FR7 (documents + demande de vérification) et prépare FR9–FR11 (workflow support + suspension).

## Acceptance Criteria

Basés sur `epics.md` (Story 2.2) + règles de design/accessibilité du PRD/Architecture :

1. **Affichage du badge sur les listes d’annonces**
   - Given une annonce a le statut de vérification `"verified"` en base  
   - When je consulte la liste des annonces  
   - Then un badge “Annonce vérifiée” (par ex. `✓ Annonce vérifiée`) est affiché de manière visible sur chaque carte d’annonce vérifiée  
   - And aucune annonce non vérifiée n’affiche ce badge.

2. **Affichage du badge sur la page détail**
   - Given une annonce a le statut `"verified"`  
   - When je consulte la page de détail de l’annonce  
   - Then le badge “Annonce vérifiée” est affiché près du titre ou d’un bloc “Confiance” selon le design system.

3. **Accessibilité et design system**
   - Given le badge est visible dans l’UI  
   - When j’utilise un lecteur d’écran ou la navigation clavier  
   - Then le badge :
     - Utilise le composant `VerifiedBadge` dans `components/features/verification/`  
     - Respecte les règles d’accessibilité (ARIA label décrivant la vérification)  
     - Respecte un contraste minimal **4.5:1**  
     - Est cohérent avec le design system (Tailwind + shadcn/ui).

4. **Comportement au clic (détails de la vérification)**
   - Given je clique ou active le badge (via clavier)  
   - When l’annonce est vérifiée  
   - Then je peux voir un petit panneau/tooltip/modal (MVP = simple tooltip ou sheet) indiquant au minimum :
     - La signification du badge (documents et identité vérifiés par la plateforme)  
     - La date de dernière vérification (si disponible)  
   - And aucun détail sensible (document, données KYC brutes) n’est exposé.

5. **Cohérence multi-vues**
   - Given une annonce est `verified`  
   - When j’accède à différentes vues (liste, détail, éventuelles vues carte ou comparaison)  
   - Then le statut visuel (badge) est cohérent partout où l’annonce apparaît.

6. **Comportement en cas de changement de statut**
   - Given une annonce passe de `verified` à un autre statut (`suspended`, `revoked`, etc. via d’autres stories)  
   - When je recharge la liste ou la page de détail  
   - Then le badge n’est plus affiché (ou remplacé par un état cohérent avec les règles ultérieures)  
   - And aucun “badge vérifié” n’apparaît pour des annonces qui ne sont plus vérifiées.

## Tâches / Sous-tâches

### 1. Modèle de données et mapping statut → badge

- [ ] Vérifier dans `prisma/schema.prisma` l’existence d’un champ de statut de vérification :
  - Option A : champ `verificationStatus` sur `Listing` (ex: `'unverified' | 'pending' | 'verified' | 'suspended' | 'revoked'`).  
  - Option B : lecture du dernier `VerificationRequest` pour déduire un statut agrégé.
- [ ] Si nécessaire, **ajouter/ajuster** ce champ dans le modèle `Listing` ou un modèle dérivé et migrer la base (`npx prisma migrate dev`).
- [ ] Définir une fonction utilitaire (ex: `getListingVerificationStatus(listing)` dans `server/services/verification/badge.service.ts` ou dans le service `listings`) qui encapsule la logique de statut à partir des données de vérification.

### 2. Service et API – exposition du statut de vérification

- [ ] Mettre à jour le service `listing.service.ts` pour que :
  - [ ] Les méthodes de listing (liste, détail) retournent un champ `verificationStatus` ou un booléen `isVerified` **typé**.
  - [ ] La logique de calcul de ce flag est centralisée dans le service (pas dans les composants React).
- [ ] Vérifier/adapter les routes API suivantes :
  - `app/api/listings/route.ts` (GET liste)  
  - `app/api/listings/[id]/route.ts` (GET détail)  
  afin qu’elles exposent `isVerified` / `verificationStatus` dans `data` (en respectant le format standard `{ data, meta }`).

### 3. Composant `VerifiedBadge`

- [ ] Créer/compléter `VerifiedBadge` dans `components/features/verification/VerifiedBadge.tsx` :
  - [ ] Props typées (`isVerified: boolean`, éventuellement `variant?: 'small' | 'full'`, `verifiedAt?: string`).
  - [ ] Rendu conditionnel : ne rien afficher si `!isVerified`.
  - [ ] Style aligné avec shadcn/ui (par ex. `Badge` composant) et design tokens.
  - [ ] Accessibilité :
    - ARIA label (`aria-label="Annonce vérifiée par la plateforme"` ou équivalent en FR clair).  
    - Focus visible si cliquable (tabindex, role=button si interactivité).
- [ ] Ajouter éventuellement un composant `VerificationTooltip` ou intégrer un `Tooltip` shadcn pour montrer plus d’explications au survol/clic.

### 4. Intégration dans les vues (liste + détail)

- [ ] **Liste d’annonces** (`ListingCard.tsx` ou équivalent dans `components/features/listings/`) :
  - [ ] Ajouter `isVerified` dans le type de props (en se basant sur les types partagés dans `types/listing.ts`).
  - [ ] Afficher `VerifiedBadge` dans un emplacement cohérent (ex: coin supérieur de la carte).
- [ ] **Détail d’annonce** (`ListingDetail.tsx` ou page `app/(public)/listings/[id]/page.tsx`) :
  - [ ] Afficher `VerifiedBadge` à proximité du titre / header d’annonce.
  - [ ] S’assurer que les données viennent des services, pas de logique dans le composant.

### 5. UX / contenu

- [ ] Travailler avec les textes de badge en cohérence avec la **stratégie de messaging** (`messaging-strategy.md`) :
  - Message principal orienté confiance (“Annonce vérifiée par la plateforme – documents et identité contrôlés”).
  - Texte court dans le badge, texte plus complet dans le tooltip/modal si nécessaire.

### 6. Tests

- [ ] **Tests unitaires** pour `VerifiedBadge` :
  - [ ] Rend rien si `isVerified = false`.
  - [ ] Rend le badge + texte + attributs ARIA si `isVerified = true`.
- [ ] **Tests d’intégration** pour la liste et le détail :
  - [ ] Une annonce `verified` → badge présent sur la carte et la page de détail.  
  - [ ] Une annonce non vérifiée → pas de badge.  
  - [ ] Changement de statut (simulé) → badge disparaît.

## Dev Notes (guardrails techniques)

- Respecter les règles globales :
  - Aucune logique Prisma dans les composants : **services uniquement**.  
  - API avec format standard `{ data, meta }` ou `{ error }`.  
  - Types centralisés dans `types/`, synchronisés avec Prisma.
- Garder le composant `VerifiedBadge` **stateless** (décision déjà prise dans `architecture.md`) :  
  tout état ou logique métier doit rester côté service/API.

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (ajout/ajustement de champ de statut si nécessaire).
  - `src/server/services/listings/listing.service.ts` (exposition `isVerified` / `verificationStatus`).  
  - `src/server/services/verification/badge.service.ts` (optionnel, pour centraliser la logique de mapping).
  - `src/app/api/listings/*` (inclure le statut dans `data`).
- Frontend :
  - `src/components/features/verification/VerifiedBadge.tsx`.  
  - `src/components/features/listings/ListingCard.tsx`.  
  - `src/components/features/listings/ListingDetail.tsx` (ou pages correspondantes).

## References

- Epic & stories : `_bmad-output/planning-artifacts/epics.md` (Epic 2, Story 2.2).  
- PRD : `_bmad-output/planning-artifacts/prd.md` (Host Verification & Trust, UX/Accessibilité).  
- Architecture : `_bmad-output/planning-artifacts/architecture.md` (Project Structure, Naming, API Patterns).  
- Règles projet : `_bmad-output/project-context.md` (API response format, accessibilité, naming, services).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 2, Story 2.2)

### Completion Notes List

- [x] Story 2.2 détaillée avec critères d’acceptation concrets.  
- [x] Intégration du badge dans liste + détail + accessibilité.  
- [x] Guardrails pour statuts et exposition côté API/services.  

### File List

- `_bmad-output/implementation-artifacts/2-2-affichage-badge-annonce-verifiee-pour-annonces-verifiees.md`.

