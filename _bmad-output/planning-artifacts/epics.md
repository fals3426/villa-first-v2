---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
workflowStatus: complete
completedAt: '2026-01-20'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
totalEpics: 9
totalStories: 62
totalFRsCovered: 63
---

# Villa first v2 - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Villa first v2, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Les utilisateurs peuvent créer un compte (locataire ou hôte)
FR2: Les utilisateurs peuvent s'authentifier (email/mot de passe)
FR3: Les locataires peuvent compléter un onboarding avec questionnaire vibes
FR4: Les utilisateurs peuvent compléter une vérification KYC (identité)
FR5: Le système peut stocker et gérer les données d'identité vérifiées
FR6: Les utilisateurs peuvent gérer leur profil (informations personnelles)
FR7: Les hôtes peuvent uploader des documents de titre de propriété ou mandat
FR8: Le système peut afficher un badge "Annonce vérifiée" pour les annonces vérifiées
FR9: Le support peut vérifier manuellement les titres/mandats des hôtes
FR10: Le support peut approuver ou rejeter une demande de vérification
FR11: Le support peut suspendre ou révoquer un badge vérifié en cas de fraude
FR12: Le système peut différencier visuellement les annonces vérifiées vs non vérifiées
FR13: Les hôtes peuvent créer une annonce de coloc
FR14: Les hôtes peuvent uploader des photos par catégorie (cuisine, chambres, SDB, extérieurs)
FR15: Les hôtes peuvent uploader une vidéo optionnelle
FR16: Le système peut calculer un score de complétude d'annonce
FR17: Le système peut bloquer la publication si le score de complétude est insuffisant
FR18: Les hôtes peuvent définir les règles et la charte de la coloc
FR19: Les hôtes peuvent gérer la disponibilité via un calendrier interne
FR20: Le système peut synchroniser automatiquement le calendrier (rafraîchissement 30 min)
FR21: Les hôtes peuvent définir et modifier les prix
FR22: Les hôtes peuvent voir les demandes de réservation reçues
FR23: Les hôtes peuvent accepter ou refuser une demande de réservation
FR24: Les locataires peuvent rechercher des colocations par localisation
FR25: Les locataires peuvent filtrer par budget
FR26: Les locataires peuvent filtrer par vibes (critères de matching)
FR27: Les locataires peuvent voir une carte de confiance (géolocalisation)
FR28: Le système peut afficher les annonces correspondant aux critères de recherche
FR29: Les locataires peuvent comparer plusieurs annonces (photos, vidéos, détails)
FR30: Les locataires peuvent réserver une coloc disponible
FR31: Le système peut bloquer une réservation si le prix a été modifié sans revalidation
FR32: Les locataires peuvent effectuer une préautorisation de 25 € pour réserver une place dans une colocation
FR33: Le système peut préautoriser 25 € lors de la réservation d'une place, sans débit tant que la colocation n'est pas validée
FR34: Le système peut capturer les 25 € uniquement après validation explicite de la colocation par le propriétaire
FR59: Le propriétaire peut définir ses règles de validation (villa complète uniquement, validation partielle possible, validation manuelle)
FR60: Le propriétaire peut valider manuellement une colocation à tout moment, indépendamment des conditions initiales
FR61: Le système peut expirer automatiquement les préautorisations si la colocation n'est pas validée
FR62: Le système peut capturer les préautorisations de tous les locataires ayant une réservation active lors de la validation de la colocation
FR63: Le système peut gérer l'expiration automatique des préautorisations sans débit si la colocation n'est pas validée
FR35: Les locataires peuvent voir leurs réservations confirmées
FR36: Le système peut gérer les paiements en mode hors ligne (post-confirmation)
FR37: Les utilisateurs peuvent communiquer via un chat masqué (protection plateforme)
FR38: Le système peut centraliser tous les échanges dans le chat masqué
FR39: Les utilisateurs peuvent recevoir des notifications push sur mobile
FR40: Les utilisateurs peuvent recevoir des notifications email (optionnel)
FR41: Les utilisateurs peuvent recevoir des notifications SMS (optionnel)
FR42: Les utilisateurs peuvent configurer leurs préférences de notifications
FR43: Le système peut envoyer des notifications quand une annonce correspond aux critères
FR44: Le système peut envoyer des notifications quand une place se libère dans une coloc suivie
FR45: Les locataires peuvent effectuer un check-in avec photo obligatoire
FR46: Les locataires peuvent effectuer un check-in avec géolocalisation GPS
FR47: Le système peut stocker les preuves de check-in (photo + GPS)
FR48: Les locataires peuvent accéder aux informations de check-in hors ligne (adresse, codes, contact)
FR49: Les locataires peuvent signaler un problème lors du check-in
FR50: Le support peut accéder à un back-office de gestion
FR51: Le support peut voir les incidents de check-in
FR52: Le support peut gérer les incidents via un mode urgent (<30 min)
FR53: Le support peut voir les dossiers complets (KYC, chats, check-in, statut calendrier)
FR54: Le support peut suspendre une annonce ou un badge en cas de fraude
FR55: Le support peut rembourser un locataire
FR56: Le support peut reloger un locataire en cas d'incident
FR57: Le système peut générer des alertes pour sync calendrier en échec
FR58: Le système peut tracer un historique complet (logs, chats, signalements)

### NonFunctional Requirements

**Performance:**
- Web Performance: First Contentful Paint < 2 secondes, Time to Interactive < 3.5 secondes, Lighthouse Score ≥ 90 (desktop), ≥ 80 (mobile)
- Mobile Performance: Test conditions 3G throttled, Images optimisées WebP format avec lazy loading, Code splitting pour réduction taille bundle initial
- Response Times: Recherche annonces < 1 seconde, Paiement transaction complète < 5 secondes, Check-in enregistrement photo + GPS < 3 secondes, Synchronisation calendrier rafraîchissement automatique toutes les 30 minutes
- Concurrent Users: Support initial 100 utilisateurs simultanés (MVP), Scalabilité architecture prête pour 10x croissance sans refonte majeure

**Security:**
- Data Protection: Chiffrement données en transit TLS 1.3 minimum, Chiffrement données au repos AES-256, Données KYC stockage sécurisé avec accès restreint, Données paiement conformité PCI-DSS via Stripe
- Authentication & Authorization: Authentification email/mot de passe avec hashage bcrypt/argon2, Sessions tokens sécurisés avec expiration, Accès support authentification forte + audit logs, Rôles et permissions séparation claire hôte/locataire/support
- Compliance: RGPD applicable si utilisateurs européens (consentement, portabilité, suppression), PCI-DSS conformité via intégration Stripe (pas de stockage données carte), Données Indonésie respect législation locale pour stockage données KYC
- Fraud Prevention: Vérification manuelle titres/mandats (MVP), Traçabilité complète audit logs pour toutes actions critiques, Suspension immédiate badge vérifié révocable en cas de fraude détectée

**Scalability:**
- Initial Capacity (MVP): Objectif 10 colocs complètes en 6 mois, Utilisateurs ~100-200 utilisateurs actifs simultanés, Annonces ~50-100 annonces actives
- Growth Planning: Architecture prête pour 10x croissance sans refonte majeure, Base de données scalabilité horizontale possible, CDN distribution globale pour assets statiques (images, vidéos)
- Traffic Patterns: Saisonnier gestion pics saisonniers (ex: haute saison Bali), Scalabilité automatique auto-scaling selon charge

**Reliability:**
- Availability: Uptime ≥ 99% (heures ouvrées locales) sur période lancement, Downtime acceptable < 1% (maintenance planifiée exclue), Monitoring alertes automatiques si disponibilité < 99%
- Error Handling: Crash app mobile < 1% des sessions, Taux d'échec préautorisation < 3%, Taux d'échec capture paiement < 2%, Sync calendrier succès > 95% des rafraîchissements, alerte si échec
- Recovery: Backup sauvegardes quotidiennes avec rétention 30 jours, Disaster recovery RTO (Recovery Time Objective) < 4 heures, Data integrity validation et vérification données critiques
- Support Response: Mode urgent premier accusé < 30 minutes sur incidents check-in, Escalade processus d'escalade défini pour incidents critiques

**Accessibility:**
- Standards Compliance: Niveau MVP WCAG 2.1 AA (minimum viable), Priorités: Navigation au clavier (toutes fonctionnalités accessibles), Contrastes suffisants (ratio 4.5:1 minimum), Labels accessibles (formulaires, boutons), Textes alternatifs pour images (descriptions)
- User Experience: Responsive design accessible sur tous devices (mobile, tablette, desktop), Mode hors ligne accessible post-confirmation réservation
- Évolution: Audit d'accessibilité complet planifié en Growth phase, Amélioration continue itération basée sur retours utilisateurs

