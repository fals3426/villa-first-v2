# Plan de Migration Globale V1 - Toute l'Application

**Date :** 2026-01-28  
**Objectif :** Migrer l'entièreté de l'application vers le design V1 épuré noir/blanc

---

## 📋 Inventaire Complet

### Pages Publiques (3)
- ✅ `/` - Page d'accueil (DÉJÀ FAIT)
- ⏳ `/listings` - Liste villas
- ⏳ `/listings/compare` - Comparaison villas

### Pages Authentification (2)
- ⏳ `/login` - Connexion
- ⏳ `/register` - Inscription

### Pages Protégées Locataire (11)
- ⏳ `/dashboard` - Tableau de bord
- ⏳ `/bookings` - Mes réservations
- ⏳ `/bookings/new/[listingId]` - Nouvelle réservation
- ⏳ `/bookings/[id]/checkin` - Check-in
- ⏳ `/chat` - Liste conversations
- ⏳ `/chat/[chatId]` - Conversation
- ⏳ `/watchlist` - Favoris
- ⏳ `/profile` - Profil
- ⏳ `/kyc` - Vérification KYC
- ⏳ `/onboarding` - Onboarding
- ⏳ `/settings/notifications` - Paramètres notifications

### Pages Protégées Hôte (5)
- ⏳ `/host/dashboard` - Dashboard hôte
- ⏳ `/host/listings` - Mes annonces
- ⏳ `/host/listings/new` - Nouvelle annonce
- ⏳ `/host/listings/[id]/edit` - Éditer annonce
- ⏳ `/host/bookings` - Réservations reçues

### Pages Admin (4)
- ⏳ `/admin/dashboard` - Dashboard admin
- ⏳ `/admin/verifications` - Vérifications
- ⏳ `/admin/verifications/[id]` - Détail vérification
- ⏳ `/admin/incidents` - Incidents
- ⏳ `/admin/incidents/[id]` - Détail incident
- ⏳ `/admin/audit-logs` - Logs d'audit

### Composants Communs
- ⏳ Navigation (MainNavigation, MobileBottomNavigation)
- ⏳ Forms (tous les formulaires)
- ⏳ ListingCard (partiellement fait)
- ⏳ Input, Select, Textarea
- ⏳ Badge, Alert
- ⏳ Dialog, Tabs

**Total : ~31 pages + composants**

---

## 🎯 Plan de Migration Systématique

### Phase 1 : Fondations (Priorité #1)
**Objectif :** Migrer les composants de base utilisés partout

1. **Composants UI de base**
   - [ ] Input V1
   - [ ] Select V1
   - [ ] Textarea V1
   - [ ] Label V1
   - [ ] Badge V1
   - [ ] Alert V1
   - [ ] Dialog V1
   - [ ] Tabs V1

2. **Navigation**
   - [ ] MainNavigation V1
   - [ ] MobileBottomNavigation V1 (déjà fait partiellement)

**Durée estimée :** 1 jour

### Phase 2 : Pages Publiques (Priorité #2)
**Objectif :** Migrer les pages accessibles sans compte

1. **Page Liste Villas** (`/listings`)
   - [ ] Layout V1
   - [ ] Filtres V1
   - [ ] ListingCard V1 complet
   - [ ] Copywriting V1

2. **Page Comparaison** (`/listings/compare`)
   - [ ] Layout V1
   - [ ] Cards comparaison V1
   - [ ] Copywriting V1

**Durée estimée :** 2 jours

### Phase 3 : Authentification (Priorité #3)
**Objectif :** Migrer les pages de connexion/inscription

1. **Page Login** (`/login`)
   - [ ] Layout V1
   - [ ] Formulaire V1
   - [ ] Copywriting V1

2. **Page Register** (`/register`)
   - [ ] Layout V1
   - [ ] Formulaire V1
   - [ ] Copywriting V1

**Durée estimée :** 1 jour

### Phase 4 : Pages Protégées Locataire (Priorité #4)
**Objectif :** Migrer toutes les pages utilisateur

1. **Dashboard** (`/dashboard`)
2. **Bookings** (`/bookings`, `/bookings/new/[listingId]`, `/bookings/[id]/checkin`)
3. **Chat** (`/chat`, `/chat/[chatId]`)
4. **Watchlist** (`/watchlist`)
5. **Profile** (`/profile`)
6. **KYC** (`/kyc`)
7. **Onboarding** (`/onboarding`)
8. **Settings** (`/settings/notifications`)

**Durée estimée :** 3-4 jours

### Phase 5 : Pages Hôte (Priorité #5)
**Objectif :** Migrer toutes les pages hôte

1. **Host Dashboard** (`/host/dashboard`)
2. **Host Listings** (`/host/listings`, `/host/listings/new`, `/host/listings/[id]/edit`)
3. **Host Bookings** (`/host/bookings`)

**Durée estimée :** 2-3 jours

### Phase 6 : Pages Admin (Priorité #6)
**Objectif :** Migrer les pages admin

1. **Admin Dashboard** (`/admin/dashboard`)
2. **Verifications** (`/admin/verifications`, `/admin/verifications/[id]`)
3. **Incidents** (`/admin/incidents`, `/admin/incidents/[id]`)
4. **Audit Logs** (`/admin/audit-logs`)

**Durée estimée :** 2 jours

### Phase 7 : Composants Features (Priorité #7)
**Objectif :** Migrer tous les composants métier

