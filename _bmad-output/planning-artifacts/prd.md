---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-e-01-discovery
  - step-e-02-review
  - step-e-03-edit
lastEdited: '2026-01-20'
editHistory:
  - date: '2026-01-20'
    changes: 'Modification du modèle de paiement : passage de 25€ + préautorisation 20-25% loyer vers 25€ uniquement avec capture conditionnelle après validation propriétaire. Ajout FR59-FR63 pour système de validation colocation.'
inputDocuments:
  - _bmad-output/analysis/brainstorming-session-2026-01-19.md
documentCounts:
  productBriefs: 0
  research: 0
  brainstorming: 1
  projectDocs: 0
workflowType: 'prd'
classification:
  projectType: 'web + mobile marketplace (coliving/location)'
  domain: 'travel / coliving'
  complexity: 'medium'
  projectContext: 'greenfield'

## Executive Summary

**Vision:** Marketplace de mise en relation pour colocations à Bali, centrée sur la vérification et la confiance. Différenciation clé : badge "Annonce vérifiée" avec vérification manuelle systématique des titres de propriété/mandats.

**Différenciateur:** Vérification obligatoire (KYC hôte + locataire, vérification manuelle titres) vs concurrents (Airbnb, Booking) qui permettent publication sans vérification immédiate. Chat masqué pour protection plateforme et traçabilité complète.

**Utilisateurs cibles:**
- **Locataires:** Digital nomads, voyageurs longue durée cherchant colocations vérifiées avec matching vibes (télétravail, yoga, etc.)
- **Hôtes/Mandataires:** Propriétaires ou mandataires voulant sortir du chaos Facebook/WhatsApp, prêts à passer vérification pour badge vérifié
- **Support:** Équipe plateforme gérant vérification manuelle, incidents, fraude

**Modèle économique:** Frais de mise en relation unique de 25 € par locataire, capturé uniquement après validation de la colocation par le propriétaire. Pas de gestion de loyers (mise en relation uniquement).

**Périmètre MVP:** Bali uniquement, 10 colocs complètes en 6 mois, PWA web + mobile.

## Success Criteria

### User Success
- Trouver un logement qui matche budget + localisation + vibes : ≥80 % des recherches aboutissent à ≥1 option pertinente en <48h.
- Satisfaction check-in : <5 % de “mauvaises surprises” signalées dans les 24h sur les 10 premières colocs.
- Matching vibes : ≥70 % des locataires déclarent “vibes conformes” post-installation (sondage in-app court).

### Business Success
- Lancement (0‑6 mois) : 10 premières colocs complètes (réservées et occupées) avec paiement capturé.
- Conversion : préautorisation → capture ≥60 % après validation propriétaire sur ces premières colocs.
- Vérification : ≥80 % des annonces actives en “vérifié” (ID + titres/mandat) d’ici 6 mois.
- Acquisition organique : 100 % des annonces importées depuis social passent par le flux vérifié.

### Technical Success
- Disponibilité app/web : ≥99 % (heures ouvrées locales) sur la période de lancement.
- Paiement : taux d’échec préautorisation <3 %, taux d’échec capture <2 %.
- Sync calendrier : succès >95 % des rafraîchissements programmés, alerte si échec.
- Support urgent : premier accusé <30 min sur incidents check-in.
- Crash app mobile : <1 % des sessions.

### Measurable Outcomes
- 10 colocs complètes et payées en 6 mois.
- ≥80 % annonces actives vérifiées, conversion préaut→capture ≥60 % après validation propriétaire.
- <5 % de signalements check-in sur les 10 premières colocs.

## Product Scope

### MVP - Minimum Viable Product
- Fiabilité : KYC hôte+locataire, vérif titres/mandat manuelle, badge vérifié.
- Conversion : frais fixes 25 €, préautorisation 25€ avec capture conditionnelle après validation, blocage si prix modifié sans revalidation, chat masqué.
- Qualité listing : photos minimales par catégorie, score de complétude, blocage si insuffisant.
- Disponibilité : sync calendrier 30 min, check-in photo+GPS, carte de confiance, accès hors ligne post-confirmation.
- Acquisition organique : import social guidé, vérif obligatoire avant publication, différenciation vérifié vs non vérifié.
- Support : mode urgent <30 min pour incidents check-in.

