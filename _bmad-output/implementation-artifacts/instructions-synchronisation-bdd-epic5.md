# 🔧 Instructions - Synchronisation Base de Données pour Epic 5

**Date :** 2026-01-23  
**Contexte :** Les modèles Prisma ont été modifiés mais pas encore synchronisés avec la base de données

---

## ⚠️ Problème

Les nouveaux modèles et champs suivants ont été ajoutés au schéma Prisma mais ne sont pas encore dans la base de données :

1. **Modèle `Payment`** (Story 5.3)
2. **Enum `PaymentStatus`** (Story 5.3)
3. **Enum `ValidationRule`** (Story 5.5)
4. **Champs `validationRule` et `validationThreshold`** dans `Listing` (Story 5.5)
5. **Relation `Booking.payments`** (Story 5.3)

---

## ✅ Solution

### Étape 1 : Démarrer Prisma Postgres

```bash
npx prisma dev --detach
```

**Attendre 5-10 secondes** que le serveur démarre complètement.

### Étape 2 : Synchroniser le Schéma

```bash
npx prisma db push
```

Cette commande va :
- Créer la table `payments`
- Créer les enums `PaymentStatus` et `ValidationRule`
- Ajouter les colonnes `validationRule` et `validationThreshold` à la table `listings`
- Créer les index nécessaires

### Étape 3 : Régénérer le Client Prisma

```bash
npx prisma generate
```

Cette commande régénère les types TypeScript pour inclure les nouveaux modèles.

### Étape 4 : Vérifier

```bash
npm run build
```

Le build devrait réussir sans erreurs TypeScript liées aux modèles.

---

## 🔍 Vérification

### Vérifier que Prisma Postgres Tourne

```bash
npx prisma dev ls
```

Vous devriez voir :
```
name     status   urls
default  running  ...
```

### Vérifier les Tables Créées

```bash
npx prisma studio
```

Dans Prisma Studio, vous devriez voir :
- Table `payments` avec les colonnes : id, bookingId, amount, stripePaymentIntentId, status, expiresAt, createdAt, updatedAt
- Table `listings` avec les nouvelles colonnes : validationRule, validationThreshold

---

## 🐛 Si le Problème Persiste

### Erreur "Can't reach database server"

**Solution :**
1. Vérifier que Prisma Postgres est démarré : `npx prisma dev ls`
2. Si "not_running", redémarrer : `npx prisma dev --detach`
3. Attendre 10 secondes avant de réessayer `npx prisma db push`

### Erreur de Migration

Si `prisma db push` échoue, vous pouvez utiliser une migration :

```bash
npx prisma migrate dev --name add_payment_and_validation_models
```

---

## 📝 Changements Appliqués au Schéma

### Nouveau Modèle Payment

```prisma
model Payment {
  id                    String        @id @default(cuid())
  bookingId             String
  amount                Int           // 2500 = 25€
  stripePaymentIntentId String        @unique
  status                PaymentStatus @default(pending)
  expiresAt             DateTime?
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt
  booking               Booking       @relation(...)
}
```

### Nouveaux Enums

```prisma
enum PaymentStatus {
  pending
  captured
  expired
  cancelled
  failed
}

enum ValidationRule {
  FULL_ONLY
  PARTIAL
  MANUAL
}
```

### Champs Ajoutés à Listing

```prisma
validationRule    ValidationRule? // FULL_ONLY, PARTIAL, MANUAL
validationThreshold Int?         // Pourcentage pour PARTIAL (ex: 80)
```

---

**Instructions créées le :** 2026-01-23  
**Action requise :** Exécuter les commandes ci-dessus pour synchroniser la base de données
