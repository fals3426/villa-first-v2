# 🔍 Diagnostic : Problème de création de compte sur Vercel

---

## 📋 Informations à vérifier

### 1. Logs complets du build

Dans les logs de déploiement Vercel, cherche ces lignes :

```
> prisma migrate deploy
```

**Ce que tu dois voir :**
- ✅ `✔ Applied migration: 20260122000000_add_user_model` (ou similaire)
- ✅ `All migrations have been successfully applied.`

**Si tu vois une erreur :**
- ❌ `Error: P1001: Can't reach database server`
- ❌ `Error: P1013: The provided database string is invalid`
- ❌ `No migrations found`

---

### 2. Logs runtime de l'API

Quand tu essaies de créer un compte, va sur Vercel → **Deployments** → **Functions** → Cherche `/api/auth/register`

**Ou dans les logs en temps réel :**
1. Va sur Vercel → Ton projet → **Logs** (onglet en haut)
2. Essaie de créer un compte
3. Regarde les erreurs qui apparaissent

---

## 🔧 Solutions possibles

### Solution 1 : Les migrations n'ont pas été exécutées

**Symptôme :** Le build réussit mais la création de compte échoue avec une erreur de table manquante.

**Vérification :**
Dans les logs de build, cherche :
```
> prisma migrate deploy
```

Si tu ne vois **PAS** cette ligne ou si elle échoue, les tables n'existent pas.

**Solution :**
1. Va sur Vercel → **Storage** → Ta base PostgreSQL
2. Vérifie que la base existe et est accessible
3. Vérifie que `DATABASE_URL` est correcte (commence par `postgres://` ou `postgresql://`)
4. Redéploie

---

### Solution 2 : Erreur de connexion à la base de données

**Symptôme :** Erreur `P1001` ou `ECONNREFUSED` dans les logs.

**Solution :**
1. Vérifie que `DATABASE_URL` est correcte sur Vercel
2. Vérifie que la base PostgreSQL est bien créée et accessible
3. Si tu utilises Vercel Postgres, assure-toi qu'elle est bien liée au projet

---

### Solution 3 : Tables manquantes

**Symptôme :** Erreur `relation "User" does not exist` ou similaire.

**Solution :**
Les migrations n'ont pas été appliquées. Tu dois les exécuter manuellement :

1. **Option A : Via Vercel CLI (recommandé)**
   ```bash
   # Installe Vercel CLI si pas déjà fait
   npm i -g vercel
   
   # Connecte-toi
   vercel login
   
   # Exécute les migrations
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

2. **Option B : Via un script de build amélioré**
   On peut modifier le script pour mieux gérer les erreurs de migration.

---

### Solution 4 : Vérifier manuellement les tables

**Via Prisma Studio en local :**
1. Récupère `DATABASE_URL` depuis Vercel
2. Crée un `.env.local` avec cette URL
3. Lance `npx prisma studio`
4. Vérifie que les tables existent (User, Listing, Booking, etc.)

---

## 🚨 Erreurs courantes et solutions

### Erreur : "relation \"User\" does not exist"

**Cause :** Les migrations n'ont pas été exécutées.

**Solution :** Exécute `prisma migrate deploy` manuellement ou vérifie que le script de build l'exécute.

---

### Erreur : "EMAIL_ALREADY_EXISTS"

**Cause :** L'email existe déjà dans la base.

**Solution :** Utilise un autre email ou supprime l'utilisateur existant via Prisma Studio.

---

### Erreur : "DATABASE_ERROR" ou "Erreur de connexion à la base de données"

**Cause :** La base de données n'est pas accessible.

**Solution :**
1. Vérifie `DATABASE_URL` sur Vercel
2. Vérifie que la base PostgreSQL est bien créée
3. Vérifie les permissions de connexion

---

## 📝 Checklist de diagnostic

- [ ] Le build réussit sans erreur
- [ ] Les logs montrent `prisma migrate deploy` avec succès
- [ ] Les tables existent dans la base (vérifier via Prisma Studio)
- [ ] `DATABASE_URL` est correcte sur Vercel
- [ ] Les logs runtime montrent l'erreur exacte lors de la création de compte

---

**Envoie-moi les logs complets du build et les logs runtime de l'API pour que je puisse t'aider plus précisément !**
