# Création de la Base de Données - Guide Rapide

## ✅ Progrès

- ✅ PostgreSQL installé et démarré
- ✅ Variables d'environnement chargées
- ❌ Base de données `villa_first_v2` à créer

---

## 🚀 Solution Rapide

### Option 1 : Via pgAdmin (Recommandé - Interface Graphique)

1. **Ouvrez pgAdmin 4** depuis le menu Démarrer
2. **Connectez-vous** avec votre mot de passe PostgreSQL
3. **Développez** "Servers" → "PostgreSQL XX" → "Databases"
4. **Clic droit** sur "Databases" → **"Create"** → **"Database..."**
5. **Dans l'onglet "General"** :
   - **Database name :** `villa_first_v2`
6. **Cliquez sur "Save"**

✅ La base de données est créée !

---

### Option 2 : Via PowerShell (Ligne de Commande)

Ouvrez PowerShell et exécutez :

```powershell
psql -U postgres -c "CREATE DATABASE villa_first_v2;"
```

Vous serez invité à entrer votre mot de passe PostgreSQL.

✅ La base de données est créée !

---

## 📋 Après la Création de la Base de Données

Une fois la base de données créée, vous devez appliquer les migrations Prisma :

```bash
npx prisma migrate dev
```

Cette commande va :
1. Créer toutes les tables dans la base de données
2. Appliquer le schéma Prisma

---

## 🎯 Ensuite, Exécutez le Seed

```bash
npm run seed
```

Vous devriez voir :
```
✅ DATABASE_URL trouvée
🌱 Démarrage du seed de la base de données...
👤 Création des utilisateurs hôtes...
  ✅ Créé: host1@test.com
  ...
```

---

## 🔍 Vérification

Pour vérifier que la base de données existe :

**Via pgAdmin :**
- Vous devriez voir `villa_first_v2` dans la liste des bases de données

**Via PowerShell :**
```powershell
psql -U postgres -l | Select-String "villa_first_v2"
```

---

## ❌ Si Vous Avez des Problèmes

### Erreur : "password authentication failed"

→ Vérifiez que vous utilisez le bon mot de passe dans `.env.local`

### Erreur : "psql: command not found"

→ Ajoutez PostgreSQL au PATH ou utilisez pgAdmin

### Erreur : "database already exists"

→ La base existe déjà, vous pouvez passer directement aux migrations

---

## 📝 Résumé des Étapes

1. ✅ Créer la base de données `villa_first_v2`
2. ⏳ Appliquer les migrations : `npx prisma migrate dev`
3. ⏳ Exécuter le seed : `npm run seed`

Une fois ces étapes terminées, vous aurez 5 villas de test dans votre application ! 🎉
