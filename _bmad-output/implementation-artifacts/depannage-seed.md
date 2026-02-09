# Dépannage : Script de Seed

## ❌ Erreur : "DATABASE_URL is not defined"

### Cause
Le script ne trouve pas la variable d'environnement `DATABASE_URL` dans votre fichier `.env.local`.

### Solution

1. **Vérifiez que le fichier `.env.local` existe** à la racine du projet :
   ```
   Villa first v2/
   ├── .env.local  ← Ce fichier doit exister
   ├── package.json
   ├── scripts/
   └── ...
   ```

2. **Vérifiez que `DATABASE_URL` est définie** dans `.env.local` :
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/villa_first_v2"
   ```

3. **Format correct de DATABASE_URL** :
   ```
   postgresql://[user]:[password]@[host]:[port]/[database]
   ```
   
   Exemple :
   ```env
   DATABASE_URL="postgresql://postgres:monmotdepasse@localhost:5432/villa_first_v2"
   ```

4. **Si vous utilisez PostgreSQL local** :
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/villa_first_v2"
   ```

5. **Si vous utilisez une base de données distante** :
   ```env
   DATABASE_URL="postgresql://user:password@host.distant.com:5432/villa_first_v2"
   ```

### Vérification rapide

Pour vérifier que votre `.env.local` est bien chargé, vous pouvez temporairement ajouter cette ligne au début de `scripts/seed.ts` :

```typescript
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Définie' : '❌ Non définie');
```

**⚠️ N'oubliez pas de retirer cette ligne après le test pour ne pas exposer votre URL de base de données !**

---

## 🔧 Autres erreurs possibles

### Erreur : "Cannot find module 'tsx'"

**Solution :**
```bash
npm install --save-dev tsx
```

---

### Erreur : "Connection refused" ou "ECONNREFUSED"

**Cause :** PostgreSQL n'est pas démarré ou l'URL de connexion est incorrecte.

**Solution :**
1. Vérifiez que PostgreSQL est démarré
2. Vérifiez que l'URL de connexion est correcte
3. Testez la connexion manuellement :
   ```bash
   psql -U postgres -d villa_first_v2
   ```

---

### Erreur : "password authentication failed"

**Cause :** Le mot de passe dans `DATABASE_URL` est incorrect.

**Solution :**
1. Vérifiez le mot de passe PostgreSQL
2. Mettez à jour `DATABASE_URL` dans `.env.local`

---

### Erreur : "database does not exist"

**Cause :** La base de données n'existe pas encore.

**Solution :**
1. Créez la base de données :
   ```bash
   createdb villa_first_v2
   ```
   
   Ou via psql :
   ```sql
   CREATE DATABASE villa_first_v2;
   ```

2. Exécutez les migrations Prisma :
   ```bash
   npx prisma migrate dev
   ```

---

## ✅ Vérification que tout fonctionne

Après avoir corrigé le problème, réessayez :

```bash
npm run seed
```

Vous devriez voir :
```
🌱 Démarrage du seed de la base de données...

👤 Création des utilisateurs hôtes...
  ✅ Créé: host1@test.com
  ✅ KYC vérifié pour host1@test.com
  ...

🏠 Création des villas...
  ✅ Créé: Villa moderne à Canggu avec piscine
  ...

✅ Seed terminé avec succès !
```

---

## 📝 Note importante

Le fichier `.env.local` est généralement dans `.gitignore` pour des raisons de sécurité. Si vous n'avez pas ce fichier, créez-le en vous basant sur `.env.example` (s'il existe) ou créez-le manuellement.
