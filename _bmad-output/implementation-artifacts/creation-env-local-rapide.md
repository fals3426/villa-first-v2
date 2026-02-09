# Guide Rapide : Créer le fichier .env.local

## 🚀 Solution Rapide (2 minutes)

### Étape 1 : Copier le fichier exemple

À la racine du projet, copiez `.env.example` vers `.env.local` :

**Windows (PowerShell) :**
```powershell
Copy-Item .env.example .env.local
```

**Windows (CMD) :**
```cmd
copy .env.example .env.local
```

**Mac/Linux :**
```bash
cp .env.example .env.local
```

---

### Étape 2 : Modifier DATABASE_URL

Ouvrez `.env.local` et modifiez la ligne `DATABASE_URL` avec vos informations PostgreSQL :

```env
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/villa_first_v2?schema=public"
```

**Remplacez :**
- `postgres` → votre utilisateur PostgreSQL (généralement `postgres`)
- `VOTRE_MOT_DE_PASSE` → votre mot de passe PostgreSQL
- `localhost:5432` → votre host et port (généralement `localhost:5432`)
- `villa_first_v2` → le nom de votre base de données

---

### Étape 3 : Générer NEXTAUTH_SECRET (optionnel mais recommandé)

Générez un secret pour NextAuth :

**Windows (PowerShell) :**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Mac/Linux :**
```bash
openssl rand -base64 32
```

Copiez le résultat et collez-le dans `.env.local` :

```env
NEXTAUTH_SECRET="votre-secret-genere-ici"
```

---

### Étape 4 : Vérifier le fichier

Votre `.env.local` devrait ressembler à ceci :

```env
# Database
DATABASE_URL="postgresql://postgres:monmotdepasse@localhost:5432/villa_first_v2?schema=public"

# NextAuth
NEXTAUTH_SECRET="votre-secret-genere-ici"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (optionnel pour le seed)
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Redis (optionnel)
REDIS_URL=""

# Encryption (optionnel pour le seed)
ENCRYPTION_KEY=""
```

---

### Étape 5 : Réessayer le seed

```bash
npm run seed
```

---

## ✅ Vérification

Si tout fonctionne, vous devriez voir :

```
📄 Chargement de .env.local...
✅ DATABASE_URL trouvée
🌱 Démarrage du seed de la base de données...

👤 Création des utilisateurs hôtes...
  ✅ Créé: host1@test.com
  ...
```

---

## ❌ Si ça ne fonctionne toujours pas

### Vérifiez que PostgreSQL est démarré

**Windows :**
- Vérifiez dans les services Windows que PostgreSQL est en cours d'exécution
- Ou démarrez-le manuellement depuis le menu Démarrer

**Mac/Linux :**
```bash
# Vérifier si PostgreSQL tourne
pg_isready

# Ou démarrer PostgreSQL
brew services start postgresql  # Mac avec Homebrew
sudo systemctl start postgresql  # Linux
```

---

### Vérifiez que la base de données existe

Connectez-vous à PostgreSQL et créez la base si nécessaire :

```bash
psql -U postgres
```

Puis dans psql :

```sql
CREATE DATABASE villa_first_v2;
\q
```

---

### Vérifiez les migrations Prisma

Assurez-vous que les migrations sont appliquées :

```bash
npx prisma migrate dev
```

---

## 📝 Emplacement du fichier

Le fichier `.env.local` doit être à la **racine du projet** :

```
Villa first v2/
├── .env.local  ← ICI
├── .env.example
├── package.json
├── scripts/
│   └── seed.ts
└── ...
```

---

## 🔒 Sécurité

⚠️ **IMPORTANT :** Le fichier `.env.local` contient des informations sensibles (mots de passe, secrets). 

- ✅ Il est déjà dans `.gitignore` (ne sera pas commité)
- ❌ Ne le partagez JAMAIS publiquement
- ❌ Ne le commitez JAMAIS dans Git

---

## 💡 Besoin d'aide ?

Si vous rencontrez toujours des problèmes :

1. Vérifiez les logs du script pour voir l'erreur exacte
2. Vérifiez que PostgreSQL est accessible avec les identifiants fournis
3. Vérifiez que la base de données existe et que les migrations sont appliquées
