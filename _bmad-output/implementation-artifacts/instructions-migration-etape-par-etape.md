# Instructions Étape par Étape - Migration Prisma

**Date :** 2026-01-23

---

## 🎯 Objectif

Exécuter la migration Prisma pour ajouter :
- Les champs `latitude` et `longitude` au modèle `Listing`
- Le modèle `Booking` avec l'enum `BookingStatus`

---

## 📋 Étape 1 : Choisir la Solution de Base de Données

Vous avez **2 options** :

### Option A : Utiliser Prisma Postgres (Recommandé - Plus Simple) ✅

**Avantages :**
- Démarrage automatique
- Pas d'installation requise
- Parfait pour le développement

**Inconvénients :**
- Données temporaires (perdues si le serveur s'arrête)

### Option B : Installer PostgreSQL Localement

**Avantages :**
- Données persistantes
- Plus proche de la production

**Inconvénients :**
- Installation requise
- Configuration manuelle

---

## 🚀 Option A : Utiliser Prisma Postgres (RECOMMANDÉ)

### Étape 1.1 : Vérifier la Configuration

Votre fichier `.env` contient déjà la configuration Prisma Postgres :
```
DATABASE_URL="prisma+postgres://localhost:51213/?api_key=..."
```

### Étape 1.2 : S'assurer que `.env.local` n'écrase pas la config

**Action :** Vérifier que `.env.local` n'a pas de `DATABASE_URL` qui écrase celle de `.env`

Si `.env.local` contient :
```env
DATABASE_URL="postgresql://user:password@localhost:5432/..."
```

**Solution :** Commenter ou supprimer cette ligne dans `.env.local` :
```env
# DATABASE_URL="postgresql://user:password@localhost:5432/..."
```

### Étape 1.3 : Démarrer Prisma Postgres

```powershell
# Cette commande démarre automatiquement Prisma Postgres
npx prisma migrate dev --name add_listing_coordinates_and_booking_model
```

**Ce qui va se passer :**
1. Prisma va démarrer automatiquement un serveur PostgreSQL
2. Créer la migration
3. Appliquer la migration
4. Régénérer le client Prisma

---

## 🗄️ Option B : Installer PostgreSQL Localement

### Étape 2.1 : Télécharger PostgreSQL

1. Aller sur : https://www.postgresql.org/download/windows/
2. Cliquer sur "Download the installer"
3. Télécharger PostgreSQL 16 (ou version récente)

### Étape 2.2 : Installer PostgreSQL

1. Exécuter l'installateur
2. **Important :** Noter le mot de passe défini pour l'utilisateur `postgres`
3. Port par défaut : `5432` (garder par défaut)
4. Laisser toutes les options par défaut

### Étape 2.3 : Démarrer le Service PostgreSQL

**Méthode 1 : Via Services Windows**
1. Appuyer sur `Windows + R`
2. Taper `services.msc` et appuyer sur Entrée
3. Chercher "postgresql" dans la liste
4. Clic droit → "Démarrer"

**Méthode 2 : Via PowerShell (Administrateur)**
```powershell
Start-Service postgresql-x64-16
# (Remplacer 16 par votre version)
```

### Étape 2.4 : Créer la Base de Données

```powershell
# Se connecter à PostgreSQL
psql -U postgres

# Dans psql, créer la base de données
CREATE DATABASE villa_first_v2;

# Quitter psql
\q
```

### Étape 2.5 : Mettre à jour `.env.local`

```env
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/villa_first_v2?schema=public"
```

**Remplacez :**
- `VOTRE_MOT_DE_PASSE` par le mot de passe défini lors de l'installation
- `villa_first_v2` par le nom de votre base de données

### Étape 2.6 : Exécuter la Migration

```powershell
npx prisma migrate dev --name add_listing_coordinates_and_booking_model
```

---

## ✅ Vérification Après Migration

### Étape 3 : Vérifier que la Migration est Appliquée

```powershell
# Vérifier l'état des migrations
npx prisma migrate status

# Régénérer le client Prisma (au cas où)
npx prisma generate

# Vérifier que le build fonctionne
npm run build
```

### Étape 4 : Vérifier les Tables Créées

```powershell
# Ouvrir Prisma Studio pour voir les tables
npx prisma studio
```

Vous devriez voir :
- Table `listings` avec les colonnes `latitude` et `longitude`
- Table `bookings` avec toutes les colonnes

---

## 🐛 Dépannage

### Erreur : "Can't reach database server"

**Si vous utilisez Prisma Postgres :**
- Laisser Prisma démarrer automatiquement le serveur
- Attendre quelques secondes après la première commande

**Si vous utilisez PostgreSQL local :**
- Vérifier que le service est démarré : `Get-Service postgresql*`
- Vérifier le port : `Test-NetConnection localhost -Port 5432`

### Erreur : "Authentication failed"

**Solution :** Vérifier les credentials dans `.env.local`
- User : `postgres`
- Password : celui défini lors de l'installation
- Database : `villa_first_v2`

### Erreur : "Database does not exist"

**Solution :** Créer la base de données :
```powershell
psql -U postgres -c "CREATE DATABASE villa_first_v2;"
```

---

## 📝 Résumé des Commandes

### Pour Prisma Postgres (Option A) :
```powershell
# 1. Commenter DATABASE_URL dans .env.local si présent
# 2. Exécuter la migration
npx prisma migrate dev --name add_listing_coordinates_and_booking_model
```

### Pour PostgreSQL Local (Option B) :
```powershell
# 1. Installer PostgreSQL
# 2. Démarrer le service
Start-Service postgresql-x64-16

# 3. Créer la base de données
psql -U postgres -c "CREATE DATABASE villa_first_v2;"

# 4. Mettre à jour .env.local avec les bons credentials
# 5. Exécuter la migration
npx prisma migrate dev --name add_listing_coordinates_and_booking_model
```

---

**Guide créé le :** 2026-01-23
