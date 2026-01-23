# Transition UX → Architecture - Villa first v2

**Date:** 2026-01-20  
**Document source:** `_bmad-output/planning-artifacts/ux-design-specification.md`  
**Objectif:** Fournir à l'agent Architecture les informations clés de la spécification UX pour guider les décisions techniques

---

## 📋 Vue d'ensemble

La spécification UX complète est disponible dans `ux-design-specification.md`. Ce document résume les **décisions techniques critiques** issues de la spécification UX qui doivent influencer l'architecture.

---

## 🎨 Design System & Stack Technique

### Choix du Design System
**Tailwind CSS + Headless UI (Radix UI)**

**Rationale UX :**
- Maximale différenciation visuelle (badge vérifié, système de vibes)
- Performance mobile-first (PWA)
- Rapidité de développement MVP
- Flexibilité/évolutivité
- Accessibilité intégrée (WCAG AA)
- Alignement avec React/Next.js

**Implications Architecture :**
- Stack frontend : React/Next.js avec Tailwind CSS
- Composants UI : Headless UI (Radix UI) pour primitives accessibles
- Design tokens : Système de tokens personnalisés pour couleurs, spacing, typographie

---

## 🧩 Composants Custom à Intégrer

### 1. Badge Vérifié (Priorité absolue)
**Complexité:** Moyenne  
**Timeline:** Semaine 1-2

**Spécifications techniques :**
- Composant complètement custom (pas de composant existant)
- États multiples : Vérifié complet, Partiellement vérifié, Non vérifié, En attente, Suspendu
- Modal détails vérification (ID vérifiée, Titre vérifié, Mandat vérifié, Calendrier synchronisé)
- ARIA labels complets pour accessibilité
- Position prioritaire : haut à gauche de la photo annonce

**Implications Architecture :**
- Système de vérification backend (ID, Titre, Mandat, Calendrier)
- API pour récupérer statut vérification
- Cache pour performance (badge affiché partout)

### 2. Card Annonce (Core experience)
**Complexité:** Moyenne  
**Timeline:** Semaine 1-2

**Spécifications techniques :**
- Structure : Photo (150px mobile), Badge vérifié, Like/Favoris, Titre, Prix, Localisation, Vibes, CTA
- Hiérarchie visuelle : Confiance > Vibes > Prix
- Responsive : Full-width mobile, 2-3 colonnes desktop
- États : Default, Hover, Selected/Favoris, Indisponible, Loading (skeleton)

**Implications Architecture :**
- API annonces avec filtres (budget, zone, vibes, vérification)
- Système de favoris (localStorage + backend)
- Optimisation images (lazy loading, formats modernes)
- Cache pour performance liste

### 3. Système de Vibes
**Complexité:** Faible-Moyenne  
**Timeline:** Semaine 2

**Spécifications techniques :**
- Tags avec icônes : 🌙 Calme, 🎉 Social, 🧘 Spiritualité, 💻 Télétravail
- Multi-select dans filtres
- Affichage inline sur cartes annonces
- Couleurs distinctives par vibe

**Implications Architecture :**
- Modèle de données : Vibes comme entités séparées
- Matching algorithm : Filtrage par vibes dans recherche
- API filtres avec support multi-select vibes

### 4. Filtres (Affinement recherche)
**Complexité:** Moyenne  
**Timeline:** Semaine 2-3

**Spécifications techniques :**
- Panneau slide-in mobile, sidebar desktop
- Filtres : Budget (slider), Zone (liste/map), Vibes (multi-select), Vérification (toggle)
- Application temps réel (pas de bouton "Appliquer")
- Chips actifs affichés en haut

**Implications Architecture :**
- API recherche avec filtres multiples
- Debounce pour performance (300ms)
- Persistance filtres (localStorage)
- Optimisation requêtes (indexation, cache)

### 5. Chat Masqué (Protection plateforme)
**Complexité:** Moyenne-Élevée  
**Timeline:** Semaine 3-4

**Spécifications techniques :**
- Chat visible mais bloqué avant réservation
- Overlay avec message + CTA "Réserver"
- Déblocage automatique après réservation
- Coordonnées partiellement masquées avant validation

