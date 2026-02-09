# Parcours utilisateurs – Plan d’exploration

Liste simple des 3 parcours avec toutes les pages à parcourir pour explorer l’application.

---

## 1. Parcours LOCATAIRE (tenant)

| # | Page | Route |
|---|------|--------|
| 1 | Accueil | `/` |
| 2 | Connexion | `/login` |
| 3 | Inscription | `/register` |
| 4 | Liste des annonces | `/listings` |
| 5 | Détail d’une annonce | `/listings/[id]` |
| 6 | Comparer des annonces | `/listings/compare` |
| 7 | Profil public (autre user) | `/profile/[userId]` |
| 8 | Dashboard (après connexion) | `/dashboard` |
| 9 | Onboarding (vibes) | `/onboarding` |
| 10 | Mon profil | `/profile` |
| 11 | Mes réservations | `/bookings` |
| 12 | Nouvelle réservation | `/bookings/new/[listingId]` |
| 13 | Check-in d’une réservation | `/bookings/[id]/checkin` |
| 14 | Chat (liste des conversations) | `/chat` |
| 15 | Conversation | `/chat/[chatId]` |
| 16 | Annonces suivies (favoris) | `/watchlist` |
| 17 | Notifications | `/settings/notifications` |
| 18 | Vérification KYC | `/kyc` |

---

## 2. Parcours HÔTE (host)

| # | Page | Route |
|---|------|--------|
| 1 | Accueil | `/` |
| 2 | Connexion | `/login` |
| 3 | Inscription | `/register` |
| 4 | Liste des annonces | `/listings` |
| 5 | Détail d’une annonce | `/listings/[id]` |
| 6 | Comparer des annonces | `/listings/compare` |
| 7 | Dashboard hôte | `/host/dashboard` |
| 8 | Mes annonces | `/host/listings` |
| 9 | Créer une annonce | `/host/listings/new` |
| 10 | Modifier une annonce | `/host/listings/[id]/edit` |
| 11 | Demande de vérification (annonce) | `/host/listings/[id]/verification` |
| 12 | Réservations reçues | `/host/bookings` |
| 13 | Mon profil | `/profile` |
| 14 | Chat | `/chat` |
| 15 | Conversation | `/chat/[chatId]` |
| 16 | Vérification KYC | `/kyc` |

---

## 3. Parcours ADMIN / SUPPORT

| # | Page | Route |
|---|------|--------|
| 1 | Connexion admin | `/login?callbackUrl=/admin/dashboard` |
| 2 | Dashboard admin | `/admin/dashboard` |
| 3 | Demandes de vérification | `/admin/verifications` |
| 4 | Détail d’une vérification | `/admin/verifications/[id]` |
| 5 | Incidents de check-in | `/admin/incidents` |
| 6 | Détail d’un incident | `/admin/incidents/[id]` |
| 7 | Logs d’audit | `/admin/audit-logs` |

---

## Pages communes (tous les parcours)

- **Accueil** : `/`
- **Connexion** : `/login`
- **Inscription** : `/register`
- **Liste annonces** : `/listings`
- **Détail annonce** : `/listings/[id]`
- **Comparer** : `/listings/compare`

---

## Pages dev / test (optionnel)

- Design system : `/design-system`
- UI Showcase : `/ui-showcase`
- Test thème v1 : `/test-theme-v1`

---

## Ordre suggéré pour explorer

1. **Locataire** : de l’accueil à l’inscription, recherche, réservation, chat, check-in.
2. **Hôte** : inscription en hôte, création d’annonce, vérification, réservations reçues.
3. **Admin** : connexion admin, vérifications, incidents, audit logs.
