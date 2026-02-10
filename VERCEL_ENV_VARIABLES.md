# 🔐 Variables d'environnement pour Vercel

**Guide étape par étape pour configurer les variables sur Vercel**

---

## ✅ Variables OBLIGATOIRES (minimum pour que ça fonctionne)

### 1. `DATABASE_URL` ⚠️ **CRITIQUE**

**Description :** URL de connexion à ta base de données PostgreSQL

**Comment l'obtenir :**

#### Option A : Vercel Postgres (Recommandé)
1. Dans ton projet Vercel → **Storage** → **Create Database**
2. Choisis **Postgres**
3. Vercel génère automatiquement `POSTGRES_URL`
4. **Copie cette valeur** et utilise-la comme `DATABASE_URL`

#### Option B : Service externe (Supabase, Neon, Railway, etc.)
1. Crée une base PostgreSQL sur le service de ton choix
2. Récupère l'URL de connexion (format : `postgresql://user:password@host:5432/dbname?schema=public`)
3. Utilise cette URL comme `DATABASE_URL`

**Format attendu :**
```
postgresql://user:password@host:5432/dbname?schema=public
```

---

### 2. `NEXTAUTH_SECRET` ⚠️ **CRITIQUE**

**Description :** Secret pour signer les tokens JWT de NextAuth

**Comment le générer :**

#### Sur Windows PowerShell :
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
```

#### Ou utilise un générateur en ligne :
https://generate-secret.vercel.app/32

**Exemple de valeur générée :**
```
aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5zA7bC9dE1fG3hI5jK7lM9nO1pQ3
```

⚠️ **Important :** Garde cette valeur secrète et ne la partage jamais publiquement.

---

### 3. `NEXTAUTH_URL` ⚠️ **CRITIQUE**

**Description :** URL publique de ton application Vercel

**Comment l'obtenir :**

1. Après le premier déploiement sur Vercel, tu auras une URL comme :
   - `https://villa-first-v2.vercel.app` (par défaut)
   - Ou `https://villa-first-v2-[ton-nom].vercel.app`

2. **Utilise cette URL exacte** comme valeur pour `NEXTAUTH_URL`

**Exemple :**
```
https://villa-first-v2.vercel.app
```

⚠️ **Note :** Si tu changes de domaine plus tard, n'oublie pas de mettre à jour cette variable.

---

## 🔧 Variables OPTIONNELLES (selon les fonctionnalités)

### 4. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (Optionnel)

**Description :** Clé publique Stripe pour les paiements côté client

**Quand l'ajouter :** Si tu veux activer les paiements réels (pas la simulation)

**Comment l'obtenir :**
1. Va sur https://dashboard.stripe.com/apikeys
2. Connecte-toi ou crée un compte
3. Copie la **Publishable key** (commence par `pk_`)

**Exemple :**
```
pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890...
```

---

### 5. `STRIPE_SECRET_KEY` (Optionnel)

**Description :** Clé secrète Stripe pour les paiements côté serveur

**Quand l'ajouter :** Si tu veux activer les paiements réels

**Comment l'obtenir :**
1. Va sur https://dashboard.stripe.com/apikeys
2. Copie la **Secret key** (commence par `sk_`)

**Exemple :**
```
sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890...
```

⚠️ **Important :** Ne partage jamais cette clé publiquement. Elle permet de faire des paiements.

---

### 6. `STRIPE_WEBHOOK_SECRET` (Optionnel)

**Description :** Secret pour vérifier les webhooks Stripe

**Quand l'ajouter :** Si tu utilises les webhooks Stripe pour les notifications de paiement

**Comment l'obtenir :**
1. Va sur https://dashboard.stripe.com/webhooks
2. Crée un endpoint webhook
3. Copie le **Signing secret** (commence par `whsec_`)

---

### 7. `REDIS_URL` (Optionnel)

**Description :** URL de connexion Redis (pour cache/sessions)

**Quand l'ajouter :** Si tu utilises Redis dans ton application

**Format :**
```
redis://user:password@host:6379
```

---

### 8. `ENCRYPTION_KEY` (Optionnel)

**Description :** Clé de chiffrement pour les données KYC sensibles

**Quand l'ajouter :** Si tu utilises le stockage sécurisé KYC

**Comment la générer :**
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
```

**Longueur :** 32 caractères minimum

---

## 📝 Instructions pour ajouter les variables sur Vercel

### Étape 1 : Accéder aux variables d'environnement

1. Va sur https://vercel.com/dashboard
2. Clique sur ton projet `villa-first-v2`
3. Va dans **Settings** → **Environment Variables**

### Étape 2 : Ajouter chaque variable

Pour chaque variable :

1. Clique sur **Add New**
2. Dans **Key**, entre le nom exact (ex: `DATABASE_URL`)
3. Dans **Value**, colle la valeur
4. Coche les environnements où tu veux l'utiliser :
   - ✅ **Production** (pour le site en ligne)
   - ✅ **Preview** (pour les previews de branches)
   - ✅ **Development** (pour les déploiements de dev)

5. Clique sur **Save**

### Étape 3 : Vérifier

Après avoir ajouté toutes les variables obligatoires :

1. Va dans **Deployments**
2. Clique sur **Redeploy** sur le dernier déploiement
3. Ou fais un nouveau push sur GitHub pour déclencher un nouveau déploiement

---

## ✅ Checklist minimale pour démarrer

Pour que l'application fonctionne **sans paiements**, tu as besoin de :

- [ ] `DATABASE_URL` (obligatoire)
- [ ] `NEXTAUTH_SECRET` (obligatoire)
- [ ] `NEXTAUTH_URL` (obligatoire - après le premier déploiement)

**Les autres variables sont optionnelles** et peuvent être ajoutées plus tard.

---

## 🚨 Ordre recommandé

1. **Premier déploiement** avec seulement `DATABASE_URL` et `NEXTAUTH_SECRET`
2. **Récupère l'URL** de ton app Vercel (ex: `https://villa-first-v2.vercel.app`)
3. **Ajoute `NEXTAUTH_URL`** avec cette URL
4. **Redeploy** pour que ça prenne effet
5. **Ajoute les autres variables** (Stripe, etc.) selon tes besoins

---

## 💡 Astuce : Import depuis .env

Si tu as un fichier `.env.local` local, tu peux :

1. Sur Vercel → **Environment Variables**
2. Clique sur **Import .env**
3. Colle le contenu de ton `.env.local` (sans les valeurs sensibles si tu partages l'écran)
4. Vérifie et ajuste les valeurs pour la production

⚠️ **Attention :** Assure-toi que les valeurs locales sont adaptées à la production (URLs, clés API, etc.)

---

**Une fois configuré, ton application devrait se déployer correctement ! 🚀**
