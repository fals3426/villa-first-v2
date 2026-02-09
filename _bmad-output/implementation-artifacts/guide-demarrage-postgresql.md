# Guide de Démarrage PostgreSQL

**Date :** 2026-01-23

---

## 🔍 Vérification de l'Installation

### Option 1 : Vérifier si PostgreSQL est installé

```powershell
# Vérifier les services PostgreSQL
Get-Service -Name "*postgresql*"

# Vérifier si PostgreSQL est dans le PATH
psql --version
```

---

## 🚀 Méthodes pour Démarrer PostgreSQL

### Méthode 1 : Via les Services Windows (Recommandé)

1. **Ouvrir les Services Windows :**
   - Appuyer sur `Windows + R`
   - Taper `services.msc` et appuyer sur Entrée
   - OU : Panneau de configuration → Outils d'administration → Services

2. **Trouver le service PostgreSQL :**
   - Chercher "postgresql" dans la liste
   - Le nom peut varier : `postgresql-x64-XX` ou `PostgreSQL XX`

3. **Démarrer le service :**
   - Clic droit sur le service → "Démarrer"
   - OU : Double-clic → Bouton "Démarrer"

4. **Vérifier le statut :**
   - Le statut doit passer à "En cours d'exécution"

---

### Méthode 2 : Via PowerShell (Administrateur)

```powershell
# Démarrer le service PostgreSQL (remplacer XX par votre version)
Start-Service postgresql-x64-XX

# OU si le nom est différent
Start-Service -Name "PostgreSQL*"

# Vérifier le statut
Get-Service -Name "*postgresql*"
```

---

### Méthode 3 : Via Ligne de Commande (si installé localement)

```powershell
# Naviguer vers le dossier d'installation PostgreSQL
cd "C:\Program Files\PostgreSQL\XX\bin"

# Démarrer le serveur
pg_ctl start -D "C:\Program Files\PostgreSQL\XX\data"
```

**Note :** Remplacez `XX` par votre version de PostgreSQL (ex: 15, 16, etc.)

---

### Méthode 4 : Utiliser Docker (Alternative Simple)

Si PostgreSQL n'est pas installé localement, vous pouvez utiliser Docker :

```powershell
# 1. Vérifier que Docker est installé
docker --version

# 2. Démarrer un conteneur PostgreSQL
docker run --name postgres-villa-first `
  -e POSTGRES_PASSWORD=password `
  -e POSTGRES_DB=villa_first_v2 `
  -p 5432:5432 `
  -d postgres:latest

# 3. Vérifier que le conteneur est démarré
docker ps
```

**Mettre à jour `.env.local` :**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/villa_first_v2?schema=public"
```

---

## 🔧 Configuration de la Connexion

### Vérifier le Port

D'après vos fichiers de configuration :
- `.env` : Utilise `prisma+postgres://localhost:51213/...` (Prisma Postgres)
- `.env.local` : Utilise `postgresql://...@localhost:5432/...` (PostgreSQL standard)

**Ports possibles :**
- `5432` : Port par défaut PostgreSQL
- `51213` / `51214` : Ports Prisma Postgres (si vous utilisez `prisma dev`)

### Mettre à jour `.env.local`

Si vous utilisez PostgreSQL standard :
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/villa_first_v2?schema=public"
```

Si vous utilisez Prisma Postgres :
```env
DATABASE_URL="prisma+postgres://localhost:51213/?api_key=..."
```

---

## ✅ Vérifier que PostgreSQL est Démarré

### Test 1 : Via PowerShell

```powershell
# Tester la connexion
Test-NetConnection -ComputerName localhost -Port 5432
```

### Test 2 : Via Prisma

```powershell
# Vérifier la connexion
npx prisma db pull

# OU vérifier l'état des migrations
npx prisma migrate status
```

### Test 3 : Via psql (si installé)

```powershell
psql -U postgres -h localhost -p 5432 -d villa_first_v2
```

---

## 🐳 Option Docker (Recommandé si PostgreSQL n'est pas installé)

### Installation Docker Desktop

1. Télécharger Docker Desktop : https://www.docker.com/products/docker-desktop
2. Installer et démarrer Docker Desktop
3. Vérifier : `docker --version`

### Démarrer PostgreSQL avec Docker

```powershell
# Créer et démarrer le conteneur
docker run --name postgres-villa-first `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=password `
  -e POSTGRES_DB=villa_first_v2 `
  -p 5432:5432 `
  -d postgres:16-alpine

# Vérifier que le conteneur tourne
docker ps

# Voir les logs
docker logs postgres-villa-first
```

### Arrêter/Démarrer le conteneur

```powershell
# Arrêter
docker stop postgres-villa-first

# Démarrer
docker start postgres-villa-first

# Supprimer (si besoin de recommencer)
docker rm postgres-villa-first
```

---

## 🔍 Dépannage

### Erreur : "Service not found"

**Solution :** PostgreSQL n'est peut-être pas installé. Options :
1. Installer PostgreSQL : https://www.postgresql.org/download/windows/
2. OU utiliser Docker (plus simple)

### Erreur : "Port already in use"

**Solution :** Un autre service utilise le port
```powershell
# Trouver quel processus utilise le port
netstat -ano | findstr :5432

# Tuer le processus (remplacer PID par le numéro trouvé)
taskkill /PID <PID> /F
```

### Erreur : "Authentication failed"

**Solution :** Vérifier les credentials dans `.env.local`
- User : généralement `postgres`
- Password : celui défini lors de l'installation
- Database : `villa_first_v2`

---

## 📝 Commandes Utiles

```powershell
# Vérifier les services PostgreSQL
Get-Service -Name "*postgresql*"

# Démarrer le service
Start-Service postgresql-x64-XX

# Arrêter le service
Stop-Service postgresql-x64-XX

# Redémarrer le service
Restart-Service postgresql-x64-XX

# Vérifier le statut
Get-Service postgresql-x64-XX | Select-Object Status
```

---

## ✅ Checklist de Vérification

- [ ] PostgreSQL est installé OU Docker est installé
- [ ] Le service PostgreSQL est démarré (statut "En cours d'exécution")
- [ ] Le port 5432 (ou 51213/51214) est accessible
- [ ] Le fichier `.env.local` contient la bonne `DATABASE_URL`
- [ ] La commande `npx prisma db pull` fonctionne
- [ ] La commande `npx prisma migrate status` fonctionne

---

**Guide créé le :** 2026-01-23