### Growth Features (Post-MVP)
- Assurance/caution intégrée.
- Vidéo live visite, médiateur tiers.
- Algorithme de recommandation/score vibes.
- Remontées qualité automatiques.

### Vision (Future)
- Automatisation vérif titres locales, scoring prédictif fraude.
- Extension multi-pays, partenariats OTA.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Revenue MVP - Focus sur génération de revenus rapide (10 colocs payées en 6 mois)

**Philosophie:** Valider le modèle économique rapidement en concentrant les efforts sur la confiance et la vérification (différenciateurs clés). Le badge vérifié est la priorité absolue pour gagner la confiance des locataires.

**Périmètre géographique MVP:** Bali uniquement (réduction de complexité réglementaire et opérationnelle)

**Resource Requirements:** 
- Équipe support pour vérification manuelle des titres/mandats
- Stack technique : PWA web + mobile (développement rapide, codebase unique)

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- ✅ Locataire : Recherche, filtres vibes/budget/localisation, réservation avec paiement frais, check-in GPS+photo
- ✅ Hôte/Mandataire : Publication annonce avec KYC, upload titres/mandat, gestion calendrier interne, réception demandes
- ✅ Support : Vérification manuelle titres, gestion incidents check-in, suspension badges si fraude

**Must-Have Capabilities:**

**Fiabilité & Confiance (Priorité absolue) :**
- KYC hôte + locataire (vérification identité obligatoire)
- Vérification manuelle titres de propriété/mandats
- Badge "Annonce vérifiée" (différenciation clé vs concurrents)
- Score de complétude annonces (blocage publication si insuffisant)

**Conversion & Paiement :**
- Frais fixes 25 €
- Préautorisation 25€ avec capture conditionnelle après validation propriétaire
- Système de validation de colocation par le propriétaire (règles configurables)
- Blocage réservation si prix modifié sans revalidation
- Capture uniquement après validation explicite de la colocation

**Communication :**
- **Chat masqué (MVP)** : Protection plateforme + centralisation échanges (non négociable pour MVP)
- Support mode urgent <30 min pour incidents check-in

**Qualité Listing :**
- Photos minimales par catégorie (cuisine, chambres, SDB, extérieurs)
- Score de complétude avec blocage si insuffisant

