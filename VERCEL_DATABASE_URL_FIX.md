# 🔧 Correction de l'erreur DATABASE_URL sur Vercel

**Erreur :** `P1013: The provided database string is invalid. The scheme is not recognized`

---

## 🔍 Problème

L'URL de la base de données (`DATABASE_URL`) sur Vercel n'est pas au bon format pour Prisma.

---

## ✅ Solution : Vérifier et corriger DATABASE_URL

### Étape 1 : Vérifier l'URL actuelle sur Vercel

1. Va sur **Vercel Dashboard** → Ton projet → **Settings** → **Environment Variables**
2. Trouve la variable `DATABASE_URL`
3. **Regarde le format** de l'URL

---

### Étape 2 : Format attendu

L'URL doit être au format :

```
postgresql://user:password@host:port/database?schema=public
```

ou

```
postgres://user:password@host:port/database?schema=public
```

---

### Étape 3 : Si tu utilises Vercel Postgres

1. Va sur **Vercel Dashboard** → Ton projet → **Storage**
2. Clique sur ta base de données PostgreSQL
3. Va dans l'onglet **.env.local** ou **Connection String**
4. **Copie l'URL complète** qui ressemble à :

```
postgres://default:xxxxx@xxxxx.postgres.vercel-storage.com:5432/verceldb
```

5. **Ajoute `?schema=public` à la fin** si ce n'est pas déjà présent :

```
postgres://default:xxxxx@xxxxx.postgres.vercel-storage.com:5432/verceldb?schema=public
```

6. **Colle cette URL complète** dans la variable `DATABASE_URL` sur Vercel

---

### Étape 4 : Si tu utilises un service externe (Supabase, Neon, etc.)

1. Va sur le dashboard de ton service
2. Trouve la **Connection String** ou **Database URL**
3. **Assure-toi qu'elle commence par `postgresql://` ou `postgres://`**
4. **Assure-toi qu'elle contient `?schema=public` à la fin**

**Exemple Supabase :**
```
postgresql://postgres.xxxxx:password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?schema=public
```

**Exemple Neon :**
```
postgresql://user:password@xxxxx.neon.tech/dbname?sslmode=require&schema=public
```

---

### Étape 5 : Caractères spéciaux dans le mot de passe

Si ton mot de passe contient des caractères spéciaux (`@`, `#`, `%`, etc.), ils doivent être **encodés en URL** :

- `@` devient `%40`
- `#` devient `%23`
- `%` devient `%25`
- `&` devient `%26`
- etc.

**Exemple :**
- Mot de passe : `P@ssw0rd#123`
- Encodé : `P%40ssw0rd%23123`

---

### Étape 6 : Vérifier après modification

1. **Sauvegarde** la variable sur Vercel
2. **Redeploy** ton projet (ou fais un nouveau push)
3. Vérifie les logs de build pour confirmer que l'erreur a disparu

---

## 🚨 Erreurs courantes

### ❌ Mauvaise URL
```
postgres://user:password@host:5432/db  (manque ?schema=public)
```

### ✅ Bonne URL
```
postgresql://user:password@host:5432/db?schema=public
```

---

### ❌ URL avec caractères spéciaux non encodés
```
postgresql://user:P@ss#123@host:5432/db?schema=public
```

### ✅ URL avec caractères spéciaux encodés
```
postgresql://user:P%40ss%23123@host:5432/db?schema=public
```

---

## 💡 Astuce : Tester l'URL localement

Tu peux tester si ton URL fonctionne avec Prisma en local :

1. Crée un fichier `.env.local` avec :
   ```
   DATABASE_URL="ton-url-complete"
   ```

2. Lance :
   ```bash
   npx prisma migrate deploy
   ```

Si ça fonctionne en local, l'URL est correcte. Copie-la exactement sur Vercel.

---

**Une fois corrigée, le build devrait fonctionner ! 🚀**
