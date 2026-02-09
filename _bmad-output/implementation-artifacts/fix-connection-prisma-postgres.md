# 🔧 Correction Définitive - Connexion Prisma Postgres

**Date :** 2026-01-23  
**Problème :** L'URL `prisma+postgres://` n'est pas compatible avec `@prisma/adapter-pg`

---

## 🐛 Problème Identifié

L'erreur "Connection terminated unexpectedly" était causée par l'incompatibilité entre :
- L'URL `prisma+postgres://localhost:51213/...` (format Prisma Postgres)
- L'adapter `@prisma/adapter-pg` qui attend une URL PostgreSQL standard

L'adapter PrismaPg ne peut pas gérer les URLs `prisma+postgres://` car elles nécessitent un client HTTP spécial, pas une connexion TCP directe.

---

## ✅ Solution Appliquée

### Changement de l'URL de Connexion

**Avant (`.env`) :**
```env
DATABASE_URL="prisma+postgres://localhost:51213/?api_key=..."
```

**Après (`.env`) :**
```env
DATABASE_URL="postgres://postgres:postgres@localhost:51214/template1?sslmode=disable"
```

**Explication :**
- Utilisation de l'URL TCP directe fournie par Prisma Postgres
- Port `51214` (port TCP, pas le port API `51213`)
- Base de données `template1` (base par défaut de Prisma Postgres)
- Credentials : `postgres:postgres` (par défaut pour Prisma Postgres local)

---

## 🔄 Étapes pour Appliquer la Correction

### 1. Vérifier que Prisma Postgres est en cours d'exécution

```bash
npx prisma dev ls
```

Vous devriez voir :
```
name     status   urls
default  running  DATABASE_URL: prisma+postgres://...
                   TCP: postgres://postgres:postgres@localhost:51214/...
```

### 2. Le fichier `.env` a déjà été mis à jour

L'URL a été changée pour utiliser l'URL TCP directe.

### 3. Redémarrer le serveur Next.js

**IMPORTANT :** Le serveur doit être redémarré pour prendre en compte le changement.

```bash
# Arrêter le serveur actuel (Ctrl+C)
# Puis redémarrer :
npm run dev
```

### 4. Tester la création de compte

1. Aller sur : http://localhost:3000/register
2. Remplir le formulaire
3. Cliquer sur "Créer mon compte"
4. ✅ Devrait fonctionner maintenant !

---

## 📊 Pourquoi cette Solution Fonctionne

### Prisma Postgres Fournit Deux URLs

1. **URL Prisma Postgres** (`prisma+postgres://...`) :
   - Pour les clients Prisma standard (sans adapter)
   - Utilise un protocole HTTP spécial
   - Port `51213`

2. **URL TCP PostgreSQL** (`postgres://...`) :
   - Pour les adapters comme `@prisma/adapter-pg`
   - Connexion TCP directe
   - Port `51214`

### Notre Configuration

Nous utilisons `@prisma/adapter-pg` avec un `Pool` de `pg`, donc nous devons utiliser l'URL TCP.

---

## ✅ Vérification

### Test de Connexion

```bash
# Tester la connexion
npx prisma db execute --stdin
# Taper : SELECT 1;
```

### Vérifier les Logs

Après redémarrage du serveur, les logs ne devraient plus afficher :
- ❌ "Connection terminated unexpectedly"
- ✅ Les requêtes devraient fonctionner normalement

---

## 🚨 Si le Problème Persiste

### Vérifier le Port

Si le port `51214` ne fonctionne pas, vérifier l'URL TCP dans :
```bash
npx prisma dev ls
```

Copier l'URL TCP exacte et la mettre dans `.env`.

### Vérifier que Prisma Postgres Tourne

```bash
# Redémarrer Prisma Postgres si nécessaire
npx prisma dev stop
npx prisma dev --detach
```

### Vérifier la Base de Données

Assurez-vous que la base de données `template1` existe :
```bash
# Se connecter avec psql
PGPASSWORD=postgres psql -h localhost -p 51214 -U postgres -d template1
```

---

## 📝 Notes Techniques

### Différence entre les Deux Formats

**Format Prisma Postgres :**
- Protocole : `prisma+postgres://`
- Nécessite un client HTTP spécial
- Utilisé par Prisma Client standard (sans adapter)

**Format PostgreSQL Standard :**
- Protocole : `postgres://` ou `postgresql://`
- Connexion TCP directe
- Utilisé par les adapters (`@prisma/adapter-pg`, etc.)

### Pourquoi Utiliser l'Adapter ?

L'adapter `@prisma/adapter-pg` permet :
- Meilleur contrôle du pool de connexions
- Gestion d'erreur plus fine
- Performance optimisée pour les environnements serverless

---

**Correction appliquée le :** 2026-01-23  
**Statut :** ✅ Correction définitive