**Integration:**
- Payment Integration: Stripe intégration PWA + Web via Payment Request API, Fiabilité 99.9% uptime Stripe (dépendance externe), Fallback gestion erreurs paiement avec retry automatique
- Geolocation Services: API Browser géolocalisation native (PWA), Précision acceptable pour MVP, évaluation précision avant lancement, Fallback gestion cas où géolocalisation indisponible
- Notification Services: Push notifications service natif navigateur (PWA), Email service tiers (SendGrid, Mailgun, etc.), SMS service tiers (Twilio, etc.), Fiabilité 99%+ delivery rate pour notifications critiques
- Future Integrations (Growth): Calendriers externes Airbnb, Booking.com, Google Calendar (si besoin validé), Fiabilité gestion erreurs sync avec retry et alertes

### Additional Requirements

**Architecture Requirements:**
- Starter Template: Project initialization using `npx create-next-app@latest villa-first-v2 --typescript --tailwind --eslint --app --src-dir` (Epic 1 Story 1 requirement)
- Infrastructure Setup: Add shadcn/ui with `npx shadcn@latest init`, Add PWA support with `npm install @ducanh2912/next-pwa`, Set up Prisma with `npx prisma init`
- Database Schema: Define Prisma schema with all models (User, Listing, Booking, Chat, Verification, Payment, CheckIn)
- Technology Stack: Next.js 15+ with App Router, TypeScript strict mode, Tailwind CSS + Radix UI (via shadcn/ui), PostgreSQL 18.1 + Prisma ORM, NextAuth.js v4 for authentication, Socket.IO for real-time communication
- API Design: REST with Next.js API Routes, Endpoints plural nouns (e.g., `/api/listings`), Route parameters `[id]` format
- Naming Conventions: Database/API camelCase, Components PascalCase, Functions/Variables camelCase, Constants UPPER_SNAKE_CASE
- Project Structure: App Router structure (`app/`, `components/`, `lib/`), Path aliases (`@/*` for imports), Clear separation of concerns
- Monitoring & Logging: Vercel Analytics + Sentry for monitoring, Audit logs for all critical actions

**UX Design Requirements:**
- Design System: Tailwind CSS + Headless UI (Radix UI) via shadcn/ui
- Mobile-first PWA: Service workers, offline mode, responsive breakpoints
- Custom Components: Verified badge, listing cards, vibes system, filters, masked chat
- Accessibility: WCAG 2.1 AA with complete ARIA labels, keyboard navigation, 4.5:1 contrast ratio minimum
- Performance: <3s FCP on 3G, lazy loading, code splitting
- Responsive Design: Accessible on all devices (mobile, tablet, desktop)
- Browser/Device Compatibility: PWA support with offline capabilities post-confirmation
- Error Handling UX: Clear error messages, retry mechanisms, graceful degradation

### FR Coverage Map

**Epic 1: Authentification & Profils Utilisateurs**
- FR1: Epic 1 - Création de compte (locataire ou hôte)
- FR2: Epic 1 - Authentification email/mot de passe
- FR3: Epic 1 - Onboarding locataire avec questionnaire vibes
- FR4: Epic 1 - Vérification KYC (identité)
- FR5: Epic 1 - Stockage et gestion données d'identité vérifiées
- FR6: Epic 1 - Gestion du profil utilisateur

**Epic 2: Vérification Hôte & Système de Confiance**
- FR7: Epic 2 - Upload documents titre de propriété ou mandat
- FR8: Epic 2 - Affichage badge "Annonce vérifiée"
- FR9: Epic 2 - Vérification manuelle titres/mandats par support
- FR10: Epic 2 - Approbation/rejet demande de vérification
- FR11: Epic 2 - Suspension/révocation badge en cas de fraude
- FR12: Epic 2 - Différenciation visuelle annonces vérifiées vs non vérifiées

**Epic 3: Création & Gestion d'Annonces**
- FR13: Epic 3 - Création annonce de coloc
- FR14: Epic 3 - Upload photos par catégorie
- FR15: Epic 3 - Upload vidéo optionnelle
- FR16: Epic 3 - Calcul score de complétude annonce
- FR17: Epic 3 - Blocage publication si score insuffisant
- FR18: Epic 3 - Définition règles et charte coloc
- FR19: Epic 3 - Gestion disponibilité via calendrier interne
- FR20: Epic 3 - Synchronisation automatique calendrier (30 min)
- FR21: Epic 3 - Définition et modification des prix

**Epic 4: Recherche & Découverte de Colocations**
- FR24: Epic 4 - Recherche par localisation
- FR25: Epic 4 - Filtrage par budget
- FR26: Epic 4 - Filtrage par vibes (critères matching)
- FR27: Epic 4 - Carte de confiance (géolocalisation)
- FR28: Epic 4 - Affichage annonces correspondant aux critères
- FR29: Epic 4 - Comparaison plusieurs annonces

**Epic 5: Réservation & Paiement avec Validation Propriétaire**
- FR30: Epic 5 - Réservation coloc disponible
- FR31: Epic 5 - Blocage réservation si prix modifié sans revalidation
- FR32: Epic 5 - Préautorisation 25€ pour réserver
- FR33: Epic 5 - Préautorisation 25€ sans débit tant que non validée
- FR34: Epic 5 - Capture 25€ après validation explicite propriétaire
- FR35: Epic 5 - Visualisation réservations confirmées
- FR36: Epic 5 - Gestion paiements mode hors ligne
- FR59: Epic 5 - Définition règles de validation par propriétaire
- FR60: Epic 5 - Validation manuelle colocation par propriétaire
- FR61: Epic 5 - Expiration automatique préautorisations si non validée
- FR62: Epic 5 - Capture préautorisations lors validation colocation
- FR63: Epic 5 - Gestion expiration automatique préautorisations

**Epic 6: Communication & Notifications**
- FR37: Epic 6 - Communication via chat masqué
- FR38: Epic 6 - Centralisation échanges dans chat masqué
- FR39: Epic 6 - Notifications push sur mobile
- FR40: Epic 6 - Notifications email (optionnel)
- FR41: Epic 6 - Notifications SMS (optionnel)
- FR42: Epic 6 - Configuration préférences notifications
- FR43: Epic 6 - Notifications quand annonce correspond aux critères
- FR44: Epic 6 - Notifications quand place se libère

**Epic 7: Gestion des Demandes de Réservation**
- FR22: Epic 7 - Visualisation demandes de réservation reçues
- FR23: Epic 7 - Acceptation/refus demande de réservation

**Epic 8: Check-in & Vérification d'Arrivée**
- FR45: Epic 8 - Check-in avec photo obligatoire
- FR46: Epic 8 - Check-in avec géolocalisation GPS
- FR47: Epic 8 - Stockage preuves check-in (photo + GPS)
- FR48: Epic 8 - Accès informations check-in hors ligne
- FR49: Epic 8 - Signalement problème lors check-in

**Epic 9: Support & Opérations**
- FR50: Epic 9 - Accès back-office de gestion
- FR51: Epic 9 - Visualisation incidents check-in
- FR52: Epic 9 - Gestion incidents mode urgent (<30 min)
- FR53: Epic 9 - Visualisation dossiers complets
- FR54: Epic 9 - Suspension annonce/badge en cas de fraude
- FR55: Epic 9 - Remboursement locataire
- FR56: Epic 9 - Relogement locataire en cas d'incident
- FR57: Epic 9 - Génération alertes sync calendrier en échec
- FR58: Epic 9 - Traçage historique complet

## Epic List

### Epic 1: Authentification & Profils Utilisateurs
Les utilisateurs peuvent créer un compte, s'authentifier, compléter leur profil et passer la vérification KYC pour accéder à la plateforme.
**FRs couverts:** FR1, FR2, FR3, FR4, FR5, FR6

### Epic 2: Vérification Hôte & Système de Confiance
Les hôtes peuvent être vérifiés et obtenir un badge "Annonce vérifiée" pour gagner la confiance des locataires, différenciateur clé de la plateforme.
**FRs couverts:** FR7, FR8, FR9, FR10, FR11, FR12

### Epic 3: Création & Gestion d'Annonces
Les hôtes peuvent créer, compléter et publier des annonces de colocation avec photos, vidéos, règles et calendrier de disponibilité.
**FRs couverts:** FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR21

### Epic 4: Recherche & Découverte de Colocations
Les locataires peuvent rechercher, filtrer et découvrir des colocations qui correspondent à leurs critères (budget, localisation, vibes).
**FRs couverts:** FR24, FR25, FR26, FR27, FR28, FR29

### Epic 5: Réservation & Paiement avec Validation Propriétaire
Les locataires peuvent réserver une coloc avec préautorisation 25€, et les propriétaires peuvent valider la colocation pour déclencher la capture du paiement.
**FRs couverts:** FR30, FR31, FR32, FR33, FR34, FR35, FR36, FR59, FR60, FR61, FR62, FR63

### Epic 6: Communication & Notifications
Les utilisateurs peuvent communiquer via chat masqué et recevoir des notifications pour rester informés des événements importants.
**FRs couverts:** FR37, FR38, FR39, FR40, FR41, FR42, FR43, FR44

### Epic 7: Gestion des Demandes de Réservation
Les hôtes peuvent voir, accepter ou refuser les demandes de réservation reçues pour leurs annonces.
**FRs couverts:** FR22, FR23

