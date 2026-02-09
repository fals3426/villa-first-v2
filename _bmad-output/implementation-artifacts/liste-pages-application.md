# Liste complète des pages de l'application Villa first v2

## 📋 Vue d'ensemble

Cette liste répertorie toutes les pages accessibles dans l'application, organisées par catégorie et niveau d'accès.

---

## 🌐 Pages publiques (non authentifiées)

### Page d'accueil
- **Route** : `/`
- **Fichier** : `src/app/page.tsx`
- **Description** : Page d'accueil publique avec présentation de la plateforme, fonctionnalités, témoignages

### Authentification
- **Route** : `/login`
- **Fichier** : `src/app/(auth)/login/page.tsx`
- **Description** : Page de connexion

- **Route** : `/register`
- **Fichier** : `src/app/(auth)/register/page.tsx`
- **Description** : Page d'inscription

---

## 🔓 Pages publiques (authentifiées ou non)

### Recherche et annonces
- **Route** : `/listings`
- **Fichier** : `src/app/(public)/listings/page.tsx`
- **Description** : Liste des annonces avec filtres (localisation, budget, vibes), vue liste/carte

- **Route** : `/listings/[id]`
- **Fichier** : `src/app/(public)/listings/[id]/page.tsx`
- **Description** : Page de détail d'une annonce (photos swipeable, description, règles, disponibilité, carte)

- **Route** : `/listings/compare`
- **Fichier** : `src/app/(public)/listings/compare/page.tsx`
- **Description** : Page de comparaison de plusieurs annonces

### Profils publics
- **Route** : `/profile/[userId]`
- **Fichier** : `src/app/(public)/profile/[userId]/page.tsx`
- **Description** : Profil public d'un utilisateur (colocataire/hôte) avec vibes et préférences

---

## 🔐 Pages protégées (authentification requise)

### Dashboard et onboarding
- **Route** : `/dashboard`
- **Fichier** : `src/app/(protected)/dashboard/page.tsx`
- **Description** : Tableau de bord locataire avec actions rapides et informations

- **Route** : `/onboarding`
- **Fichier** : `src/app/(protected)/onboarding/page.tsx`
- **Description** : Questionnaire d'onboarding pour les locataires (vibes)

### Profil utilisateur
- **Route** : `/profile`
- **Fichier** : `src/app/(protected)/profile/page.tsx`
- **Description** : Page de profil utilisateur (édition des informations, photo, vibes, KYC)

### Réservations (Locataire)
- **Route** : `/bookings`
- **Fichier** : `src/app/(protected)/bookings/page.tsx`
- **Description** : Liste des réservations du locataire

- **Route** : `/bookings/new/[listingId]`
- **Fichier** : `src/app/(protected)/bookings/new/[listingId]/page.tsx`
- **Description** : Formulaire de réservation d'une coloc (sélection dates, préautorisation)

- **Route** : `/bookings/[id]/checkin`
- **Fichier** : `src/app/(protected)/bookings/[id]/checkin/page.tsx`
- **Description** : Page de check-in avec photo et géolocalisation

### Chat
- **Route** : `/chat`
- **Fichier** : `src/app/(protected)/chat/page.tsx`
- **Description** : Liste des conversations (chat masqué)

- **Route** : `/chat/[chatId]`
- **Fichier** : `src/app/(protected)/chat/[chatId]/page.tsx`
- **Description** : Conversation individuelle avec un hôte/locataire

### Watchlist
- **Route** : `/watchlist`
- **Fichier** : `src/app/(protected)/watchlist/page.tsx`
- **Description** : Liste des annonces suivies (favoris)

### Paramètres
- **Route** : `/settings/notifications`
- **Fichier** : `src/app/(protected)/settings/notifications/page.tsx`
- **Description** : Configuration des préférences de notifications

### KYC
- **Route** : `/kyc`
- **Fichier** : `src/app/(protected)/kyc/page.tsx`
- **Description** : Page de vérification KYC (upload documents, statut)

---

## 🏠 Pages Hôte (protégées, userType = 'host')

### Dashboard hôte
- **Route** : `/host/dashboard`
- **Fichier** : `src/app/(protected)/host/dashboard/page.tsx`
- **Description** : Tableau de bord hôte avec statistiques et actions rapides

### Gestion des annonces
- **Route** : `/host/listings`
- **Fichier** : `src/app/(protected)/host/listings/page.tsx`
- **Description** : Liste des annonces de l'hôte

