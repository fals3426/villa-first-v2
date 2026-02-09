# Installation PostgreSQL - Guide Rapide

## 🎯 Situation Actuelle

PostgreSQL n'est pas installé sur votre machine. Vous devez l'installer pour que le script de seed fonctionne.

---

## 🚀 Option 1 : Installation PostgreSQL Standard (Recommandée)

### Étape 1 : Télécharger PostgreSQL

1. Allez sur : https://www.postgresql.org/download/windows/
2. Cliquez sur "Download the installer"
3. Téléchargez la dernière version (ex: PostgreSQL 16.x)

### Étape 2 : Installer PostgreSQL

1. **Lancez l'installateur**
2. **Choisissez les options suivantes :**
   - Installation Directory : Par défaut (`C:\Program Files\PostgreSQL\16`)
   - Data Directory : Par défaut (`C:\Program Files\PostgreSQL\16\data`)
   - Password : **Notez ce mot de passe !** (ex: `postgres` ou votre mot de passe personnalisé)
   - Port : `5432` (par défaut)
   - Locale : Par défaut

3. **Composants à installer :**
   - ✅ PostgreSQL Server
   - ✅ pgAdmin 4 (interface graphique - recommandé)
   - ✅ Stack Builder (optionnel)
   - ✅ Command Line Tools

4. **Terminez l'installation**

### Étape 3 : Vérifier l'Installation

**Via PowerShell :**
```powershell
# Vérifier que le service est démarré
Get-Service -Name "*postgres*"

# Tester la connexion
psql -U postgres -c "SELECT version();"
```

**Via pgAdmin :**
1. Ouvrez pgAdmin 4 depuis le menu Démarrer
2. Connectez-vous avec le mot de passe défini lors de l'installation
3. Vous devriez voir le serveur PostgreSQL

### Étape 4 : Mettre à Jour .env.local

Ouvrez `.env.local` et modifiez `DATABASE_URL` avec le mot de passe que vous avez défini :

```env
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/villa_first_v2?schema=public"
```

### Étape 5 : Créer la Base de Données

**Via pgAdmin :**
1. Clic droit sur "Databases" → "Create" → "Database"
2. Nom : `villa_first_v2`
3. Cliquez sur "Save"

**Via PowerShell :**
```powershell
psql -U postgres -c "CREATE DATABASE villa_first_v2;"
```

### Étape 6 : Appliquer les Migrations Prisma

```bash
npx prisma migrate dev
```

### Étape 7 : Exécuter le Seed

```bash
npm run seed
```

---

## 🐳 Option 2 : Installation via Docker (Alternative)

Si vous avez Docker installé, vous pouvez utiliser PostgreSQL dans un conteneur :

### Étape 1 : Créer un Fichier docker-compose.yml

À la racine du projet :

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16
    container_name: villa-first-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: villa_first_v2
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Étape 2 : Démarrer PostgreSQL

```bash
docker-compose up -d
```

### Étape 3 : Vérifier que c'est Démarré

```bash
docker ps
```

Vous devriez voir le conteneur `villa-first-postgres` en cours d'exécution.

### Étape 4 : Mettre à Jour .env.local

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/villa_first_v2?schema=public"
```

### Étape 5 : Appliquer les Migrations et Exécuter le Seed

```bash
npx prisma migrate dev
npm run seed
```

---

## ☁️ Option 3 : Base de Données Cloud (Alternative)

Si vous préférez utiliser une base de données cloud :

### Services Recommandés :
- **Supabase** (gratuit) : https://supabase.com
- **Neon** (gratuit) : https://neon.tech
- **Railway** (gratuit avec limites) : https://railway.app

### Étapes Générales :
1. Créez un compte sur l'un de ces services
2. Créez une nouvelle base de données PostgreSQL
3. Récupérez l'URL de connexion (format : `postgresql://user:password@host:port/database`)
4. Mettez à jour `DATABASE_URL` dans `.env.local`
5. Exécutez les migrations et le seed

---

## ✅ Vérification Post-Installation

Une fois PostgreSQL installé et démarré, vérifiez :

```powershell
# Vérifier le service
Get-Service -Name "*postgres*"

# Tester la connexion
psql -U postgres -c "SELECT version();"

# Vérifier que la base existe
psql -U postgres -l | Select-String "villa_first_v2"
```

---

## 🎉 Résultat Attendu

Après l'installation et la configuration, `npm run seed` devrait fonctionner :

```
✅ DATABASE_URL trouvée
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

## 💡 Recommandation

Pour un développement local, je recommande **l'Option 1 (Installation Standard)** car :
- ✅ Facile à installer et configurer
- ✅ pgAdmin fournit une interface graphique pratique
- ✅ Intégration native avec Windows
- ✅ Pas besoin de Docker

---

**Besoin d'aide ?** Si vous rencontrez des problèmes lors de l'installation, dites-moi à quelle étape vous êtes bloqué !