### Epic 8: Check-in & Vérification d'Arrivée
Les locataires peuvent effectuer un check-in avec photo et GPS pour prouver leur arrivée, et signaler des problèmes si nécessaire.
**FRs couverts:** FR45, FR46, FR47, FR48, FR49

### Epic 9: Support & Opérations
Le support peut gérer les incidents, la fraude, et assurer la qualité de la plateforme via un back-office complet.
**FRs couverts:** FR50, FR51, FR52, FR53, FR54, FR55, FR56, FR57, FR58

---

## Epic 1: Authentification & Profils Utilisateurs

Les utilisateurs peuvent créer un compte, s'authentifier, compléter leur profil et passer la vérification KYC pour accéder à la plateforme.

### Story 1.1: Initialisation du projet Next.js

As a développeur,
I want initialiser le projet Next.js avec la stack technique complète,
So that j'ai une base solide pour développer l'application.

**Acceptance Criteria:**

**Given** un environnement de développement avec Node.js installé
**When** j'exécute `npx create-next-app@latest villa-first-v2 --typescript --tailwind --eslint --app --src-dir`
**Then** le projet Next.js est créé avec TypeScript, Tailwind CSS, ESLint et App Router
**And** la structure de dossiers suit le pattern App Router (`src/app/`, `src/components/`, `src/lib/`)
**And** les alias de chemins sont configurés (`@/*` pour imports)
**And** `npx shadcn@latest init` est exécuté pour configurer shadcn/ui
**And** `npm install @ducanh2912/next-pwa` est exécuté pour ajouter le support PWA
**And** `npx prisma init` est exécuté pour initialiser Prisma
**And** le fichier `.env` est créé avec les variables d'environnement de base

### Story 1.2: Création de compte utilisateur

As a utilisateur (locataire ou hôte),
I want créer un compte avec email et mot de passe,
So that je peux accéder à la plateforme et utiliser ses fonctionnalités.

**Acceptance Criteria:**

**Given** je suis sur la page d'inscription
**When** je saisis un email valide, un mot de passe (min 8 caractères), et je sélectionne mon type (locataire ou hôte)
**Then** un compte utilisateur est créé dans la base de données avec le modèle User
**And** l'email est stocké en format normalisé (lowercase)
**And** le mot de passe est hashé avec bcrypt/argon2 avant stockage
**And** le type d'utilisateur (tenant ou host) est enregistré
**And** un email de confirmation est envoyé (optionnel pour MVP)
**And** je suis redirigé vers la page de connexion ou le dashboard
**And** les erreurs de validation (email invalide, mot de passe trop court, email déjà utilisé) sont affichées clairement

**Requirements:** FR1

### Story 1.3: Authentification email/mot de passe

As a utilisateur,
I want me connecter avec mon email et mot de passe,
So que je peux accéder à mon compte et à mes fonctionnalités.

**Acceptance Criteria:**

**Given** j'ai un compte créé
**When** je saisis mon email et mon mot de passe corrects sur la page de connexion
**Then** je suis authentifié via NextAuth.js
**And** une session sécurisée est créée avec token JWT
**And** je suis redirigé vers mon dashboard (tenant ou host selon mon type)
**And** les erreurs d'authentification (email/mot de passe incorrect, compte inexistant) sont affichées clairement
**And** la session expire après une période d'inactivité configurée
**And** je peux me déconnecter depuis n'importe quelle page protégée

**Requirements:** FR2

### Story 1.4: Gestion du profil utilisateur

As a utilisateur,
I want gérer mes informations personnelles (nom, prénom, téléphone, photo),
So que mon profil est à jour et complet.

**Acceptance Criteria:**

**Given** je suis connecté
**When** j'accède à la page de mon profil
**Then** je peux voir mes informations actuelles (nom, prénom, email, téléphone, photo de profil)
**And** je peux modifier mon nom, prénom, téléphone
**And** je peux uploader une photo de profil (formats acceptés: JPG, PNG, max 5MB)
**And** la photo est redimensionnée et optimisée automatiquement
**And** les modifications sont sauvegardées dans la base de données
**And** un message de confirmation s'affiche après sauvegarde
**And** les erreurs de validation (format photo invalide, taille trop grande) sont affichées

**Requirements:** FR6

### Story 1.5: Onboarding locataire avec questionnaire vibes

As a locataire,
I want compléter un questionnaire sur mes préférences (vibes),
So que le système peut me proposer des colocations qui correspondent à mes attentes.

**Acceptance Criteria:**

**Given** je suis un locataire connecté qui n'a pas encore complété l'onboarding
**When** j'accède à mon dashboard pour la première fois
**Then** je suis invité à compléter le questionnaire vibes
**And** le questionnaire inclut des questions sur mes préférences (télétravail, yoga, calme, festif, sportif, etc.)
**And** je peux sélectionner plusieurs options pour chaque catégorie
**And** mes réponses sont sauvegardées dans le profil utilisateur (champ `vibesPreferences` ou table séparée)
**And** après complétion, je peux accéder aux fonctionnalités principales
**And** je peux modifier mes préférences vibes depuis mon profil plus tard

**Requirements:** FR3

### Story 1.6: Vérification KYC utilisateur

As a utilisateur,
I want compléter une vérification KYC (identité),
So que je peux accéder aux fonctionnalités nécessitant une vérification d'identité.

**Acceptance Criteria:**

**Given** je suis connecté
**When** j'accède à la page de vérification KYC (requise pour certaines actions)
**Then** je peux uploader une pièce d'identité (passeport, carte d'identité)
**And** le système valide le format du document (PDF, JPG, PNG, max 10MB)
**And** les données du document sont envoyées à un service tiers de vérification KYC (Stripe Identity, Onfido, etc.)
**And** le statut de vérification est enregistré dans la base de données (pending, verified, rejected)
**And** je reçois une notification quand la vérification est complétée
**And** je peux voir le statut de ma vérification dans mon profil
**And** les documents sont stockés de manière sécurisée (chiffrement AES-256)

**Requirements:** FR4

### Story 1.7: Stockage et gestion données KYC vérifiées

As a système,
I want stocker et gérer les données d'identité vérifiées,
So que je peux vérifier le statut KYC des utilisateurs et assurer la conformité.

**Acceptance Criteria:**

