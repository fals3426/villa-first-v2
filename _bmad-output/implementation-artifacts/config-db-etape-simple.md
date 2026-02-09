# Configuration PostgreSQL - Guide Simple

## 🎯 Objectif

Configurer `DATABASE_URL` dans `.env.local` pour que le script de seed fonctionne.

---

## 📝 Étapes Simples

### 1. Ouvrir le fichier `.env.local`

Le fichier se trouve à la racine du projet : `Villa first v2\.env.local`

### 2. Trouver votre mot de passe PostgreSQL

**Option A : Si vous avez installé PostgreSQL récemment**
- Le mot de passe a été défini lors de l'installation
- Cherchez-le dans vos notes ou votre gestionnaire de mots de passe

**Option B : Si vous utilisez pgAdmin**
1. Ouvrez pgAdmin
2. Clic droit sur "Servers" → "Create" → "Server"
3. Dans l'onglet "Connection", vous verrez le mot de passe utilisé

**Option C : Réinitialiser le mot de passe**
1. Ouvrez PowerShell en tant qu'administrateur
2. Arrêtez PostgreSQL : `net stop postgresql-x64-XX` (remplacez XX par votre version)
3. Modifiez le fichier `pg_hba.conf` pour permettre les connexions sans mot de passe temporairement
4. Redémarrez PostgreSQL et connectez-vous pour changer le mot de passe

**Option D : Essayer des mots de passe courants**
- `postgres` (mot de passe par défaut souvent utilisé)
- `admin`
- `root`
- `password`
- Aucun mot de passe (laissez vide)

### 3. Modifier la ligne DATABASE_URL

Dans `.env.local`, trouvez cette ligne :

```env
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/villa_first_v2?schema=public"
```

Remplacez `VOTRE_MOT_DE_PASSE` par votre mot de passe réel.

**Exemples :**

Si votre mot de passe est `monmotdepasse123` :
```env
DATABASE_URL="postgresql://postgres:monmotdepasse123@localhost:5432/villa_first_v2?schema=public"
```

Si vous n'avez pas de mot de passe :
```env
DATABASE_URL="postgresql://postgres@localhost:5432/villa_first_v2?schema=public"
```

### 4. Vérifier que la base de données existe

Si la base de données `villa_first_v2` n'existe pas encore, créez-la :

**Via pgAdmin :**
1. Ouvrez pgAdmin
2. Connectez-vous au serveur PostgreSQL
3. Clic droit sur "Databases" → "Create" → "Database"
4. Nom : `villa_first_v2`
5. Cliquez sur "Save"

**Via ligne de commande :**
```powershell
psql -U postgres -c "CREATE DATABASE villa_first_v2;"
```

### 5. Appliquer les migrations Prisma

```bash
npx prisma migrate dev
```

### 6. Tester le seed

```bash
npm run seed
```

---

## ✅ Vérification

Si tout fonctionne, vous devriez voir :

```
✅ DATABASE_URL trouvée
🌱 Démarrage du seed de la base de données...

👤 Création des utilisateurs hôtes...
  ✅ Créé: host1@test.com
  ...
```

---

## ❌ Si ça ne fonctionne toujours pas

### Erreur : "password authentication failed"

→ Le mot de passe est incorrect. Essayez d'autres mots de passe ou réinitialisez-le.

### Erreur : "database does not exist"

→ Créez la base de données `villa_first_v2` (voir étape 4).

### Erreur : "connection refused"

→ PostgreSQL n'est pas démarré. Démarrez-le depuis les services Windows ou pgAdmin.

---

## 💡 Astuce

Si vous ne vous souvenez plus de votre mot de passe PostgreSQL, la solution la plus simple est souvent de le réinitialiser via pgAdmin ou de réinstaller PostgreSQL avec un nouveau mot de passe que vous noterez.