- **Route** : `/host/listings/new`
- **Fichier** : `src/app/(protected)/host/listings/new/page.tsx`
- **Description** : Création d'une nouvelle annonce

- **Route** : `/host/listings/[id]/edit`
- **Fichier** : `src/app/(protected)/host/listings/[id]/edit/page.tsx`
- **Description** : Édition d'une annonce existante

- **Route** : `/host/listings/[id]/verification`
- **Fichier** : `src/app/(protected)/host/listings/[id]/verification/page.tsx`
- **Description** : Page de demande de vérification d'annonce (upload titres/mandats)

### Réservations hôte
- **Route** : `/host/bookings`
- **Fichier** : `src/app/(protected)/host/bookings/page.tsx`
- **Description** : Liste des réservations reçues pour les annonces de l'hôte

---

## 👨‍💼 Pages Admin (protégées, rôle admin)

### Dashboard admin
- **Route** : `/admin/dashboard`
- **Fichier** : `src/app/admin/dashboard/page.tsx`
- **Description** : Tableau de bord administrateur

### Vérifications
- **Route** : `/admin/verifications`
- **Fichier** : `src/app/admin/verifications/page.tsx`
- **Description** : Liste des demandes de vérification d'annonces

- **Route** : `/admin/verifications/[id]`
- **Fichier** : `src/app/admin/verifications/[id]/page.tsx`
- **Description** : Détail d'une demande de vérification (approbation/rejet)

### Incidents
- **Route** : `/admin/incidents`
- **Fichier** : `src/app/admin/incidents/page.tsx`
- **Description** : Liste des incidents de check-in signalés

- **Route** : `/admin/incidents/[id]`
- **Fichier** : `src/app/admin/incidents/[id]/page.tsx`
- **Description** : Détail d'un incident (gestion, relogement, remboursement)

### Audit
- **Route** : `/admin/audit-logs`
- **Fichier** : `src/app/admin/audit-logs/page.tsx`
- **Description** : Logs d'audit de l'application

---

## 🛠️ Pages de développement/test

### Design System
- **Route** : `/design-system`
- **Fichier** : `src/app/(protected)/design-system/page.tsx`
- **Description** : Page de démonstration du design system

### UI Showcase
- **Route** : `/ui-showcase`
- **Fichier** : `src/app/(protected)/ui-showcase/page.tsx`
- **Description** : Showcase des composants UI

### Test Theme V1
- **Route** : `/test-theme-v1`
- **Fichier** : `src/app/(protected)/test-theme-v1/page.tsx`
- **Description** : Page de test du thème v1

---

## 📊 Résumé par catégorie

| Catégorie | Nombre de pages |
|-----------|----------------|
| Pages publiques | 1 |
| Authentification | 2 |
| Recherche/Annonces (public) | 3 |
| Profils publics | 1 |
| Dashboard/Onboarding | 2 |
| Profil utilisateur | 1 |
| Réservations (locataire) | 3 |
| Chat | 2 |
| Watchlist | 1 |
| Paramètres | 1 |
| KYC | 1 |
| Pages Hôte | 5 |
| Pages Admin | 5 |
| Pages Dev/Test | 3 |
| **TOTAL** | **30 pages** |

---

## 🔗 Routes API (non listées dans les pages)

Les routes API sont dans `src/app/api/` et ne sont pas des pages accessibles directement :
- `/api/auth/*` - Authentification
- `/api/profile/*` - Gestion du profil
- `/api/listings/*` - Gestion des annonces
- `/api/bookings/*` - Gestion des réservations
- `/api/chat/*` - Gestion des conversations
- `/api/kyc/*` - Vérification KYC
- `/api/watchlist/*` - Gestion de la watchlist
- `/api/host/*` - Routes spécifiques aux hôtes
- `/api/admin/*` - Routes spécifiques aux admins
- `/api/webhooks/*` - Webhooks externes

---

## 📝 Notes

- Les routes avec `[id]` ou `[chatId]` sont des routes dynamiques
- Les routes dans `(auth)`, `(protected)`, `(public)` sont des groupes de routes avec layouts partagés
- Les pages admin nécessitent un rôle administrateur
- Les pages hôte nécessitent `userType = 'host'`
- Certaines pages redirigent automatiquement selon le type d'utilisateur (ex: `/dashboard` → `/host/dashboard` pour les hôtes)