**Disponibilité & Check-in :**
- Calendrier interne uniquement (pas d'intégrations externes en MVP)
- Sync calendrier 30 min (rafraîchissement automatique)
- Check-in photo + GPS (preuve d'arrivée)
- Carte de confiance (géolocalisation)
- Accès hors ligne post-confirmation (réservations + paiement)

**Acquisition :**
- Différenciation visuelle vérifié vs non vérifié
- **Import social : REPORTÉ en Growth** (simplification MVP)

### Post-MVP Features

**Phase 2 - Growth (6-12 mois) :**

**Acquisition & Distribution :**
- Import social guidé (Facebook, Instagram, WhatsApp)
- Vérification obligatoire avant publication pour annonces importées

**Confiance & Qualité :**
- Assurance/caution intégrée
- Vidéo live visite
- Médiateur tiers pour litiges
- Algorithme de recommandation/score vibes
- Remontées qualité automatiques

**Intégrations :**
- Synchronisation calendriers externes (Airbnb, Booking.com, Google Calendar) - si besoin validé

**Phase 3 - Expansion (12+ mois) :**

**Automatisation :**
- Automatisation vérif titres locales (réduction charge support)
- Scoring prédictif fraude (IA)

**Expansion géographique :**
- Extension multi-pays (au-delà de Bali)
- Partenariats OTA (Online Travel Agencies)

### Risk Mitigation Strategy

**Risque Principal : Marché (Confiance des locataires)**

**Mitigation :**
- **Badge vérifié = Priorité absolue** : Différenciation clé vs Airbnb/Booking (pas de vérification systématique)
- Vérification manuelle rigoureuse dès le MVP (qualité > vitesse)
- KYC obligatoire hôte + locataire (réduction fraude)
- Chat masqué pour protection plateforme et traçabilité
- Check-in GPS + photo pour preuve d'arrivée

**Risques Techniques :**
- KYC : Intégration tierce (Stripe Identity, Onfido) - faisable mais complexité ajoutée
- Géolocalisation précise : PWA acceptable pour MVP, test avant lancement
- Mode hors ligne : Service workers pour réservations + paiement

**Risques Opérationnels :**
- Vérification manuelle : Besoin équipe support dès MVP (coût opérationnel)
- **Mitigation :** Processus clair, playbooks support, automatisation progressive en Growth

**Risques Marché (Secondaires) :**
- Adoption hôtes : Friction onboarding (KYC + vérification) vs valeur badge vérifié
- **Mitigation :** Communication claire valeur badge vérifié (différenciation, confiance locataires)
- Adoption locataires : Besoin masse critique annonces vs qualité vérifiée
- **Mitigation :** Focus qualité > quantité, 10 colocs complètes objectif réaliste pour MVP

**Contingency Plan :**
- Si adoption plus lente : Simplifier processus vérification (mais garder badge vérifié)
- Si ressources limitées : Prioriser vérification hôtes (supply) vs locataires (demand)

## User Journeys

### Locataire – Happy path “Trouver ma coloc idéale à Bali”
- Ouverture : Alice, digital nomad, cherche une coloc calme “télétravail + yoga”, budget 700 €, proche Canggu.
- Parcours : compte + onboarding KYC + questionnaire vibes, filtres budget/localisation/vibes, annonces “vérifiées + calendrier live”, comparaisons photos/vidéo, chat in-app masqué, questions à l’hôte vérifié.
- Climax : préautorise 25€ (pas de débit immédiat), reçoit notification quand colocation validée et paiement capturé, reçoit adresse + check-in hors ligne, arrivée fluide.
- Résolution : avis positif, vibes conformes.

### Locataire – Edge case “Mismatch vibes / incident check-in”
- Ouverture : Lucas choisit une villa “calme” malgré l’avertissement (il est festif) ; ou arrivée avec code inopérant.
- Parcours : signalement via app (“conflit de vibes” ou “problème d’accès”), canal urgence : hôte → mandataire → support.
- Climax : arbitrage avec charte coloc + preuves (photos, chat). Actions : avertissement/notes internes, relogement, remboursement, exclusion.
- Résolution : badges/historique mis à jour, expérience rétablie.

### Propriétaire / Mandataire – Publication vérifiée & gestion calendrier
- Ouverture : Made veut sortir du chaos FB/WhatsApp.
- Parcours : compte hôte, KYC, upload titres/mandat, photos complètes (cuisine/chambres/SDB/extérieurs) + vidéo optionnelle, saisie licence/règles, sync calendriers Airbnb/Booking/Google.
- Climax : validation manuelle titres → badge “Annonce vérifiée + calendrier live”, demandes via chat masqué, préaut/captures auto.
- Résolution : calendrier refresh 30 min, prix cohérents, gestion simple des annonces et incidents.

### Support plateforme – Incidents, fraude & qualité
- Ouverture : Sara (support) voit un back-office (incidents, sync en échec, fraude suspecte).
- Parcours : alertes “double booking”/“check-in échoué”, dossier avec KYC, chats, check-in photo+GPS, statut calendrier. Playbooks : rembourser, reloger, suspendre badge, escalader.
- Climax : cas de fraude (photos volées, titres non conformes) → suspension immédiate annonce/badge, notification hôte, preuves tracées.
- Résolution : historique traçable (logs, chats, signalements) pour arbitrage et amélioration qualité (score confiance, déréférencement).

### Journey Requirements Summary
- Locataire : onboarding vibes/KYC, filtres, carte de confiance, chat masqué, paiement frais + préaut, accès offline, gestion incidents check-in.
- Hôte/Mandataire : KYC, titres/mandat, gestion annonces & médias, règles/charte, connecteurs calendrier, gestion prix, vue demandes/réservations.
- Support/Ops : back-office incidents/fraude, suspension badges, monitoring sync/prix/images, gestion multi-mandataires, playbooks litiges.

## Domain-Specific Requirements

### Compliance & Regulatory (spécifique Bali/Indonésie)

- **Réglementations location à court terme** :
  - Vérification licence villa/hôtel (si applicable) selon règles locales Bali
  - Compliance avec règles d'immigration (visa, durée de séjour pour locataires)
  - Vérification titres de propriété/contrats de location pour hôtes en Indonésie

- **Protection des données** :
  - RGPD applicable si utilisateurs européens
  - Données d'identité (KYC) : stockage sécurisé, durée de conservation selon législation indonésienne
  - Données de paiement : conformité PCI-DSS (pour les frais de mise en relation uniquement)

- **Responsabilité légale** :
  - Charte de vie en coloc à faire accepter (conditions de mise en relation)
  - Responsabilité limitée : plateforme de mise en relation, pas responsable des loyers ou des litiges entre hôte/locataire (à clarifier dans les CGU)

### Technical Constraints

- **Sécurité & confiance** :
  - Vérification d'identité (KYC hôte et locataire)
  - Chiffrement des données personnelles et de paiement (frais uniquement)
  - Traçabilité des actions (audit logs)

- **Intégrations (Phase Growth uniquement)** :
  - Synchronisation calendriers externes (Airbnb, Booking.com) : non-critique pour MVP (recommandation : commencer avec calendrier interne uniquement)
  - Paiements (Stripe ou équivalent) : préautorisation 25€ et capture conditionnelle après validation propriétaire des frais de mise en relation uniquement
  - Géolocalisation : vérification check-in, carte de confiance

- **Disponibilité & performance** :
  - Uptime 99%+ (heures ouvrées locales)
  - Mode hors ligne post-confirmation de mise en relation

### Domain Patterns

- **Marketplace de mise en relation** :
  - Pas de gestion de loyers → pas de conformité fiscale automatique nécessaire
  - Focus sur la qualité du matching et la confiance
  - Sécurité par couches : vérification identité → Badge vérifié → Avis → Score de confiance

- **Gestion calendrier (MVP)** :
  - Calendrier interne uniquement pour MVP (moins de complexité, moins de points de défaillance)
  - Intégrations externes reportées en Growth une fois le modèle validé

### Risk Mitigations

- **Fraude/problèmes d'identité** :
  - Vérification manuelle des titres de propriété/mandats (MVP)
  - Photos volées détectées (future IA)
  - Badge vérifié : révoquer si preuve de fraude

- **Double réservation / conflits calendrier** :
  - Blocage réservation si modification prix sans revalidation
  - Alerte immédiate en cas d'échec sync calendrier (quand intégré en Growth)
  - Remboursement automatique si conflit détecté

- **Incidents check-in / qualité** :
  - Canal urgence <30 min pour problèmes d'accès
  - Photo + GPS check-in obligatoires
  - Historique traçable pour arbitrage et amélioration

- **Gestion préautorisations et validation** :
  - Expiration automatique des préautorisations si colocation non validée
  - Gestion des échecs de capture après validation (carte expirée, etc.)
  - Risque que les villas ne se remplissent pas (pas de revenus si pas de validation)
  - Risque que les propriétaires ne valident pas rapidement (frustration locataires)

## Web + Mobile Marketplace Specific Requirements

### Project-Type Overview

Plateforme hybride web + mobile marketplace pour la mise en relation de colocations. Approche Progressive Web App (PWA) prioritaire pour MVP, avec possibilité d'évolution vers natif selon les besoins validés.

### Technical Architecture Considerations

#### Plateformes & Approche Technique

- **Web** :
  - Architecture : SPA (Single Page Application) avec React/Vue/Next.js
  - Responsive design : Mobile-first
  - SEO : Optimisation de base pour recherche Google (titre, description, Open Graph)

- **Mobile** :
  - Stratégie MVP : PWA (Progressive Web App) prioritaire
  - Rationale : Développement plus rapide, codebase unique, mises à jour instantanées, installable sur mobile
  - Évolution : Migration vers natif (iOS + Android) possible en Growth si besoins spécifiques non couverts (géolocalisation précise, caméra native)

- **Synchronisation** :
  - Compte unique : Authentication partagée entre web et mobile
  - Synchronisation temps réel : Données synchronisées instantanément entre plateformes
  - Expérience cohérente : UX harmonisée web/mobile

#### Mode Hors Ligne

- **Scope MVP** :
  - Consultation des logements déjà réservés (données préchargées après confirmation)
  - Accès aux informations essentielles pour check-in (adresse, codes, contact hôte)
  - Paiement : Reconnexion automatique si tentative hors ligne, puis paiement en ligne

- **Limitations MVP** :
  - Recherche et découverte : Non disponible hors ligne (nécessite connexion)
  - Chat : Non disponible hors ligne

#### Notifications

- **Push Mobile** :
  - Critères de déclenchement : Nouvelle annonce correspondant aux critères utilisateur, place libérée dans une coloc suivie
  - Disponibilité : Push native sur mobile PWA, push web si supporté par navigateur

- **Notifications complémentaires** :
  - Email : Optionnel (choix utilisateur)
  - SMS : Optionnel (choix utilisateur)
  - Préférences utilisateur : Gestion granulaire des types de notifications

#### Fonctionnalités Spécifiques

- **Géolocalisation** :
  - Usage : Check-in GPS (preuve d'arrivée), carte de confiance (proximité)
  - PWA : API Geolocation disponible, précision acceptable pour MVP
  - Évolution : Natif en Growth si précision insuffisante pour check-in strict

- **Caméra** :
  - Usage : Photos check-in obligatoires (preuve d'arrivée)
  - PWA : MediaDevices API disponible mais UX moins fluide que natif
  - MVP : Acceptable en PWA pour valider le concept
  - Évolution : Natif en Growth pour meilleure UX caméra

- **Paiements** :
  - Stripe : Support PWA via Payment Request API
  - Web : Stripe Checkout standard
  - Mobile : Payment Request API dans PWA

#### Performance Requirements

- **Web** :
  - First Contentful Paint : < 2 secondes
  - Time to Interactive : < 3.5 secondes
  - Lighthouse Score : ≥ 90 (desktop), ≥ 80 (mobile)

- **Mobile** :
  - Test conditions : 3G throttled
  - Optimisations critiques : Images (WebP, lazy loading), code splitting
  - Priorité : Images marketplace (chargement optimisé)

#### Accessibilité

- **Niveau MVP** : WCAG 2.1 AA (minimum viable)
- **Priorités** :
  - Navigation au clavier
  - Contrastes suffisants
  - Labels accessibles
  - Textes alternatifs pour images

- **Évolution** : Audit d'accessibilité complet en Growth

### Implementation Considerations

- **Stack technique recommandé** :
  - Frontend : React/Next.js ou Vue/Nuxt pour PWA
  - Service Worker : Gestion cache et mode hors ligne
  - Backend : API REST/GraphQL pour synchronisation web/mobile
  - Paiements : Stripe intégration PWA + Web

- **Déploiement** :
  - Web : Hébergement cloud (Vercel, Netlify, AWS)
  - PWA : Même infrastructure que web (manifest.json + service worker)
  - CDN : Distribution globale pour performance images

- **Monitoring** :
  - Crash tracking : < 1% sessions (objectif technique)
  - Performance monitoring : Lighthouse CI pour maintien scores
  - Analytics : Tracking adoption PWA vs web

## Functional Requirements

### 1. User Management & Authentication

- FR1: Les utilisateurs peuvent créer un compte (locataire ou hôte)
- FR2: Les utilisateurs peuvent s'authentifier (email/mot de passe)
- FR3: Les locataires peuvent compléter un onboarding avec questionnaire vibes
- FR4: Les utilisateurs peuvent compléter une vérification KYC (identité)
- FR5: Le système peut stocker et gérer les données d'identité vérifiées
- FR6: Les utilisateurs peuvent gérer leur profil (informations personnelles)

### 2. Host Verification & Trust

- FR7: Les hôtes peuvent uploader des documents de titre de propriété ou mandat
- FR8: Le système peut afficher un badge "Annonce vérifiée" pour les annonces vérifiées
- FR9: Le support peut vérifier manuellement les titres/mandats des hôtes
- FR10: Le support peut approuver ou rejeter une demande de vérification
- FR11: Le support peut suspendre ou révoquer un badge vérifié en cas de fraude
- FR12: Le système peut différencier visuellement les annonces vérifiées vs non vérifiées

### 3. Listing Management

- FR13: Les hôtes peuvent créer une annonce de coloc
- FR14: Les hôtes peuvent uploader des photos par catégorie (cuisine, chambres, SDB, extérieurs)
- FR15: Les hôtes peuvent uploader une vidéo optionnelle
- FR16: Le système peut calculer un score de complétude d'annonce
- FR17: Le système peut bloquer la publication si le score de complétude est insuffisant
- FR18: Les hôtes peuvent définir les règles et la charte de la coloc
- FR19: Les hôtes peuvent gérer la disponibilité via un calendrier interne
- FR20: Le système peut synchroniser automatiquement le calendrier (rafraîchissement 30 min)
- FR21: Les hôtes peuvent définir et modifier les prix
- FR22: Les hôtes peuvent voir les demandes de réservation reçues
- FR23: Les hôtes peuvent accepter ou refuser une demande de réservation

### 4. Search & Discovery

- FR24: Les locataires peuvent rechercher des colocations par localisation
- FR25: Les locataires peuvent filtrer par budget
- FR26: Les locataires peuvent filtrer par vibes (critères de matching)
- FR27: Les locataires peuvent voir une carte de confiance (géolocalisation)
- FR28: Le système peut afficher les annonces correspondant aux critères de recherche
- FR29: Les locataires peuvent comparer plusieurs annonces (photos, vidéos, détails)

### 5. Booking & Payment

- FR30: Les locataires peuvent réserver une coloc disponible
- FR31: Le système peut bloquer une réservation si le prix a été modifié sans revalidation
- FR32: Les locataires peuvent effectuer une préautorisation de 25 € pour réserver une place dans une colocation
- FR33: Le système peut préautoriser 25 € lors de la réservation d'une place, sans débit tant que la colocation n'est pas validée
- FR34: Le système peut capturer les 25 € uniquement après validation explicite de la colocation par le propriétaire
- FR35: Les locataires peuvent voir leurs réservations confirmées
- FR36: Le système peut gérer les paiements en mode hors ligne (post-confirmation)

### 6. Communication

- FR37: Les utilisateurs peuvent communiquer via un chat masqué (protection plateforme)
- FR38: Le système peut centraliser tous les échanges dans le chat masqué
- FR39: Les utilisateurs peuvent recevoir des notifications push sur mobile
- FR40: Les utilisateurs peuvent recevoir des notifications email (optionnel)
- FR41: Les utilisateurs peuvent recevoir des notifications SMS (optionnel)
- FR42: Les utilisateurs peuvent configurer leurs préférences de notifications
- FR43: Le système peut envoyer des notifications quand une annonce correspond aux critères
- FR44: Le système peut envoyer des notifications quand une place se libère dans une coloc suivie

### 7. Check-in & Verification

- FR45: Les locataires peuvent effectuer un check-in avec photo obligatoire
- FR46: Les locataires peuvent effectuer un check-in avec géolocalisation GPS
- FR47: Le système peut stocker les preuves de check-in (photo + GPS)
- FR48: Les locataires peuvent accéder aux informations de check-in hors ligne (adresse, codes, contact)
- FR49: Les locataires peuvent signaler un problème lors du check-in

### 8. Support & Operations

- FR50: Le support peut accéder à un back-office de gestion
- FR51: Le support peut voir les incidents de check-in
- FR52: Le support peut gérer les incidents via un mode urgent (<30 min)
- FR53: Le support peut voir les dossiers complets (KYC, chats, check-in, statut calendrier)
- FR54: Le support peut suspendre une annonce ou un badge en cas de fraude
- FR55: Le support peut rembourser un locataire
- FR56: Le support peut reloger un locataire en cas d'incident
- FR57: Le système peut générer des alertes pour sync calendrier en échec
- FR58: Le système peut tracer un historique complet (logs, chats, signalements)
- FR59: Le propriétaire peut définir ses règles de validation (villa complète uniquement, validation partielle possible, validation manuelle)
- FR60: Le propriétaire peut valider manuellement une colocation à tout moment, indépendamment des conditions initiales
- FR61: Le système peut expirer automatiquement les préautorisations si la colocation n'est pas validée
- FR62: Le système peut capturer les préautorisations de tous les locataires ayant une réservation active lors de la validation de la colocation
- FR63: Le système peut gérer l'expiration automatique des préautorisations sans débit si la colocation n'est pas validée

## Non-Functional Requirements

### Performance

**Web Performance:**
- First Contentful Paint : < 2 secondes
- Time to Interactive : < 3.5 secondes
- Lighthouse Score : ≥ 90 (desktop), ≥ 80 (mobile)

**Mobile Performance:**
- Test conditions : 3G throttled
- Images optimisées : WebP format, lazy loading
- Code splitting pour réduction taille bundle initial

**Response Times:**
- Recherche annonces : Résultats affichés < 1 seconde
- Paiement : Transaction complète < 5 secondes
- Check-in : Enregistrement photo + GPS < 3 secondes
- Synchronisation calendrier : Rafraîchissement automatique toutes les 30 minutes

**Concurrent Users:**
- Support initial : 100 utilisateurs simultanés (MVP)
- Scalabilité : Architecture prête pour 10x croissance sans refonte majeure

### Security

**Data Protection:**
- Chiffrement des données en transit : TLS 1.3 minimum
- Chiffrement des données au repos : AES-256
- Données KYC : Stockage sécurisé avec accès restreint
- Données de paiement : Conformité PCI-DSS (via Stripe)

**Authentication & Authorization:**
- Authentification : Email/mot de passe avec hashage bcrypt/argon2
- Sessions : Tokens sécurisés avec expiration
- Accès support : Authentification forte + audit logs
- Rôles et permissions : Séparation claire hôte/locataire/support

**Compliance:**
- RGPD : Applicable si utilisateurs européens (consentement, portabilité, suppression)
- PCI-DSS : Conformité via intégration Stripe (pas de stockage données carte)
- Données Indonésie : Respect législation locale pour stockage données KYC

**Fraud Prevention:**
- Vérification manuelle titres/mandats (MVP)
- Traçabilité complète : Audit logs pour toutes actions critiques
- Suspension immédiate : Badge vérifié révocable en cas de fraude détectée

### Scalability

**Initial Capacity (MVP):**
- Objectif : 10 colocs complètes en 6 mois
- Utilisateurs : ~100-200 utilisateurs actifs simultanés
- Annonces : ~50-100 annonces actives

**Growth Planning:**
- Architecture : Prête pour 10x croissance sans refonte majeure
- Base de données : Scalabilité horizontale possible
- CDN : Distribution globale pour assets statiques (images, vidéos)

**Traffic Patterns:**
- Saisonnier : Gestion pics saisonniers (ex: haute saison Bali)
- Scalabilité automatique : Auto-scaling selon charge

### Reliability

**Availability:**
- Uptime : ≥ 99% (heures ouvrées locales) sur période lancement
- Downtime acceptable : < 1% (maintenance planifiée exclue)
- Monitoring : Alertes automatiques si disponibilité < 99%

**Error Handling:**
- Crash app mobile : < 1% des sessions
- Taux d'échec préautorisation : < 3%
- Taux d'échec capture paiement : < 2%
- Sync calendrier : Succès > 95% des rafraîchissements, alerte si échec

**Recovery:**
- Backup : Sauvegardes quotidiennes avec rétention 30 jours
- Disaster recovery : RTO (Recovery Time Objective) < 4 heures
- Data integrity : Validation et vérification données critiques

**Support Response:**
- Mode urgent : Premier accusé < 30 minutes sur incidents check-in
- Escalade : Processus d'escalade défini pour incidents critiques

### Accessibility

**Standards Compliance:**
- Niveau MVP : WCAG 2.1 AA (minimum viable)
- Priorités :
  - Navigation au clavier (toutes fonctionnalités accessibles)
  - Contrastes suffisants (ratio 4.5:1 minimum)
  - Labels accessibles (formulaires, boutons)
  - Textes alternatifs pour images (descriptions)

**User Experience:**
- Responsive design : Accessible sur tous devices (mobile, tablette, desktop)
- Mode hors ligne : Accessible post-confirmation réservation

**Évolution:**
- Audit d'accessibilité complet : Planifié en Growth phase
- Amélioration continue : Itération basée sur retours utilisateurs

### Integration

**Payment Integration:**
- Stripe : Intégration PWA + Web via Payment Request API
- Fiabilité : 99.9% uptime Stripe (dépendance externe)
- Fallback : Gestion erreurs paiement avec retry automatique

**Geolocation Services:**
- API Browser : Géolocalisation native (PWA)
- Précision : Acceptable pour MVP, évaluation précision avant lancement
- Fallback : Gestion cas où géolocalisation indisponible

**Notification Services:**
- Push notifications : Service natif navigateur (PWA)
- Email : Service tiers (SendGrid, Mailgun, etc.)
- SMS : Service tiers (Twilio, etc.)
- Fiabilité : 99%+ delivery rate pour notifications critiques

**Future Integrations (Growth):**
- Calendriers externes : Airbnb, Booking.com, Google Calendar (si besoin validé)
- Fiabilité : Gestion erreurs sync avec retry et alertes

---

# Product Requirements Document - Villa first v2

**Author:** Falsone
**Date:** 2026-01-19
