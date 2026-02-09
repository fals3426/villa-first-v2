# Story 9.9: Traçage historique complet (logs, chats, signalements)

Status: ready-for-dev

## Story

As a **système**  
I want **tracer un historique complet de toutes les actions (logs, chats, signalements)**  
so that **je peux assurer la traçabilité complète pour audit et résolution de litiges**.

## Contexte fonctionnel (Epic 9)

- **FR couvert** :
  - **FR58**: Traçage historique complet (logs, chats, signalements).
- Système d'audit complet consolidant tous les logs existants (déjà créés dans d'autres stories).

## Acceptance Criteria

Basés sur `epics.md` (Story 9.9) :

1. **Logs d'audit pour actions critiques**
   - Given des actions sont effectuées sur la plateforme  
   - When une action critique se produit  
   - Then un log d'audit est créé avec :
     - Type d'action.  
     - Utilisateur ayant effectué l'action.  
     - Date et heure précise.  
     - Détails de l'action.  
     - Résultat (succès/échec).

2. **Stockage chats**
   - Given des utilisateurs communiquent  
   - When des messages sont envoyés  
   - Then tous les chats sont stockés avec timestamp et participants (Story 6.2).

3. **Stockage signalements**
   - Given des incidents sont signalés  
   - When ils sont créés  
   - Then tous les signalements sont enregistrés avec détails complets (Story 8.5).

4. **Accès depuis back-office**
   - Given je suis support  
   - When j'accède au back-office  
   - Then l'historique est accessible depuis le back-office support.

5. **Export pour audit**
   - Given je consulte l'historique  
   - When je veux l'exporter  
   - Then l'historique peut être exporté pour audit externe.

6. **Conservation légale**
   - Given les logs sont créés  
   - When ils sont archivés  
   - Then les logs sont conservés selon les exigences légales (durée de rétention).

## Tâches / Sous-tâches

### 1. Vérification modèle AuditLog