**Given** un utilisateur a complété la vérification KYC
**When** le service tiers confirme la vérification
**Then** le statut KYC est mis à jour dans la base de données (verified)
**And** les données vérifiées (nom, date de naissance, nationalité) sont stockées de manière sécurisée
**And** les documents originaux sont conservés selon les exigences légales (RGPD, législation Indonésie)
**And** seuls les utilisateurs avec KYC vérifié peuvent accéder aux fonctionnalités nécessitant vérification
**And** un audit log est créé pour chaque changement de statut KYC
**And** les données peuvent être supprimées sur demande utilisateur (droit à l'oubli RGPD)

**Requirements:** FR5

---

## Epic 2: Vérification Hôte & Système de Confiance

Les hôtes peuvent être vérifiés et obtenir un badge "Annonce vérifiée" pour gagner la confiance des locataires, différenciateur clé de la plateforme.

### Story 2.1: Upload documents titre de propriété ou mandat par hôte

As a hôte,
I want uploader mes documents de titre de propriété ou mandat,
So que je peux demander la vérification de mon annonce et obtenir le badge vérifié.

**Acceptance Criteria:**

**Given** je suis un hôte connecté avec KYC vérifié
**When** j'accède à la page de vérification de mon annonce
**Then** je peux uploader un document de titre de propriété ou mandat (PDF, JPG, PNG, max 10MB)
**And** le système valide le format et la taille du document
**And** le document est stocké de manière sécurisée (chiffrement AES-256)
**And** une demande de vérification est créée avec statut "pending"
**And** je reçois une confirmation que ma demande a été soumise
**And** je peux voir le statut de ma demande de vérification (pending, in_review, approved, rejected)
**And** les erreurs de validation (format invalide, taille trop grande) sont affichées clairement

**Requirements:** FR7

### Story 2.2: Affichage badge "Annonce vérifiée" pour annonces vérifiées

As a locataire,
I want voir un badge "Annonce vérifiée" sur les annonces vérifiées,
So que je peux identifier rapidement les annonces de confiance.

**Acceptance Criteria:**

**Given** une annonce a été vérifiée par le support
**When** je consulte la liste des annonces ou le détail d'une annonce
**Then** un badge "Annonce vérifiée" (✓ Annonce vérifiée) est affiché de manière visible
**And** le badge utilise le composant VerifiedBadge avec les styles définis dans le design system
**And** le badge est accessible (ARIA labels, contraste 4.5:1 minimum)
**And** au clic sur le badge, je peux voir les détails de la vérification (date, documents vérifiés)
**And** le badge n'est affiché que si l'annonce a le statut "verified" dans la base de données

**Requirements:** FR8

### Story 2.3: Interface support pour vérification manuelle titres/mandats

As a support,
I want accéder à une interface pour vérifier manuellement les titres/mandats des hôtes,
So que je peux examiner les documents et prendre une décision de vérification.

**Acceptance Criteria:**

**Given** je suis un utilisateur support connecté
**When** j'accède au back-office de vérification
**Then** je vois une liste des demandes de vérification en attente (statut "pending")
**And** pour chaque demande, je peux voir les informations hôte (nom, email, KYC status)
**And** je peux télécharger et visualiser les documents de titre de propriété/mandat uploadés
**And** je peux voir l'historique des vérifications précédentes pour cet hôte
**And** l'interface est accessible uniquement aux utilisateurs avec rôle "support"
**And** toutes les actions sont tracées dans les audit logs

**Requirements:** FR9

### Story 2.4: Approbation/rejet demande de vérification par support

As a support,
I want approuver ou rejeter une demande de vérification,
So que les hôtes peuvent obtenir leur badge vérifié ou comprendre pourquoi leur demande est rejetée.

**Acceptance Criteria:**

**Given** je suis support et j'ai examiné les documents d'un hôte
**When** j'approuve la demande de vérification
**Then** le statut de la vérification passe à "approved"
**And** le badge "Annonce vérifiée" est activé pour toutes les annonces de cet hôte
**And** l'hôte reçoit une notification de confirmation
**And** un audit log est créé avec l'action, l'utilisateur support, et la date
**When** je rejette la demande de vérification
**Then** le statut passe à "rejected"
**And** je dois fournir une raison de rejet (champ obligatoire)
**And** l'hôte reçoit une notification avec la raison du rejet
**And** l'hôte peut soumettre une nouvelle demande après correction
**And** un audit log est créé avec la raison du rejet

**Requirements:** FR10

### Story 2.5: Suspension/révocation badge vérifié en cas de fraude

As a support,
I want suspendre ou révoquer un badge vérifié en cas de fraude détectée,
So que la confiance de la plateforme est préservée et les locataires sont protégés.

**Acceptance Criteria:**

**Given** je suis support et j'ai détecté une fraude (documents falsifiés, annonce frauduleuse, etc.)
**When** je suspens ou révoque le badge vérifié d'un hôte
**Then** le badge "Annonce vérifiée" est immédiatement retiré de toutes les annonces de cet hôte
**And** le statut de vérification passe à "suspended" ou "revoked"
**And** je dois fournir une raison de suspension/révocation (champ obligatoire)
**And** l'hôte reçoit une notification de suspension/révocation avec la raison
**And** toutes les annonces actives de cet hôte sont marquées comme non vérifiées
**And** les réservations en cours sont notifiées (si applicable)
**And** un audit log détaillé est créé avec toutes les preuves de fraude
**And** l'hôte peut contester la décision via un processus d'appel (futur)

**Requirements:** FR11

### Story 2.6: Différenciation visuelle annonces vérifiées vs non vérifiées

As a locataire,
I want voir clairement la différence entre annonces vérifiées et non vérifiées,
So que je peux faire un choix éclairé basé sur le niveau de confiance.

**Acceptance Criteria:**

**Given** je consulte la liste des annonces
**When** je vois des annonces vérifiées et non vérifiées
**Then** les annonces vérifiées affichent le badge "Annonce vérifiée" de manière proéminente
**And** les annonces non vérifiées n'affichent pas de badge ou affichent un indicateur "Non vérifiée" (optionnel)
**And** la différence visuelle est claire (couleurs, icônes, positionnement selon design system)
**And** je peux filtrer les annonces par statut de vérification (vérifiées uniquement, toutes)
**And** dans les résultats de recherche, les annonces vérifiées peuvent être priorisées (optionnel)
**And** la différenciation est cohérente sur toutes les pages (liste, détail, carte)

**Requirements:** FR12

---

## Epic 3: Création & Gestion d'Annonces

Les hôtes peuvent créer, compléter et publier des annonces de colocation avec photos, vidéos, règles et calendrier de disponibilité.

### Story 3.1: Création d'annonce de coloc par hôte

As a hôte,
I want créer une nouvelle annonce de colocation,
So que je peux proposer ma villa/coloc aux locataires potentiels.

**Acceptance Criteria:**

**Given** je suis un hôte connecté avec KYC vérifié
**When** j'accède à la page de création d'annonce
**Then** je peux saisir les informations de base (titre, description, adresse, nombre de places, type de coloc)
**And** les champs obligatoires sont validés (titre, description, adresse, nombre de places)
**And** une annonce est créée dans la base de données avec statut "draft"
**And** je suis redirigé vers la page d'édition de l'annonce pour compléter les détails
**And** l'annonce est liée à mon compte utilisateur (userId)
**And** les erreurs de validation sont affichées clairement

**Requirements:** FR13

### Story 3.2: Upload photos par catégorie pour annonce

As a hôte,
I want uploader des photos par catégorie (cuisine, chambres, SDB, extérieurs),
So que les locataires peuvent voir tous les aspects de ma coloc.

**Acceptance Criteria:**

**Given** j'ai créé une annonce (même en draft)
**When** j'accède à la section photos de mon annonce
**Then** je peux uploader des photos organisées par catégorie (cuisine, chambres, SDB, extérieurs)
**And** chaque catégorie accepte plusieurs photos (min 1 par catégorie pour complétude)
**And** les photos sont validées (formats: JPG, PNG, max 10MB par photo)
**And** les photos sont redimensionnées et optimisées automatiquement (WebP pour performance)
**And** les photos sont stockées dans un service de stockage (S3, Cloudinary, ou équivalent)
**And** je peux réorganiser l'ordre des photos dans chaque catégorie
**And** je peux supprimer des photos uploadées
**And** un aperçu des photos est affiché avec indication de la catégorie

**Requirements:** FR14

### Story 3.3: Upload vidéo optionnelle pour annonce

As a hôte,
I want uploader une vidéo optionnelle pour mon annonce,
So que je peux donner une meilleure vue d'ensemble de ma coloc aux locataires.

**Acceptance Criteria:**

**Given** j'ai créé une annonce
**When** j'accède à la section vidéo de mon annonce
**Then** je peux uploader une vidéo (formats: MP4, MOV, max 100MB)
**And** la vidéo est validée (format et taille)
**And** la vidéo est encodée/optimisée pour le web (si nécessaire)
**And** la vidéo est stockée dans un service de stockage
**And** un aperçu/lecteur vidéo est affiché dans l'interface
**And** je peux supprimer la vidéo si je change d'avis
**And** la vidéo est optionnelle (pas de blocage si absente)

**Requirements:** FR15

### Story 3.4: Calcul score de complétude d'annonce

As a système,
I want calculer un score de complétude pour chaque annonce,
So que je peux déterminer si l'annonce est suffisamment complète pour publication.

**Acceptance Criteria:**

**Given** une annonce existe (même en draft)
**When** le système évalue la complétude de l'annonce
**Then** un score de complétude est calculé basé sur:
  - Informations de base (titre, description, adresse): 30%
  - Photos par catégorie (cuisine, chambres, SDB, extérieurs): 40% (10% par catégorie)
  - Règles et charte: 15%
  - Calendrier de disponibilité: 10%
  - Prix défini: 5%
**And** le score est affiché à l'hôte (ex: "Complétude: 75%")
**And** le score est mis à jour en temps réel quand l'hôte ajoute/modifie des informations
**And** le score minimum requis pour publication est configurable (ex: 80%)

**Requirements:** FR16

### Story 3.5: Blocage publication si score complétude insuffisant

As a système,
I want bloquer la publication d'une annonce si le score de complétude est insuffisant,
So que seules les annonces complètes sont publiées et visibles aux locataires.

**Acceptance Criteria:**

**Given** un hôte essaie de publier son annonce
**When** le score de complétude est inférieur au minimum requis (ex: <80%)
**Then** la publication est bloquée
**And** un message clair indique le score actuel et le minimum requis
**And** une liste des éléments manquants est affichée pour guider l'hôte
**And** l'hôte peut cliquer sur chaque élément manquant pour être redirigé vers la section correspondante
**And** l'annonce reste en statut "draft" jusqu'à ce que le score soit suffisant
**When** le score atteint le minimum requis
**Then** l'hôte peut publier l'annonce

**Requirements:** FR17

### Story 3.6: Définition règles et charte de la coloc

As a hôte,
I want définir les règles et la charte de ma coloc,
So que les locataires comprennent les attentes et le style de vie de la coloc.

**Acceptance Criteria:**

**Given** j'ai créé une annonce
**When** j'accède à la section règles et charte
**Then** je peux définir les règles de la coloc (heures de calme, fumeurs/non-fumeurs, animaux, etc.)
**And** je peux rédiger une charte de vie en coloc (texte libre)
**And** les règles peuvent être sélectionnées via des options prédéfinies ou saisies librement
**And** les modifications sont sauvegardées automatiquement
**And** les règles et charte sont visibles sur la page de détail de l'annonce pour les locataires
**And** les règles sont prises en compte dans le calcul du score de complétude

**Requirements:** FR18

### Story 3.7: Gestion disponibilité via calendrier interne

As a hôte,
I want gérer la disponibilité de ma coloc via un calendrier interne,
So que je peux indiquer quelles dates sont disponibles pour les réservations.

**Acceptance Criteria:**

**Given** j'ai créé une annonce
**When** j'accède à la section calendrier de mon annonce
**Then** je peux voir un calendrier mensuel avec les dates disponibles/indisponibles
**And** je peux marquer des dates comme disponibles ou indisponibles
**And** je peux définir des périodes de disponibilité (plages de dates)
**And** je peux voir les réservations existantes sur le calendrier
**And** les dates avec réservations sont automatiquement marquées comme indisponibles
**And** les modifications sont sauvegardées en temps réel
**And** le calendrier est synchronisé avec les réservations (quand une réservation est créée, la date devient indisponible)

**Requirements:** FR19

### Story 3.8: Synchronisation automatique calendrier (rafraîchissement 30 min)

As a système,
I want synchroniser automatiquement le calendrier toutes les 30 minutes,
So que la disponibilité affichée est toujours à jour.

**Acceptance Criteria:**

**Given** un calendrier d'annonce existe
**When** le système exécute la synchronisation automatique
**Then** le calendrier est rafraîchi toutes les 30 minutes
**And** les réservations récentes sont reflétées dans le calendrier
**And** les dates modifiées manuellement par l'hôte sont préservées
**And** un log de synchronisation est créé pour traçabilité
**And** en cas d'échec de synchronisation, une alerte est générée (pour support)
**And** l'hôte peut forcer une synchronisation manuelle si nécessaire

**Requirements:** FR20

### Story 3.9: Définition et modification des prix

As a hôte,
I want définir et modifier les prix de ma coloc,
So que les locataires connaissent le coût et je peux ajuster selon la demande.

**Acceptance Criteria:**

**Given** j'ai créé une annonce
**When** j'accède à la section prix de mon annonce
**Then** je peux définir le prix par place (en euros)
**And** je peux définir des prix différents selon les périodes (saison haute/basse, optionnel)
**And** les prix sont validés (montant positif, format numérique)
**And** je peux modifier les prix à tout moment
**And** si je modifie le prix après qu'une réservation soit en attente, le système bloque la réservation (FR31)
**And** les prix sont affichés clairement sur la page de détail de l'annonce
**And** les prix sont inclus dans le calcul du score de complétude

**Requirements:** FR21

---

## Epic 4: Recherche & Découverte de Colocations

Les locataires peuvent rechercher, filtrer et découvrir des colocations qui correspondent à leurs critères (budget, localisation, vibes).

### Story 4.1: Recherche de colocations par localisation

As a locataire,
I want rechercher des colocations par localisation,
So que je peux trouver des colocs dans la zone qui m'intéresse.

**Acceptance Criteria:**

**Given** je suis sur la page de recherche/liste des annonces
**When** je saisis une localisation (ville, quartier, zone comme "Canggu", "Ubud", etc.)
**Then** les annonces correspondant à cette localisation sont affichées
**And** la recherche fonctionne avec recherche textuelle sur le champ adresse/localisation
**And** les résultats sont triés par pertinence (annonces vérifiées en premier, puis par score de complétude)
**And** le nombre de résultats est affiché
**And** si aucun résultat, un message clair est affiché avec suggestions
**And** la recherche est performante (< 1 seconde selon NFR Performance)

**Requirements:** FR24

### Story 4.2: Filtrage des annonces par budget

As a locataire,
I want filtrer les annonces par budget,
So que je ne vois que les colocs dans ma fourchette de prix.

**Acceptance Criteria:**

**Given** je suis sur la page de recherche/liste des annonces
**When** je définis une fourchette de budget (min et max en euros)
**Then** seules les annonces dont le prix par place est dans cette fourchette sont affichées
**And** le filtre peut être appliqué via un slider ou des champs numériques
**And** les résultats sont mis à jour en temps réel quand je modifie le budget
**And** le nombre de résultats est mis à jour dynamiquement
**And** les prix affichés respectent le filtre appliqué

**Requirements:** FR25

### Story 4.3: Filtrage des annonces par vibes

As a locataire,
I want filtrer les annonces par vibes (critères de matching),
So que je trouve des colocs qui correspondent à mon style de vie.

**Acceptance Criteria:**

**Given** je suis sur la page de recherche/liste des annonces
**When** je sélectionne des critères de vibes (télétravail, yoga, calme, festif, sportif, etc.)
**Then** les annonces correspondant à ces vibes sont affichées
**And** je peux sélectionner plusieurs vibes simultanément (multi-select)
**And** le matching se fait entre mes préférences vibes (si définies dans mon profil) et les vibes de l'annonce
**And** les résultats sont mis à jour en temps réel
**And** les vibes correspondants sont mis en évidence sur chaque annonce
**And** si aucun match, un message suggère d'ajuster les filtres

**Requirements:** FR26

### Story 4.4: Affichage carte de confiance avec géolocalisation

As a locataire,
I want voir une carte de confiance avec géolocalisation des annonces,
So que je peux visualiser la localisation et la proximité des colocs.

**Acceptance Criteria:**

**Given** je suis sur la page de recherche/liste des annonces
**When** j'accède à la vue carte
**Then** une carte interactive affiche les annonces avec leurs positions géographiques
**And** chaque annonce est représentée par un marqueur sur la carte
**And** les annonces vérifiées ont un marqueur distinct (couleur/icône différente)
**And** au clic sur un marqueur, je vois un aperçu de l'annonce (titre, prix, photo principale)
**And** la géolocalisation utilise l'API Browser (PWA) avec précision acceptable pour MVP
**And** je peux basculer entre vue liste et vue carte
**And** la carte est responsive et fonctionne sur mobile

**Requirements:** FR27

### Story 4.5: Affichage annonces correspondant aux critères de recherche

As a système,
I want afficher les annonces correspondant aux critères de recherche,
So que les locataires voient uniquement les résultats pertinents.

**Acceptance Criteria:**

**Given** un locataire applique des critères de recherche (localisation, budget, vibes)
**When** le système exécute la recherche
**Then** seules les annonces publiées et correspondant à tous les critères sont affichées
**And** les annonces sont triées par pertinence (vérifiées en premier, puis score complétude, puis date)
**And** les résultats sont paginés (ex: 20 annonces par page)
**And** le nombre total de résultats est affiché
**And** les critères appliqués sont visibles et peuvent être modifiés/supprimés
**And** la recherche est performante (< 1 seconde selon NFR Performance)
**And** les annonces non publiées (draft) ne sont jamais affichées

**Requirements:** FR28

### Story 4.6: Comparaison de plusieurs annonces

As a locataire,
I want comparer plusieurs annonces (photos, vidéos, détails),
So que je peux faire un choix éclairé entre différentes options.

**Acceptance Criteria:**

**Given** je suis sur la page de recherche/liste des annonces
**When** je sélectionne plusieurs annonces pour comparaison
**Then** je peux voir côte à côte les informations clés (photos, prix, localisation, vibes, badge vérifié)
**And** je peux ajouter/supprimer des annonces de la comparaison
**And** la vue de comparaison est accessible depuis la liste ou depuis le détail d'une annonce
**And** je peux accéder au détail complet de chaque annonce depuis la vue comparaison
**And** la comparaison est sauvegardée temporairement (session) pour que je puisse y revenir
**And** la vue comparaison est responsive et fonctionne sur mobile (scroll horizontal si nécessaire)

**Requirements:** FR29

---

## Epic 5: Réservation & Paiement avec Validation Propriétaire

Les locataires peuvent réserver une coloc avec préautorisation 25€, et les propriétaires peuvent valider la colocation pour déclencher la capture du paiement.

### Story 5.1: Réservation d'une coloc disponible

As a locataire,
I want réserver une coloc disponible,
So que je peux sécuriser ma place dans la colocation.

**Acceptance Criteria:**

**Given** je suis un locataire connecté avec KYC vérifié
**When** je consulte le détail d'une annonce disponible
**Then** je peux cliquer sur "Réserver" pour une date disponible
**And** je dois sélectionner les dates de séjour (check-in, check-out)
**And** le système vérifie que les dates sont disponibles dans le calendrier
**And** une réservation est créée avec statut "pending" (en attente de validation)
**And** la réservation bloque les dates dans le calendrier de l'annonce
**And** je reçois une confirmation de réservation en attente
**And** l'hôte est notifié de la nouvelle demande de réservation
**And** si les dates ne sont plus disponibles, un message d'erreur clair est affiché

**Requirements:** FR30

### Story 5.2: Blocage réservation si prix modifié sans revalidation

As a système,
I want bloquer une réservation si le prix a été modifié après la création de la réservation,
So que les locataires ne sont pas facturés à un prix différent de celui affiché lors de la réservation.

**Acceptance Criteria:**

**Given** une réservation est en attente (statut "pending")
**When** l'hôte modifie le prix de l'annonce
**Then** toutes les réservations en attente pour cette annonce sont bloquées
**And** le statut de la réservation passe à "price_changed"
**And** le locataire est notifié que le prix a changé et doit confirmer la nouvelle réservation
**And** la préautorisation existante est annulée (si déjà créée)
**And** le locataire doit créer une nouvelle réservation avec le nouveau prix
**And** les réservations confirmées (statut "confirmed") ne sont pas affectées par les changements de prix

**Requirements:** FR31

### Story 5.3: Préautorisation 25€ pour réserver une place

As a locataire,
I want effectuer une préautorisation de 25€ lors de la réservation,
So que je peux sécuriser ma réservation sans être débité immédiatement.

**Acceptance Criteria:**

**Given** j'ai créé une réservation pour une coloc
**When** je procède au paiement
**Then** une préautorisation de 25€ est créée via Stripe
**And** la préautorisation est enregistrée dans la base de données avec statut "pending"
**And** aucun débit n'est effectué sur ma carte (préautorisation uniquement)
**And** je reçois une confirmation que la préautorisation a été effectuée
**And** la réservation est liée à la préautorisation
**And** les détails de la préautorisation (montant, date, statut) sont visibles dans ma réservation
**And** en cas d'échec de préautorisation, un message d'erreur clair est affiché avec possibilité de réessayer

**Requirements:** FR32

### Story 5.4: Préautorisation sans débit tant que colocation non validée

As a système,
I want maintenir la préautorisation sans débit tant que la colocation n'est pas validée,
So que les locataires ne sont pas débités avant confirmation par le propriétaire.

**Acceptance Criteria:**

**Given** une préautorisation de 25€ a été créée pour une réservation
**When** la colocation n'est pas encore validée par le propriétaire
**Then** aucun débit n'est effectué sur la carte du locataire
**And** la préautorisation reste en statut "pending" (pas encore capturée)
**And** le montant est réservé mais non débité (hold sur la carte)
**And** la préautorisation expire automatiquement après un délai configuré si non validée (FR61)
**And** le locataire peut voir le statut "En attente de validation" dans sa réservation

**Requirements:** FR33

### Story 5.5: Définition règles de validation par propriétaire

As a propriétaire,
I want définir mes règles de validation pour les colocations,
So que le système peut valider automatiquement ou nécessiter ma validation manuelle.

**Acceptance Criteria:**

**Given** je suis un propriétaire avec des annonces
**When** j'accède aux paramètres de validation
**Then** je peux définir mes règles de validation:
  - Villa complète uniquement (validation automatique si toutes les places réservées)
  - Validation partielle possible (validation automatique si X% des places réservées)
  - Validation manuelle toujours requise
**And** les règles sont sauvegardées par annonce ou globalement pour toutes mes annonces
**And** je peux modifier les règles à tout moment
**And** les règles s'appliquent aux nouvelles réservations (pas aux réservations en cours)
**And** les règles sont visibles dans l'interface de gestion des réservations

**Requirements:** FR59

### Story 5.6: Validation manuelle colocation par propriétaire

As a propriétaire,
I want valider manuellement une colocation à tout moment,
So que je peux déclencher la capture du paiement quand je le souhaite.

**Acceptance Criteria:**

**Given** je suis un propriétaire et j'ai des réservations en attente
**When** j'accède à la page de gestion des réservations
**Then** je peux voir toutes les réservations en attente pour mes annonces
**And** je peux valider manuellement une colocation (indépendamment des règles définies)
**And** quand je valide une colocation, toutes les préautorisations des locataires actifs sont capturées (FR62)
**And** le statut de la colocation passe à "validated"
**And** les locataires sont notifiés que leur paiement a été capturé
**And** un audit log est créé avec l'action de validation
**And** je peux valider même si les règles automatiques ne sont pas remplies

**Requirements:** FR60

### Story 5.7: Capture préautorisations lors validation colocation

As a système,
I want capturer les préautorisations de tous les locataires actifs lors de la validation,
So que les paiements sont effectués uniquement après validation explicite.

**Acceptance Criteria:**

**Given** un propriétaire valide une colocation
**When** la validation est confirmée
**Then** toutes les préautorisations de 25€ des locataires avec réservation active sont capturées via Stripe
**And** les paiements sont effectués (débit réel sur les cartes)
**And** le statut des préautorisations passe à "captured"
**And** le statut des réservations passe à "confirmed"
**And** les locataires reçoivent une notification de confirmation de paiement
**And** en cas d'échec de capture (carte expirée, fonds insuffisants), le locataire est notifié et doit mettre à jour sa carte
**And** un audit log est créé pour chaque capture réussie ou échouée

**Requirements:** FR62, FR34

### Story 5.8: Expiration automatique préautorisations si colocation non validée

As a système,
I want expirer automatiquement les préautorisations si la colocation n'est pas validée,
So que les locataires ne restent pas bloqués indéfiniment sans débit.

**Acceptance Criteria:**

**Given** une préautorisation existe pour une réservation en attente
**When** la colocation n'est pas validée dans le délai configuré (ex: 7 jours)
**Then** la préautorisation expire automatiquement
**And** aucun débit n'est effectué (la préautorisation est simplement annulée)
**And** le statut de la préautorisation passe à "expired"
**And** le statut de la réservation passe à "expired"
**And** les dates sont libérées dans le calendrier de l'annonce
**And** le locataire est notifié de l'expiration
**And** l'hôte est notifié qu'une réservation a expiré
**And** le locataire peut créer une nouvelle réservation si souhaité

**Requirements:** FR61, FR63

### Story 5.9: Visualisation réservations confirmées

As a locataire,
I want voir mes réservations confirmées,
So que je peux accéder aux informations de ma coloc et préparer mon arrivée.

**Acceptance Criteria:**

**Given** je suis un locataire connecté
**When** j'accède à la page "Mes réservations"
**Then** je peux voir toutes mes réservations avec leur statut (pending, confirmed, expired, cancelled)
**And** pour les réservations confirmées, je peux voir:
  - Détails de l'annonce (titre, adresse, photos)
  - Dates de séjour (check-in, check-out)
  - Montant payé (25€)
  - Statut de paiement
  - Informations de contact de l'hôte
**And** je peux accéder aux informations de check-in (adresse, codes, contact) une fois confirmée
**And** les réservations sont triées par date (prochaines en premier)
**And** je peux filtrer par statut si nécessaire

**Requirements:** FR35

### Story 5.10: Gestion paiements en mode hors ligne (post-confirmation)

As a locataire,
I want accéder aux informations de paiement et réservation en mode hors ligne,
So que je peux consulter mes réservations même sans connexion internet.

**Acceptance Criteria:**

**Given** j'ai une réservation confirmée
**When** je suis en mode hors ligne (pas de connexion internet)
**Then** je peux accéder aux informations de ma réservation confirmée (données préchargées)
**And** je peux voir les détails de paiement (montant, date, statut)
**And** je peux accéder aux informations de check-in (adresse, codes, contact hôte)
**And** les données sont mises en cache via service worker (PWA)
**And** si je tente un paiement hors ligne, le système attend la reconnexion puis procède au paiement
**And** les nouvelles réservations ne peuvent pas être créées hors ligne (nécessite connexion)

**Requirements:** FR36

---

## Epic 6: Communication & Notifications

Les utilisateurs peuvent communiquer via chat masqué et recevoir des notifications pour rester informés.

### Story 6.1: Communication via chat masqué

As a utilisateur (locataire ou hôte),
I want communiquer via un chat masqué avec l'autre partie,
So que je peux poser des questions et échanger en toute sécurité sans exposer mes coordonnées.

**Acceptance Criteria:**

**Given** je suis connecté et j'ai une réservation active ou je suis hôte avec des demandes
**When** j'accède à la page de chat pour une annonce/réservation
**Then** je peux envoyer des messages texte via l'interface de chat
**And** les messages sont masqués (les emails/téléphones ne sont pas visibles)
**And** les messages sont stockés dans la base de données avec timestamp
**And** les messages sont affichés en temps réel via Socket.IO
**And** je peux voir l'historique des messages précédents
**And** les messages sont liés à l'annonce/réservation spécifique
**And** le chat n'est accessible qu'après réservation (pour locataire) ou pour les demandes reçues (pour hôte)

**Requirements:** FR37

### Story 6.2: Centralisation échanges dans chat masqué

As a système,
I want centraliser tous les échanges dans le chat masqué,
So que toutes les communications sont tracées et protégées par la plateforme.

**Acceptance Criteria:**

**Given** des utilisateurs communiquent via le chat
**When** des messages sont envoyés
**Then** tous les messages sont stockés dans la base de données (table Chat/Message)
**And** tous les échanges sont centralisés (pas de communication externe requise)
**And** les messages sont liés à l'annonce et aux utilisateurs participants
**And** un audit log est créé pour chaque message (traçabilité complète)
**And** les messages peuvent être consultés par le support en cas d'incident
**And** les utilisateurs ne peuvent pas contourner le chat pour communiquer (pas d'exposition d'emails/téléphones)

**Requirements:** FR38

### Story 6.3: Notifications push sur mobile

As a utilisateur,
I want recevoir des notifications push sur mobile,
So que je suis informé des événements importants même quand l'app n'est pas ouverte.

**Acceptance Criteria:**

**Given** je suis un utilisateur avec l'app installée (PWA)
**When** un événement important se produit (nouvelle demande, message, validation colocation, etc.)
**Then** je reçois une notification push sur mon mobile
**And** la notification affiche un titre et un message clair
**And** au clic sur la notification, je suis redirigé vers la page pertinente dans l'app
**And** les notifications push fonctionnent via le service natif du navigateur (PWA)
**And** je peux activer/désactiver les notifications push dans mes préférences
**And** les notifications sont envoyées uniquement si j'ai autorisé les notifications push

**Requirements:** FR39

### Story 6.4: Notifications email optionnelles

As a utilisateur,
I want recevoir des notifications par email (optionnel),
So que je peux être informé même si je ne suis pas sur l'app.

**Acceptance Criteria:**

**Given** je suis un utilisateur connecté
**When** j'active les notifications email dans mes préférences
**Then** je reçois des emails pour les événements importants (nouvelle demande, message, validation, etc.)
**And** les emails sont envoyés via un service tiers (SendGrid, Mailgun, etc.)
**And** les emails ont un design professionnel avec les informations clés
**And** les emails contiennent des liens vers l'app pour actions rapides
**And** je peux désactiver les notifications email à tout moment
**And** les emails sont optionnels (pas obligatoires pour utiliser la plateforme)

**Requirements:** FR40

### Story 6.5: Notifications SMS optionnelles

As a utilisateur,
I want recevoir des notifications par SMS (optionnel),
So que je peux être informé rapidement des événements critiques.

**Acceptance Criteria:**

**Given** je suis un utilisateur connecté
**When** j'active les notifications SMS dans mes préférences et j'ai fourni mon numéro de téléphone
**Then** je reçois des SMS pour les événements critiques (validation colocation, problème check-in, etc.)
**And** les SMS sont envoyés via un service tiers (Twilio, etc.)
**And** les SMS sont concis et contiennent les informations essentielles
**And** je peux désactiver les notifications SMS à tout moment
**And** les SMS sont optionnels (pas obligatoires)
**And** les SMS sont facturés séparément si nécessaire (selon modèle économique)

**Requirements:** FR41

### Story 6.6: Configuration préférences de notifications

As a utilisateur,
I want configurer mes préférences de notifications,
So que je contrôle quels types de notifications je reçois et par quels canaux.

**Acceptance Criteria:**

**Given** je suis un utilisateur connecté
**When** j'accède à la page de préférences de notifications
**Then** je peux activer/désactiver les notifications push, email, et SMS indépendamment
**And** je peux choisir les types d'événements pour lesquels je veux être notifié:
  - Nouvelles demandes de réservation
  - Nouveaux messages
  - Validation de colocation
  - Problèmes check-in
  - Annonces correspondant à mes critères
  - Places libérées dans colocs suivies
**And** mes préférences sont sauvegardées dans mon profil
**And** les préférences s'appliquent immédiatement après sauvegarde
**And** je peux voir un aperçu de mes préférences actuelles

**Requirements:** FR42

### Story 6.7: Notifications quand annonce correspond aux critères

As a locataire,
I want recevoir une notification quand une nouvelle annonce correspond à mes critères,
So que je peux découvrir rapidement des colocs qui m'intéressent.

**Acceptance Criteria:**

**Given** je suis un locataire avec des préférences définies (budget, localisation, vibes)
**When** une nouvelle annonce est publiée qui correspond à mes critères
**Then** je reçois une notification (push/email/SMS selon mes préférences)
**And** la notification contient un aperçu de l'annonce (titre, localisation, prix, photo)
**And** au clic, je suis redirigé vers le détail de l'annonce
**And** le matching se fait automatiquement en arrière-plan
**And** je ne reçois pas de doublons si plusieurs annonces correspondent simultanément (regroupement)
**And** je peux désactiver ce type de notification dans mes préférences

**Requirements:** FR43

### Story 6.8: Notifications quand place se libère dans coloc suivie

As a locataire,
I want recevoir une notification quand une place se libère dans une coloc que je suis,
So que je peux réserver rapidement si une place devient disponible.

**Acceptance Criteria:**

**Given** je suis un locataire et j'ai marqué une annonce comme "suivie" ou j'ai tenté de réserver une coloc complète
**When** une place se libère dans cette coloc (annulation, modification calendrier)
**Then** je reçois une notification (push/email/SMS selon mes préférences)
**And** la notification indique qu'une place est disponible
**And** au clic, je suis redirigé vers l'annonce pour réserver
**And** la notification est envoyée uniquement si j'ai activé ce type de notification
**And** je ne reçois pas de notification si la place est déjà réservée par quelqu'un d'autre

**Requirements:** FR44

---

## Epic 7: Gestion des Demandes de Réservation

Les hôtes peuvent voir, accepter ou refuser les demandes de réservation reçues pour leurs annonces.

### Story 7.1: Visualisation demandes de réservation reçues

As a hôte,
I want voir les demandes de réservation reçues pour mes annonces,
So que je peux gérer les demandes et décider lesquelles accepter.

**Acceptance Criteria:**

**Given** je suis un hôte connecté avec des annonces publiées
**When** j'accède à la page de gestion des réservations
**Then** je peux voir toutes les demandes de réservation reçues pour mes annonces
**And** pour chaque demande, je peux voir:
  - Informations locataire (nom, photo profil, statut KYC)
  - Dates de séjour demandées (check-in, check-out)
  - Nombre de places demandées
  - Montant de la préautorisation (25€)
  - Date de la demande
  - Statut (pending, accepted, rejected, expired)
**And** les demandes sont triées par date (plus récentes en premier)
**And** je peux filtrer par annonce, par statut, ou par date
**And** je peux accéder au profil complet du locataire depuis la demande

**Requirements:** FR22

### Story 7.2: Acceptation ou refus demande de réservation

As a hôte,
I want accepter ou refuser une demande de réservation,
So que je peux contrôler qui réserve ma coloc.

**Acceptance Criteria:**

**Given** je vois une demande de réservation en attente (statut "pending")
**When** j'accepte la demande
**Then** le statut de la réservation passe à "accepted"
**And** les dates sont confirmées comme réservées dans le calendrier
**And** le locataire est notifié de l'acceptation
**And** la réservation reste en attente de validation de colocation (si règles de validation requises)
**When** je refuse la demande
**Then** le statut passe à "rejected"
**And** je dois fournir une raison de refus (optionnel mais recommandé)
**And** le locataire est notifié du refus
**And** les dates sont libérées dans le calendrier
**And** la préautorisation est annulée/expirée
**And** un audit log est créé pour chaque action (acceptation/refus)

**Requirements:** FR23

---

## Epic 8: Check-in & Vérification d'Arrivée

Les locataires peuvent effectuer un check-in avec photo et GPS pour prouver leur arrivée, et signaler des problèmes si nécessaire.

### Story 8.1: Check-in avec photo obligatoire

As a locataire,
I want effectuer un check-in avec photo obligatoire,
So que je peux prouver mon arrivée à la coloc.

**Acceptance Criteria:**

**Given** j'ai une réservation confirmée et je suis arrivé à la coloc
**When** j'accède à la page de check-in pour ma réservation
**Then** je dois prendre ou uploader une photo pour le check-in
**And** la photo est validée (format JPG/PNG, max 10MB)
**And** la photo est stockée de manière sécurisée dans la base de données
**And** le check-in est enregistré avec timestamp
**And** l'hôte est notifié du check-in effectué
**And** je ne peux pas compléter le check-in sans photo (champ obligatoire)
**And** la photo est visible dans l'historique de la réservation

**Requirements:** FR45

### Story 8.2: Check-in avec géolocalisation GPS

As a locataire,
I want effectuer un check-in avec géolocalisation GPS,
So que ma position est enregistrée pour prouver mon arrivée à l'adresse correcte.

**Acceptance Criteria:**

**Given** j'ai une réservation confirmée
**When** j'effectue le check-in
**Then** le système demande l'autorisation de géolocalisation (si pas déjà accordée)
**And** ma position GPS est capturée lors du check-in
**And** les coordonnées GPS (latitude, longitude) sont stockées avec le check-in
**And** la distance entre ma position et l'adresse de l'annonce est calculée
**And** si la distance est trop importante (>500m), un avertissement est affiché (mais le check-in peut être confirmé)
**And** la géolocalisation utilise l'API Browser (PWA) avec précision acceptable pour MVP
**And** en cas d'échec de géolocalisation, le check-in peut quand même être complété avec photo uniquement

**Requirements:** FR46

### Story 8.3: Stockage preuves de check-in (photo + GPS)

As a système,
I want stocker les preuves de check-in (photo + GPS),
So que je peux tracer les arrivées et résoudre les litiges si nécessaire.

**Acceptance Criteria:**

**Given** un locataire effectue un check-in
**When** le check-in est complété
**Then** la photo et les coordonnées GPS sont stockées dans la base de données
**And** les preuves sont liées à la réservation spécifique
**And** les preuves sont stockées de manière sécurisée (chiffrement si nécessaire)
**And** les preuves sont visibles par l'hôte et le support
**And** un audit log est créé avec timestamp et toutes les données du check-in
**And** les preuves sont conservées selon les exigences légales (durée de rétention)

**Requirements:** FR47

### Story 8.4: Accès informations check-in hors ligne

As a locataire,
I want accéder aux informations de check-in hors ligne (adresse, codes, contact),
So que je peux arriver à la coloc même sans connexion internet.

**Acceptance Criteria:**

**Given** j'ai une réservation confirmée
**When** je suis en mode hors ligne
**Then** je peux accéder aux informations essentielles de check-in:
  - Adresse complète de la coloc
  - Codes d'accès (si fournis par l'hôte)
  - Contact de l'hôte (téléphone, email masqués mais accessibles)
  - Instructions d'arrivée (si fournies)
