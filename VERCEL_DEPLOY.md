# 🚀 Guide de déploiement sur Vercel

**Date :** 2026-01-31  
**Projet :** Villa first v2

---

## ✅ Correction appliquée

Le script `postinstall` a été ajouté dans `package.json` pour générer automatiquement Prisma Client lors du build sur Vercel.

---

## 📋 Variables d'environnement à configurer sur Vercel

### 1. Accéder aux variables d'environnement

1. Va sur ton projet Vercel : https://vercel.com/dashboard
2. Clique sur ton projet `villa-first-v2`
3. Va dans **Settings** → **Environment Variables**

---

### 2. Variables obligatoires

Ajoute ces variables **pour Production, Preview et Development** :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql://user:password@host:5432/dbname?schema=public` |
| `NEXTAUTH_SECRET` | Secret pour NextAuth (génère-en un) | Utilise : `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL de ton app Vercel | `https://ton-app.vercel.app` |

---

### 3. Variables optionnelles (selon fonctionnalités)

| Variable | Quand l'ajouter | Description |
|----------|----------------|-------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Si tu veux les paiements | Clé publique Stripe |
| `STRIPE_SECRET_KEY` | Si tu veux les paiements | Clé secrète Stripe |
| `STRIPE_WEBHOOK_SECRET` | Si tu veux les webhooks Stripe | Secret webhook Stripe |
| `REDIS_URL` | Si tu utilises Redis | URL Redis (optionnel) |
| `ENCRYPTION_KEY` | Pour KYC sécurisé | Clé de chiffrement (32 caractères) |

---

## 🔧 Générer NEXTAUTH_SECRET

Sur Windows PowerShell :

```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
```

Ou utilise un générateur en ligne : https://generate-secret.vercel.app/32

---

## 🗄️ Configuration de la base de données PostgreSQL

Vercel ne fournit pas PostgreSQL par défaut. Tu dois :

### Option 1 : Vercel Postgres (recommandé)

1. Dans ton projet Vercel → **Storage** → **Create Database**
2. Choisis **Postgres**
3. Vercel génère automatiquement `POSTGRES_URL` → utilise-la comme `DATABASE_URL`

### Option 2 : Service externe (Supabase, Neon, Railway, etc.)

1. Crée une base PostgreSQL sur le service de ton choix
2. Récupère l'URL de connexion
3. Ajoute-la comme `DATABASE_URL` dans Vercel

---

## 📝 Étapes de déploiement

### 1. Push les changements

```bash
cd "c:\Users\Falsone\Desktop\Villa first v2"
git add .
git commit -m "Fix: Add postinstall script for Prisma Client generation"
git push origin main
```

### 2. Vercel détecte automatiquement le push

Vercel va :
- ✅ Installer les dépendances (`npm install`)
- ✅ Exécuter `postinstall` → génère Prisma Client
- ✅ Lancer `npm run build`
- ✅ Déployer l'application

### 3. Configurer les variables d'environnement

Avant le premier déploiement réussi, configure au minimum :
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (URL de ton app Vercel)

---

## 🔍 Vérification du build

Après le push, vérifie les logs de build sur Vercel :

1. Va sur ton projet → **Deployments**
2. Clique sur le dernier déploiement
3. Vérifie les logs :
   - ✅ `Running "npm run postinstall"` ou `prisma generate`
   - ✅ `Creating an optimized production build...`
   - ✅ `Build completed`

---

## ⚠️ Problèmes courants

### Erreur : "Module not found: Can't resolve '.prisma/client'"

**Solution :** Le script `postinstall` a été ajouté. Vérifie qu'il est bien dans `package.json` :

```json
"scripts": {
  "postinstall": "prisma generate",
  ...
}
```

### Erreur : "DATABASE_URL is not set"

**Solution :** Ajoute `DATABASE_URL` dans les variables d'environnement Vercel.

### Erreur : "NEXTAUTH_SECRET is not set"

**Solution :** Génère un secret et ajoute-le dans Vercel.

---

## 🎯 Checklist avant déploiement

- [x] Script `postinstall` ajouté dans `package.json`
- [ ] Variables d'environnement configurées sur Vercel
- [ ] Base de données PostgreSQL accessible depuis Vercel
- [ ] `NEXTAUTH_URL` = URL de ton app Vercel (ex: `https://villa-first-v2.vercel.app`)
- [ ] Push les changements vers GitHub

---

**Une fois configuré, Vercel déploiera automatiquement à chaque push sur `main` ! 🚀**
