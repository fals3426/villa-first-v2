# Guide d'Exécution des Migrations Prisma

**Date :** 2026-01-23

---

## ⚠️ Situation Actuelle

La base de données PostgreSQL n'est **pas accessible** actuellement. L'erreur indique :
```
Can't reach database server at `localhost:51214`
```

---

## 📋 Migrations En Attente

### Migration 1 : Coordonnées géographiques + Modèle Booking

**Nom suggéré :** `add_listing_coordinates_and_booking_model`

**Changements à migrer :**

1. **Modèle `Listing` :**
   - Ajout de `latitude Float?`
   - Ajout de `longitude Float?`
   - Index sur `[latitude, longitude]`

2. **Nouveau modèle `Booking` :**
   - Enum `BookingStatus` (pending, confirmed, expired, cancelled, price_changed)
   - Champs : `id`, `listingId`, `tenantId`, `checkIn`, `checkOut`, `status`, `createdAt`, `updatedAt`
   - Relations vers `Listing` et `User`
   - Index multiples

3. **Relations ajoutées :**
   - `User.bookings Booking[]`
   - `Listing.bookings Booking[]`

---

## 🔧 Étapes pour Exécuter la Migration

### Étape 1 : Vérifier la Configuration de la Base de Données

1. Vérifier le fichier `.env` ou `.env.local` :
   ```env
   DATABASE_URL="postgresql://user:password@localhost:51214/database_name"
   ```

2. Vérifier que le port correspond (51214 dans l'erreur, mais peut-être 51213 dans la config)

### Étape 2 : Démarrer PostgreSQL

**Sur Windows :**
```powershell
# Option 1 : Via Services
# Ouvrir "Services" → Démarrer "postgresql-x64-XX"

# Option 2 : Via ligne de commande (si installé localement)
# Naviguer vers le dossier d'installation PostgreSQL
# Exécuter : pg_ctl start -D "C:\Program Files\PostgreSQL\XX\data"
```

**Alternative :** Utiliser Docker
```bash
docker run --name postgres-villa -e POSTGRES_PASSWORD=password -e POSTGRES_DB=villa_first -p 51214:5432 -d postgres
```

### Étape 3 : Vérifier la Connexion

```bash
npx prisma db pull
```

Si cela fonctionne, la base de données est accessible.

### Étape 4 : Créer et Appliquer la Migration

```bash
# Créer la migration (génère le fichier SQL)
npx prisma migrate dev --name add_listing_coordinates_and_booking_model

# OU si vous voulez juste créer le fichier sans l'appliquer :
npx prisma migrate dev --name add_listing_coordinates_and_booking_model --create-only
```

### Étape 5 : Vérifier l'État des Migrations

```bash
npx prisma migrate status
```

---

## 🚨 En Cas d'Erreur

### Erreur : "Can't reach database server"

**Solutions :**
1. Vérifier que PostgreSQL est démarré
2. Vérifier le port dans `DATABASE_URL` (51214 vs 51213)
3. Vérifier les credentials (user, password, database name)
4. Vérifier le firewall Windows

### Erreur : "Migration failed"

**Solutions :**
1. Vérifier que la base de données est vide ou que les migrations précédentes sont appliquées
2. Si nécessaire, réinitialiser : `npx prisma migrate reset` (⚠️ **SUPPRIME TOUTES LES DONNÉES**)

---

## 📝 Commandes Utiles

```bash
# Générer le client Prisma (après modification du schema)
npx prisma generate

# Voir l'état des migrations
npx prisma migrate status

# Appliquer les migrations en production
npx prisma migrate deploy

# Réinitialiser la base (dev uniquement - supprime toutes les données)
npx prisma migrate reset

# Visualiser la base de données
npx prisma studio
```

---

## ✅ Après la Migration

Une fois la migration appliquée :

1. **Vérifier que le client Prisma est à jour :**
   ```bash
   npx prisma generate
   ```

2. **Tester la connexion :**
   ```bash
   npm run build
   ```

3. **Vérifier les nouveaux modèles :**
   - Ouvrir `npx prisma studio`
   - Vérifier que les tables `listings` (avec latitude/longitude) et `bookings` existent

---

## 📌 Notes Importantes

- ⚠️ **Ne jamais modifier manuellement les fichiers de migration** après leur création
- ⚠️ **Toujours tester les migrations en développement avant la production**
- ✅ **Sauvegarder la base de données** avant d'appliquer des migrations en production
- ✅ **Vérifier que `npx prisma generate`** a été exécuté après chaque modification du schema

---

**Guide créé le :** 2026-01-23