**And** les informations sont préchargées via service worker (PWA)
**And** les informations sont accessibles depuis la page de ma réservation
**And** je peux effectuer le check-in même hors ligne (les données sont synchronisées quand la connexion revient)

**Requirements:** FR48

### Story 8.5: Signalement problème lors du check-in

As a locataire,
I want signaler un problème lors du check-in,
So que le support peut intervenir rapidement en cas d'incident.

**Acceptance Criteria:**

**Given** j'effectue un check-in ou je suis arrivé à la coloc
**When** je rencontre un problème (code inopérant, villa différente des photos, etc.)
**Then** je peux signaler le problème depuis la page de check-in
**And** je peux sélectionner le type de problème (code inopérant, villa différente, problème d'accès, autre)
**And** je peux ajouter une description détaillée du problème
**And** je peux joindre des photos pour illustrer le problème
**And** le signalement est envoyé immédiatement au support (mode urgent)
**And** l'hôte est également notifié du signalement
**And** le statut de la réservation passe à "incident_reported"
**And** un ticket d'incident est créé dans le back-office support

**Requirements:** FR49

---

## Epic 9: Support & Opérations

Le support peut gérer les incidents, la fraude, et assurer la qualité de la plateforme via un back-office complet.

### Story 9.1: Accès back-office de gestion pour support

As a support,
I want accéder à un back-office de gestion,
So que je peux gérer tous les aspects opérationnels de la plateforme.

**Acceptance Criteria:**

**Given** je suis un utilisateur avec rôle "support"
**When** je me connecte
**Then** j'accède au back-office avec un dashboard complet
**And** je peux voir les statistiques clés (nombre d'incidents, vérifications en attente, etc.)
**And** j'ai accès aux sections:
  - Gestion des vérifications
  - Gestion des incidents
  - Gestion des utilisateurs
  - Gestion des annonces
  - Gestion des réservations
  - Audit logs
**And** l'accès est sécurisé (authentification forte requise)
**And** toutes mes actions sont tracées dans les audit logs

**Requirements:** FR50

### Story 9.2: Visualisation incidents de check-in

As a support,
I want voir les incidents de check-in signalés,
So que je peux intervenir rapidement pour résoudre les problèmes.

**Acceptance Criteria:**

**Given** je suis support et j'accède au back-office
**When** je consulte la section incidents
**Then** je peux voir tous les incidents de check-in signalés
**And** pour chaque incident, je peux voir:
  - Informations locataire et hôte
  - Détails de la réservation
  - Type de problème signalé
  - Description et photos jointes
  - Date et heure du signalement
  - Statut (nouveau, en cours, résolu)
**And** les incidents sont triés par priorité (urgents en premier)
**And** je peux filtrer par statut, par type, ou par date
**And** je peux voir l'historique des actions prises sur chaque incident

**Requirements:** FR51

### Story 9.3: Gestion incidents via mode urgent (<30 min)

As a support,
I want gérer les incidents via un mode urgent avec réponse <30 min,
So que les problèmes critiques sont résolus rapidement.

**Acceptance Criteria:**

**Given** un incident de check-in est signalé
**When** l'incident est marqué comme urgent
**Then** une alerte est générée pour le support
**And** le support doit répondre dans les 30 minutes (premier accusé de réception)
**And** un timer affiche le temps écoulé depuis le signalement
**And** si aucune réponse dans les 30 min, une escalade automatique est déclenchée
**And** le support peut voir tous les incidents urgents en priorité dans le dashboard
**And** les incidents urgents sont notifiés via notifications push/email au support
**And** un audit log est créé pour chaque action sur un incident urgent

**Requirements:** FR52

### Story 9.4: Visualisation dossiers complets (KYC, chats, check-in, statut calendrier)

As a support,
I want voir les dossiers complets avec toutes les informations (KYC, chats, check-in, calendrier),
So que je peux prendre des décisions éclairées lors de la résolution d'incidents.

**Acceptance Criteria:**

**Given** je suis support et je consulte un incident ou un utilisateur
**When** j'accède au dossier complet
**Then** je peux voir toutes les informations pertinentes:
  - Statut KYC de l'utilisateur
  - Historique des conversations (chats)
  - Preuves de check-in (photos, GPS)
  - Statut du calendrier et réservations
  - Historique des actions précédentes
**And** toutes les informations sont centralisées dans une vue unique
**And** je peux naviguer entre les différentes sections du dossier
**And** les informations sont présentées de manière claire et organisée
**And** je peux exporter le dossier complet si nécessaire (pour arbitrage externe)

**Requirements:** FR53

### Story 9.5: Suspension annonce ou badge en cas de fraude

As a support,
I want suspendre une annonce ou un badge en cas de fraude détectée,
So que la confiance de la plateforme est préservée.

**Acceptance Criteria:**

**Given** je suis support et j'ai détecté une fraude (documents falsifiés, annonce frauduleuse, etc.)
**When** je suspens une annonce ou un badge
**Then** l'annonce est immédiatement retirée de la liste publique (statut "suspended")
**And** le badge vérifié est révoqué si applicable
**And** je dois fournir une raison de suspension (champ obligatoire)
**And** l'hôte est notifié de la suspension avec la raison
**And** toutes les réservations en cours sont notifiées
**And** un audit log détaillé est créé avec toutes les preuves de fraude
**And** l'hôte peut contester la décision (processus futur)

**Requirements:** FR54

### Story 9.6: Remboursement locataire

As a support,
I want rembourser un locataire,
So que je peux résoudre les litiges et incidents en remboursant si nécessaire.

**Acceptance Criteria:**

**Given** je suis support et un incident nécessite un remboursement
**When** j'initie un remboursement pour un locataire
**Then** je peux sélectionner la réservation à rembourser
**And** je peux choisir le montant à rembourser (total ou partiel)
**And** je dois fournir une raison de remboursement (champ obligatoire)
**And** le remboursement est effectué via Stripe (refund de la capture)
**And** le locataire est notifié du remboursement
**And** le statut de la réservation passe à "refunded"
**And** un audit log est créé avec tous les détails du remboursement
**And** le remboursement apparaît dans l'historique financier

**Requirements:** FR55

### Story 9.7: Relogement locataire en cas d'incident

As a support,
I want reloger un locataire en cas d'incident,
So que le locataire peut trouver une solution alternative rapidement.

**Acceptance Criteria:**

**Given** je suis support et un incident nécessite un relogement
**When** j'initie un relogement pour un locataire
**Then** je peux rechercher des annonces alternatives disponibles
**And** je peux proposer des options de relogement au locataire
**And** le locataire peut accepter ou refuser les options proposées
**And** si accepté, une nouvelle réservation est créée automatiquement
**And** le remboursement de l'ancienne réservation peut être effectué si nécessaire
**And** l'hôte de l'ancienne annonce est notifié du relogement
**And** un audit log est créé avec tous les détails du relogement

**Requirements:** FR56

### Story 9.8: Génération alertes pour sync calendrier en échec

As a système,
I want générer des alertes pour les synchronisations de calendrier en échec,
So que le support peut intervenir rapidement pour résoudre les problèmes techniques.

**Acceptance Criteria:**

**Given** une synchronisation automatique de calendrier échoue
**When** l'échec est détecté
**Then** une alerte est générée dans le back-office support
**And** l'alerte contient:
  - Identifiant de l'annonce concernée
  - Type d'erreur
  - Date et heure de l'échec
  - Nombre de tentatives échouées
**And** les alertes sont visibles dans le dashboard support
**And** le support peut voir l'historique des alertes
**And** le support peut marquer les alertes comme résolues
**And** un email de notification est envoyé au support si plusieurs échecs consécutifs

**Requirements:** FR57

### Story 9.9: Traçage historique complet (logs, chats, signalements)

As a système,
I want tracer un historique complet de toutes les actions (logs, chats, signalements),
So que je peux assurer la traçabilité complète pour audit et résolution de litiges.

**Acceptance Criteria:**

**Given** des actions sont effectuées sur la plateforme
**When** une action critique se produit (réservation, paiement, vérification, incident, etc.)
**Then** un log d'audit est créé avec:
  - Type d'action
  - Utilisateur ayant effectué l'action
  - Date et heure précise
  - Détails de l'action
  - Résultat (succès/échec)
**And** tous les chats sont stockés avec timestamp et participants
**And** tous les signalements sont enregistrés avec détails complets
**And** l'historique est accessible depuis le back-office support
**And** l'historique peut être exporté pour audit externe
**And** les logs sont conservés selon les exigences légales (durée de rétention)

**Requirements:** FR58

---