**Implications Architecture :**
- Système de permissions (réservation = accès chat)
- WebSocket/SSE pour chat temps réel
- Masquage données sensibles (coordonnées)
- PWA offline : Cache derniers messages

---

## 📱 Stratégie Mobile-First & PWA

### Mobile-First (Prioritaire)
**Audience mobile :**
- Locataires : Majoritairement sur mobile
- Hôtes : Utilisation mixte mobile + desktop

**Implications Architecture :**
- Responsive design obligatoire (breakpoints Tailwind)
- Touch targets ≥44px
- Performance mobile critique (<3s First Contentful Paint sur 3G)
- PWA avec service workers

### PWA (Progressive Web App)
**Fonctionnalités offline :**
- Détails annonce (cache)
- Chat derniers messages (cache)
- Accès hors ligne critique (arrivée à Bali sans connexion)

**Implications Architecture :**
- Service workers pour cache stratégique
- IndexedDB pour données offline
- Synchronisation différée quand connexion rétablie
- Manifest PWA (icônes, splash screens)

---

## ♿ Accessibilité WCAG AA

### Niveau de conformité
**WCAG Level AA** (recommandé)

**Exigences techniques :**
- Contraste 4.5:1 minimum (texte normal)
- Navigation clavier complète (Tab, Enter, Esc)
- Screen reader support (ARIA labels, roles, states)
- Focus visible (outline 2px couleur confiance #57bd92)
- Touch targets ≥44px

**Implications Architecture :**
- Headless UI (Radix UI) fournit logique accessibilité
- Tests automatisés accessibilité (axe DevTools, Lighthouse)
- Tests screen reader (VoiceOver, NVDA)
- Structure HTML sémantique obligatoire

---

## 🎯 User Journeys Critiques

### Flow 1: Locataire - Happy Path
**"Trouver ma coloc idéale à Bali"**

**Étapes techniques :**
1. Exploration libre (liste annonces) → API annonces avec filtres
2. Filtrage (Budget, Zone, Vibes) → API recherche temps réel
3. Shortlist 2-3 annonces → Système favoris
4. Détails annonce → API annonce complète
5. Réservation → Flow KYC + Paiement
6. KYC requis → API vérification identité
7. Paiement frais 25€ + préaut 20-25% → Intégration paiement (Stripe?)
8. Confirmation → Déblocage chat automatique
9. Chat avec hôte → WebSocket/SSE chat
10. Réception adresse + codes → Notification push/email
11. Accès hors ligne activé → PWA cache
12. Check-in GPS+photo → API géolocalisation + upload photo

**Implications Architecture :**
- API annonces performante (filtres, pagination)
- Système KYC (intégration tierce partie?)
- Intégration paiement (Stripe/PayPal?)
- WebSocket pour chat temps réel
- Notifications (push, email)
- Upload fichiers (photos check-in)

### Flow 2: Hôte - Publication vérifiée
**"Publier et gérer annonce vérifiée"**

**Étapes techniques :**
1. Création compte → API authentification
2. Publication annonce → API annonces (CRUD)
3. Vérification manuelle → Workflow backend (ID, Titre, Mandat)
4. Badge vérifié obtenu → Système vérification
5. Gestion calendrier → API calendrier (synchronisation)
6. Réponses messages → WebSocket chat
7. Validation réservations → API réservations

**Implications Architecture :**
- Système authentification/autorisation
- CRUD annonces avec validation
- Workflow vérification manuelle (admin dashboard?)
- API calendrier (sync externe?)
- Gestion réservations

---

## 🔐 Sécurité & Confiance

### Système de Vérification
**4 niveaux de vérification :**
1. ID vérifiée (identité hôte)
2. Titre vérifié (propriété/mandat)
3. Mandat vérifié (autorisation gestion)
4. Calendrier synchronisé (disponibilité fiable)

**Implications Architecture :**
- Base de données vérifications
- Workflow manuel (admin interface)
- API statut vérification
- Badge calculé dynamiquement

### KYC Progressif
**Approche :**
- Exploration libre sans KYC
- KYC requis pour : Réservation, Publication, Chat débloqué

**Implications Architecture :**
- Système permissions basé sur statut KYC
- Intégration KYC tierce partie (Onfido, Sumsub?)
- Stockage sécurisé données KYC

### Chat Masqué
**Protection :**
- Chat bloqué avant réservation
- Coordonnées masquées avant validation
- Déblocage automatique après paiement

**Implications Architecture :**
- Système permissions granulaire
- Masquage données sensibles (backend)
- Validation paiement = déblocage chat

---

## 📊 Performance & Scalabilité

### Performance Mobile
**Targets :**
- First Contentful Paint <3s sur 3G
- Time to Interactive <5s
- Lazy loading images
- Code splitting par route

**Implications Architecture :**
- CDN pour assets statiques
- Optimisation images (WebP, srcset)
- Lazy loading composants
- Service workers pour cache

### Scalabilité
**Considérations :**
- API annonces avec pagination
- Cache stratégique (Redis?)
- WebSocket scalable (Socket.io cluster?)
- Base de données optimisée (indexes filtres)

---

## 🗄️ Modèles de Données Clés

### Annonce
- ID, Titre, Description
- Photos (multiple)
- Prix mensuel
- Localisation (Zone, Adresse complète après réservation)
- Vibes (multi-select)
- Statut vérification (ID, Titre, Mandat, Calendrier)
- Disponibilité (calendrier)
- Hôte (référence)

### Utilisateur
- ID, Email, Nom
- Statut KYC
- Type (Locataire, Hôte, Mandataire)
- Vibes préférés (locataire)
- Réservations (références)

### Réservation
- ID, Annonce (référence)
- Locataire (référence)
- Dates (check-in, check-out)
- Statut (En attente, Confirmée, Annulée)
- Paiement (frais réservation + préaut)

### Chat
- ID, Annonce (référence)
- Participants (Hôte, Locataire)
- Messages (texte, timestamp)
- Statut débloqué (booléen)

---

## 🔗 Intégrations Externes Potentielles

### Paiement
- Stripe ou PayPal (frais réservation 25€ + préaut 20-25%)
- Webhooks pour confirmations

### KYC
- Onfido, Sumsub, ou autre (vérification identité)
- API pour statut vérification

### Géolocalisation
- Google Maps API (zones, adresses)
- Check-in GPS

### Calendrier
- Google Calendar API (synchronisation disponibilité)
- iCal export/import

### Notifications
- Push notifications (PWA)
- Email (SendGrid, Mailgun?)
- SMS (optionnel, pour check-in)

---

## 📝 Checklist Architecture

### Frontend
- [ ] React/Next.js setup avec Tailwind CSS
- [ ] Headless UI (Radix UI) intégration
- [ ] Design tokens système
- [ ] Composants custom (Badge vérifié, Card annonce, Vibes, Filtres, Chat)
- [ ] PWA configuration (service workers, manifest)
- [ ] Responsive breakpoints
- [ ] Accessibilité WCAG AA

### Backend
- [ ] API REST pour annonces, utilisateurs, réservations
- [ ] WebSocket/SSE pour chat temps réel
- [ ] Système authentification/autorisation
- [ ] Système vérification (workflow manuel)
- [ ] Intégration paiement
- [ ] Intégration KYC (si tierce partie)
- [ ] API géolocalisation
- [ ] Notifications (push, email)

### Infrastructure
- [ ] Base de données (PostgreSQL/MongoDB?)
- [ ] Cache (Redis?)
- [ ] CDN pour assets
- [ ] Service workers pour PWA
- [ ] Monitoring & logging

---

## 📚 Documents de Référence

**Spécification UX complète :**
`_bmad-output/planning-artifacts/ux-design-specification.md`

**Sections clés à consulter :**
- Component Strategy (composants custom détaillés)
- UX Consistency Patterns (patterns d'interaction)
- Responsive Design & Accessibility (exigences techniques)
- User Journey Flows (flows détaillés avec diagrammes Mermaid)

**PRD :**
`_bmad-output/planning-artifacts/prd.md`

---

## ✅ Prêt pour Architecture

Toutes les décisions UX sont documentées et prêtes à guider l'architecture technique.  
L'agent Architecture peut maintenant concevoir l'architecture système en s'appuyant sur ces spécifications UX.

---

**Note pour l'agent Architecture :**  
Ce document résume les points techniques critiques. Pour les détails complets (design tokens, états composants, patterns d'interaction), référez-vous à la spécification UX complète.
