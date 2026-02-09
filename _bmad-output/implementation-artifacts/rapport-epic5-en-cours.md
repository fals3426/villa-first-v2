# 📊 Rapport d'Avancement - Epic 5 (En Cours)

**Date :** 2026-01-23  
**Statut :** 🔄 En développement

---

## ✅ Stories Complétées

### Story 5.1 : Réservation d'une coloc disponible ✅
- Modèle `Booking` créé
- Service de réservation implémenté
- API POST `/api/bookings`
- Formulaire de réservation
- Vérification KYC et disponibilité

### Story 5.2 : Blocage réservation si prix modifié ✅
- Champs `priceAtBooking` et `currentListingPrice` ajoutés
- Fonction `handlePriceChange()` implémentée
- Intégration avec modification de prix
- Routes API GET `/api/bookings` et POST `/api/bookings/[id]/cancel`
- Page UI "Mes réservations" avec affichage prix modifié

---

## 🚧 Stories En Cours de Développement

### Story 5.3 : Préautorisation 25€ pour réserver une place

**Progression :** ~60%

**Fait :**
- ✅ Stripe installé (`stripe`, `@stripe/stripe-js`)
- ✅ Modèle `Payment` créé dans Prisma (à synchroniser)
- ✅ Enum `PaymentStatus` créé
- ✅ Client Stripe configuré (`src/lib/stripe.ts`)
- ✅ Service de paiement créé (`src/server/services/payments/payment.service.ts`)
- ✅ Schéma de validation créé (`src/lib/validations/payment.schema.ts`)
- ✅ Route API POST `/api/bookings/[id]/payment/preauthorize`
- ✅ Route API GET `/api/bookings/[id]/payment/status`

**À faire :**
- ⏳ Synchroniser le schéma Prisma (nécessite Prisma Postgres démarré)
- ⏳ UI : Composant de paiement avec Stripe Elements
- ⏳ Intégrer le flux de paiement après création de réservation
- ⏳ Webhook Stripe (préparation pour Story 5.7)

**Blocage actuel :**
- Base de données Prisma Postgres non accessible
- Nécessite : `npx prisma dev --detach` puis `npx prisma db push`

---

## 📋 Stories Restantes

### Story 5.4 : Préautorisation sans débit tant que colocation non validée
**Dépend de :** Story 5.3  
**Statut :** Prêt à démarrer (structure de base créée)

### Story 5.5 : Définition règles de validation par propriétaire
**Dépend de :** Aucune  
**Statut :** Prêt à démarrer
- Enum `ValidationRule` créé dans Prisma
- Champs `validationRule` et `validationThreshold` ajoutés au modèle `Listing` (à synchroniser)

### Story 5.6 : Validation manuelle colocation par propriétaire
**Dépend de :** Story 5.5  
**Statut :** En attente

### Story 5.7 : Capture préautorisations lors validation colocation
**Dépend de :** Stories 5.3, 5.4, 5.6  
**Statut :** En attente
- Fonction `capturePaymentIntent()` déjà créée dans `src/lib/stripe.ts`

### Story 5.8 : Expiration automatique préautorisations
**Dépend de :** Story 5.3  
**Statut :** En attente
- Champ `expiresAt` ajouté au modèle `Payment`
- Fonction `cancelPaymentIntent()` déjà créée

### Story 5.9 : Visualisation réservations confirmées
**Dépend de :** Story 5.7  
**Statut :** En attente
- Page `/bookings` déjà créée (Story 5.2)
- À étendre pour afficher les réservations confirmées

### Story 5.10 : Gestion paiements mode hors ligne (PWA)
**Dépend de :** Story 5.9  
**Statut :** En attente
- Serwist déjà installé
- Nécessite configuration PWA complète

---

## 🔧 Actions Immédiates Requises

### 1. Démarrer Prisma Postgres et Synchroniser le Schéma

```bash
# Démarrer Prisma Postgres
npx prisma dev --detach

# Attendre 5-10 secondes, puis synchroniser
npx prisma db push

# Régénérer le client Prisma
npx prisma generate
```

### 2. Configurer Stripe (Optionnel pour développement)

Pour tester les paiements, ajouter dans `.env.local` :
```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

**Note :** Pour le développement, on peut utiliser Stripe en mode test avec des cartes de test.

---

## 📁 Fichiers Créés/Modifiés

### Modifiés
1. `prisma/schema.prisma` - Ajout modèles `Payment`, enums `PaymentStatus`, `ValidationRule`, champs validation dans `Listing`
2. `package.json` - Stripe installé

### Créés
1. `src/lib/stripe.ts` - Client Stripe et fonctions utilitaires
2. `src/server/services/payments/payment.service.ts` - Service de paiement
3. `src/lib/validations/payment.schema.ts` - Schéma de validation
4. `src/app/api/bookings/[id]/payment/preauthorize/route.ts` - API préautorisation
5. `src/app/api/bookings/[id]/payment/status/route.ts` - API statut paiement

---

## 🎯 Prochaines Étapes

1. **Synchroniser la base de données** (priorité)
2. **Créer l'UI de paiement** (Story 5.3)
3. **Implémenter Story 5.4** (maintien préautorisation)
4. **Implémenter Story 5.5** (règles de validation)
5. **Implémenter Stories 5.6-5.10** dans l'ordre

---

**Rapport créé le :** 2026-01-23  
**Epic 5 Progression :** 2/10 stories complétées (20%)
