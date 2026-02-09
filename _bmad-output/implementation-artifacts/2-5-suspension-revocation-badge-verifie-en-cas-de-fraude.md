# Story 2.5: Suspension/révocation badge vérifié en cas de fraude

Status: ready-for-dev

## Story

As a **support**  
I want **suspendre ou révoquer un badge vérifié en cas de fraude détectée**  
so that **la confiance de la plateforme est préservée et les locataires sont protégés**.

## Contexte fonctionnel (Epic 2)

- S’appuie sur :
  - 2.1 (création demande), 2.3 (back-office), 2.4 (approbation/rejet).  
- **FR couvert** :
  - **FR11**: Suspension/révocation badge vérifié en cas de fraude.
- Impact :
  - Modifie le statut de vérification et donc l’affichage du badge (Story 2.2).  
  - Interagit avec les flux d’incidents/fraude du support (Epic 9).

## Acceptance Criteria

Basés sur `epics.md` (Story 2.5) :

1. **Suspension/révocation d’un badge vérifié**
   - Given je suis support et j’ai détecté une fraude (documents falsifiés, annonce frauduleuse, etc.)  
   - When je suspends ou révoque le badge vérifié d’un hôte depuis le back-office  
   - Then le badge “Annonce vérifiée” est immédiatement retiré de toutes les annonces de cet hôte (ou de l’annonce ciblée selon le modèle choisi)  
   - And le statut de vérification passe à `"suspended"` ou `"revoked"` selon l’action.

2. **Raison obligatoire**
   - Given je choisis de suspendre ou révoquer  
   - When je clique sur “Suspendre” ou “Révoquer”  
   - Then je dois saisir une **raison de suspension/révocation** (champ obligatoire)  
   - And cette raison est stockée en base et visible dans le back-office support.

3. **Notifications et impact fonctionnel**
   - Given le badge d’un hôte est suspendu/révoqué  
   - When l’action est confirmée  
   - Then :
     - L’hôte reçoit une notification avec la raison.  
     - Toutes les annonces actives de cet hôte sont marquées comme non vérifiées.  
     - Les locataires ayant des réservations en cours sont notifiés (au minimum prévu dans PRD / Epic 9).

4. **Audit complet**
   - Given une action de suspension/révocation est effectuée  
   - When je consulte les logs en back-office  
   - Then je peux voir :
     - Qui a effectué l’action  
     - Quand  
     - Sur quelles annonces/utilisateurs  
     - La raison saisie  
     - Les éventuelles preuves associées (référence à des incidents, signalements, etc.).

5. **Compatibilité avec les autres statuts**
   - Given une demande de vérification est `approved`  
   - When je suspends/révoque  
   - Then le système ne casse pas l’historique : l’approbation originale reste visible, mais l’état courant de vérification est “suspendu” ou “révoqué”.  
   - And l’UI (hôte, locataire, support) reflète l’état courant, pas seulement l’historique.

## Tâches / Sous-tâches

### 1. Modèle de données & transitions

- [ ] S’assurer que les statuts de vérification supportent : `'approved'`, `'suspended'`, `'revoked'`.  
- [ ] Dans `verification.service.ts` :
  - [ ] Ajouter des méthodes :
    - `suspendVerification({ target, supportUserId, reason })`  
    - `revokeVerification({ target, supportUserId, reason })`  
    où `target` peut être un `hostId` ou une `verificationRequestId` selon le design retenu.
  - [ ] Ces méthodes doivent :
    - Valider l’état courant (seulement possible si actuellement `approved` ou déjà `suspended`/`revoked` selon règles).  
    - Mettre à jour le statut courant (`suspended` / `revoked`).  
    - Propager la mise à jour aux annonces concernées (`verificationStatus` mis à jour).  
    - Créer un audit log complet.

### 2. API admin – endpoints suspension/révocation

- [ ] Créer des endpoints (ou étendre les routes admin existantes) :
  - [ ] `POST /api/admin/verifications/[id]/suspend`  
  - [ ] `POST /api/admin/verifications/[id]/revoke`  
    - Corps requis : `{ reason: string }`.  
    - Auth : rôle `support` uniquement.  
    - Appellent les méthodes `suspendVerification` / `revokeVerification`.  
    - Utilisent le format d’erreurs standard pour gestion des transitions invalides.

### 3. UI back-office – actions de fraude

- [ ] Sur la page `app/admin/verifications/[id]/page.tsx` ou éventuellement dans une section `fraud` (voir architecture) :
  - [ ] Ajouter des boutons “Suspendre le badge” / “Révoquer le badge” disponibles uniquement si le statut est `approved`.  
  - [ ] Ouvrir un dialog demandant la **raison** (champ obligatoire) avant confirmation.  
  - [ ] Afficher un résumé clair de l’impact (“Toutes les annonces vérifiées de cet hôte perdront leur badge immédiatement.”).

### 4. Impact sur UI locataire & hôte

- [ ] Locataire :
  - [ ] S’assurer que les annonces affectées ne montrent plus le badge “Annonce vérifiée” (Story 2.2).  
  - [ ] Pour les réservations en cours, prévoir une base de notification (même si flux détaillé est dans Epic 9).
- [ ] Hôte :
  - [ ] Sur les pages de gestion d’annonces / de vérification :
    - Afficher clairement que la vérification est `Suspendue` ou `Révoquée`.  
    - Afficher la raison (texte stocké).  
    - Indiquer si un recours/processus d’appel est prévu (pour l’instant texte informatif seulement).

### 5. Tests

- [ ] Services :
  - [ ] Suspension/révocation sur un statut `approved` → statut bascule correctement, annonces mises à jour.  
  - [ ] Tentative de suspension/révocation sur un statut non compatible → erreur métier.  
- [ ] API :
  - [ ] Auth/role, validations, erreurs.  
- [ ] UI :
  - [ ] Le badge disparaît côté locataire après suspension/révocation.  
  - [ ] L’hôte voit la raison et le nouveau statut.

## Dev Notes (guardrails techniques)

- Fort lien avec les **services de fraude/incident** décrits dans `architecture.md` (Epic 9) :
  - Éviter de dupliquer la logique : s’il existe un `fraud.service.ts`, placer les traitements métier transverses là.
- Veiller à ne pas casser l’intégrité des données :
  - Ne jamais supprimer l’historique des vérifications, uniquement changer l’état courant.  
  - S’assurer que les index/contraintes Prisma restent cohérents.

## Project Structure Notes

- Backend :
  - `src/server/services/verification/verification.service.ts`.  
  - `src/app/api/admin/verifications/[id]/suspend/route.ts`.  
  - `src/app/api/admin/verifications/[id]/revoke/route.ts`.  
  - Éventuellement `src/server/services/support/fraud.service.ts` pour la logique transversale.
- Frontend :
  - `src/app/admin/verifications/[id]/page.tsx` (ajout boutons/actions).  
  - Pages hôte/locataire existantes (affichage des nouveaux statuts).

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 2, Story 2.5 + Epic 9 pour incidents/fraude).  
- `_bmad-output/planning-artifacts/prd.md` (Fraud prevention, Support & Opérations).  
- `_bmad-output/planning-artifacts/architecture.md` (Support services, audit, status mapping).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 2, Story 2.5)

### Completion Notes List

- [x] Story 2.5 détaillée, flux complet de suspension/révocation du badge.  
- [x] Impact sur annonces, badge, notifications et audit.  

### File List

- `_bmad-output/implementation-artifacts/2-5-suspension-revocation-badge-verifie-en-cas-de-fraude.md`.