1. **Listing Components**
   - [ ] ListingForm V1
   - [ ] ListingPhotosSection V1
   - [ ] ListingPriceSection V1
   - [ ] ListingRulesSection V1
   - [ ] ListingCalendarSection V1

2. **Booking Components**
   - [ ] BookingForm V1
   - [ ] PaymentFlow V1

3. **Chat Components**
   - [ ] MaskedChat V1
   - [ ] ChatButton V1

4. **Search Components**
   - [ ] SearchBar V1
   - [ ] VibesFilter V1
   - [ ] BudgetFilter V1
   - [ ] MapView V1

5. **Autres**
   - [ ] CheckInForm V1
   - [ ] DocumentUpload V1
   - [ ] VibesQuestionnaire V1

**Durée estimée :** 2-3 jours

### Phase 8 : Ajustements Finaux (Priorité #8)
**Objectif :** Vérifier cohérence globale

- [ ] Vérifier cohérence visuelle partout
- [ ] Uniformiser espacements
- [ ] Valider contrastes (WCAG AA)
- [ ] Tests responsive (mobile/tablet/desktop)
- [ ] Tests accessibilité
- [ ] Performance (pas de régression)

**Durée estimée :** 1-2 jours

---

## 🎨 Principes de Migration

### Design System V1 à Appliquer Partout

**Couleurs :**
- Fond principal : `bg-black`
- Fond secondaire : `bg-zinc-900`
- Fond cards : `bg-zinc-900` avec `border border-white/10`
- Texte principal : `text-white`
- Texte secondaire : `text-white/90`
- Texte muted : `text-zinc-400`
- Bordures : `border-white/10`, `border-white/20`

**Typographie :**
- Titre principal : `.text-heading-1` (text-5xl md:text-6xl)
- Titre section : `.text-heading-2` (text-2xl md:text-3xl)
- Label : `.text-label` (text-sm uppercase tracking-wide)
- Body large : `.text-body-large`

**Boutons :**
- Primaire : `variant="v1-primary"` (blanc sur noir)
- Outline : `variant="v1-outline"` (bordure white/40)
- Ghost : `variant="v1-ghost"` (bordure subtile)

**Cards :**
- Default : `variant="v1-default"` (zinc-900, bordure)
- Overlay : `variant="v1-overlay"` (backdrop blur)
- Villa : `variant="v1-villa"` (rounded-3xl, opacity)

**Espacements :**
- Sections : `py-24`
- Container : `container mx-auto px-6`
- Gaps : `gap-6`, `gap-8`

---

## 📝 Checklist Globale

### Composants UI
- [ ] Input V1
- [ ] Select V1
- [ ] Textarea V1
- [ ] Label V1
- [ ] Badge V1
- [ ] Alert V1
- [ ] Dialog V1
- [ ] Tabs V1
- [ ] Progress V1
- [ ] Slider V1

### Navigation
- [ ] MainNavigation V1
- [ ] MobileBottomNavigation V1
- [ ] AdminNavigation V1

### Pages Publiques
- [x] Page d'accueil
- [ ] Page liste villas
- [ ] Page comparaison

### Pages Auth
- [ ] Login
- [ ] Register

### Pages Protégées
- [ ] Dashboard
- [ ] Bookings (toutes)
- [ ] Chat (toutes)
- [ ] Watchlist
- [ ] Profile
- [ ] KYC
- [ ] Onboarding
- [ ] Settings

### Pages Hôte
- [ ] Host Dashboard
- [ ] Host Listings (toutes)
- [ ] Host Bookings

### Pages Admin
- [ ] Admin Dashboard
- [ ] Admin Verifications (toutes)
- [ ] Admin Incidents (toutes)
- [ ] Admin Audit Logs

### Composants Features
- [ ] Listing Components (tous)
- [ ] Booking Components (tous)
- [ ] Chat Components (tous)
- [ ] Search Components (tous)
- [ ] Autres Components

### Tests
- [ ] Contrastes WCAG AA
- [ ] Responsive mobile
- [ ] Responsive tablet
- [ ] Responsive desktop
- [ ] Accessibilité clavier
- [ ] Accessibilité screen reader
- [ ] Performance

---

## 🚀 Ordre d'Exécution Recommandé

1. **Phase 1** : Composants UI de base (fondations)
2. **Phase 2** : Pages publiques (impact utilisateur max)
3. **Phase 3** : Authentification (première impression)
4. **Phase 4** : Pages protégées locataire (expérience principale)
5. **Phase 5** : Pages hôte (expérience hôte)
6. **Phase 6** : Pages admin (expérience admin)
7. **Phase 7** : Composants features (cohérence)
8. **Phase 8** : Ajustements finaux (qualité)

**Durée totale estimée :** 12-16 jours

---

## 📊 Suivi de Progression

**Statut global :** 🟡 En cours (1/8 phases complétées)

- ✅ Phase 0 : Page d'accueil (complétée)
- ⏳ Phase 1 : Composants UI de base (à faire)
- ⏳ Phase 2 : Pages publiques (à faire)
- ⏳ Phase 3 : Authentification (à faire)
- ⏳ Phase 4 : Pages protégées (à faire)
- ⏳ Phase 5 : Pages hôte (à faire)
- ⏳ Phase 6 : Pages admin (à faire)
- ⏳ Phase 7 : Composants features (à faire)
- ⏳ Phase 8 : Ajustements finaux (à faire)

---

**Plan créé le :** 2026-01-28  
**Dernière mise à jour :** 2026-01-28