- [ ] Vérifier que le modèle `AuditLog` existe (créé dans Story 6.2) :
  - [ ] `id: string @id @default(cuid())`  
  - [ ] `action: string` (type d'action)  
  - [ ] `userId: string` (relation vers `User`)  
  - [ ] `entityType: string` (ex: 'Booking', 'Listing', 'Chat', 'Incident')  
  - [ ] `entityId: string`  
  - [ ] `metadata: Json?` (détails additionnels)  
  - [ ] `result: Enum` (`'success' | 'failure'`)  
  - [ ] `createdAt: DateTime`.
- [ ] Migration Prisma si modifications nécessaires.

### 2. Service de récupération historique

- [ ] Étendre `audit.service.ts` :
  - [ ] Fonction `getAuditHistory(filters?)` :
    - Récupère tous les audit logs avec filtres (utilisateur, type action, date, entité).  
    - Inclut les relations `User`.  
    - Trie par date (plus récent en premier).  
    - Retourne liste complète.
  - [ ] Fonction `getEntityHistory(entityType, entityId)` :
    - Récupère l'historique complet d'une entité spécifique.  
    - Retourne tous les logs liés.

### 3. Consolidation historique

- [ ] Créer `history.service.ts` dans `server/services/support/` :
  - [ ] Fonction `getCompleteHistory(filters?)` :
    - Récupère audit logs (via `audit.service.ts`).  
    - Récupère chats (via `chat.service.ts`).  
    - Récupère signalements/incidents (via `incident.service.ts`).  
    - Combine et trie par date.  
    - Retourne historique consolidé.

### 4. API – historique complet

- [ ] Route `GET /api/admin/history` :
  - [ ] Auth via `getServerSession`, rôle `support`.  
  - [ ] Query params Zod :
    - `userId?: string`  
    - `entityType?: string`  
    - `entityId?: string`  
    - `startDate?: string`  
    - `endDate?: string`  
  - [ ] Appelle `historyService.getCompleteHistory(filters)`.  
  - [ ] Retourne `{ data: HistoryEntryDTO[], meta }`.

### 5. API – historique entité

- [ ] Route `GET /api/admin/history/[entityType]/[entityId]` :
  - [ ] Auth via `getServerSession`, rôle `support`.  
  - [ ] Appelle `auditService.getEntityHistory(entityType, entityId)`.  
  - [ ] Retourne historique de l'entité.

### 6. Export historique

- [ ] Route `GET /api/admin/history/export` :
  - [ ] Auth via `getServerSession`, rôle `support`.  
  - [ ] Query params : mêmes filtres que GET history.  
  - [ ] Génère fichier JSON ou CSV avec historique complet.  
  - [ ] Retourne fichier téléchargeable.

### 7. UI – page historique

- [ ] Page `app/admin/history/page.tsx` :
  - [ ] Server Component qui charge l'historique.  
  - [ ] Affiche composant client `HistoryView` :
    - [ ] Filtres (utilisateur, type entité, date).  
    - [ ] Liste chronologique de tous les événements.  
    - [ ] Affichage organisé par type (logs, chats, signalements).  
    - [ ] Bouton "Exporter l'historique".

### 8. UI – composant entrée historique

- [ ] Composant `HistoryEntry` dans `components/admin/HistoryEntry.tsx` :
  - [ ] Affiche type d'événement (badge).  
  - [ ] Affiche utilisateur, date/heure.  
  - [ ] Affiche détails de l'action.  
  - [ ] Lien vers entité concernée si applicable.

### 9. Politique de rétention

- [ ] Définir durée de rétention :
  - [ ] Audit logs : 5 ans (exigences légales).  
  - [ ] Chats : 2 ans après fin réservation.  
  - [ ] Signalements : 5 ans.
- [ ] Créer job de nettoyage (optionnel, pour MVP manuel suffit).

### 10. Tests

- [ ] Services :
  - [ ] Récupération historique fonctionne.  
  - [ ] Consolidation fonctionne correctement.
- [ ] API :
  - [ ] GET history fonctionne.  
  - [ ] Export fonctionne.
- [ ] UI :
  - [ ] Affichage historique complet.  
  - [ ] Filtres fonctionnent.

## Dev Notes (guardrails techniques)

- S'assurer que tous les audit logs sont bien créés dans toutes les stories précédentes.  
- L'export doit être performant (pagination si historique très volumineux).  
- Respecter les durées de rétention légales (ne jamais supprimer avant).

## Project Structure Notes

- Backend :
  - `prisma/schema.prisma` (modèle `AuditLog` vérifié).  
  - `src/server/services/audit.service.ts` (fonctions récupération historique).  
  - `src/server/services/support/history.service.ts` (consolidation).  
  - `src/app/api/admin/history/route.ts`.  
  - `src/app/api/admin/history/[entityType]/[entityId]/route.ts`.  
  - `src/app/api/admin/history/export/route.ts`.
- Frontend :
  - `src/app/admin/history/page.tsx`.  
  - `src/components/admin/HistoryView.tsx`.  
  - `src/components/admin/HistoryEntry.tsx`.

## References

- `_bmad-output/planning-artifacts/epics.md` (Epic 9, Story 9.9).  
- `_bmad-output/planning-artifacts/prd.md` (Support, audit logs, legal retention).  
- `_bmad-output/planning-artifacts/architecture.md` (Audit patterns, history tracking).

## Dev Agent Record

### Agent Model Used

sm / create-story (mode YOLO, Epic 9, Story 9.9)

### Completion Notes List

- [x] Story 9.9 détaillée, traçage historique complet avec consolidation logs/chats/signalements et export.  
- [x] Politique de rétention légale et accès back-office.

### File List

- `_bmad-output/implementation-artifacts/9-9-tracage-historique-complet-logs-chats-signalements.md`.
