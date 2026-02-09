# Dépannage : Erreur ECONNREFUSED - PostgreSQL non accessible

## ✅ Problème Résolu : Chargement des Variables d'Environnement

Le script charge maintenant correctement `DATABASE_URL` depuis `.env.local` ! 

## ❌ Nouveau Problème : PostgreSQL Non Accessible

L'erreur `ECONNREFUSED` signifie que PostgreSQL n'est pas démarré ou n'est pas accessible sur `localhost:5432`.

---

## 🔍 Diagnostic

### Étape 1 : Vérifier si PostgreSQL est démarré

**Windows (PowerShell) :**
```powershell
Get-Service -Name "*postgres*"
```

**Ou via les Services Windows :**
1. Appuyez sur `Win + R`
2. Tapez `services.msc` et appuyez sur Entrée
3. Cherchez "PostgreSQL" dans la liste
4. Vérifiez que le statut est "En cours d'exécution"

---

### Étape 2 : Démarrer PostgreSQL

**Via PowerShell (en tant qu'administrateur) :**
```powershell
# Trouver le nom exact du service
Get-Service -Name "*postgres*"

# Démarrer le service (remplacez "postgresql-x64-XX" par le nom trouvé)
Start-Service -Name "postgresql-x64-XX"
```

**Via les Services Windows :**
1. Ouvrez `services.msc`
2. Trouvez le service PostgreSQL
3. Clic droit → "Démarrer"

**Via pgAdmin :**
1. Ouvrez pgAdmin
2. Si le serveur n'apparaît pas, PostgreSQL n'est probablement pas démarré

---

### Étape 3 : Tester la Connexion

**Via PowerShell :**
```powershell
# Tester la connexion avec psql
psql -U postgres -h localhost -p 5432 -c "SELECT version();"
```

Si cela fonctionne, vous devriez voir la version de PostgreSQL.

---

### Étape 4 : Vérifier le Port

Par défaut, PostgreSQL écoute sur le port `5432`. Si vous utilisez un autre port :

1. Vérifiez dans pgAdmin → Serveur → Propriétés → Connexion → Port
2. Mettez à jour `DATABASE_URL` dans `.env.local` avec le bon port

---

## 🚀 Solutions Rapides

### Solution 1 : Démarrer PostgreSQL via pgAdmin

1. Ouvrez pgAdmin
2. Si le serveur apparaît mais est grisé, cliquez dessus pour le démarrer
3. Ou créez un nouveau serveur si nécessaire

### Solution 2 : Démarrer PostgreSQL via Services Windows

1. `Win + R` → `services.msc`
2. Trouvez "PostgreSQL Server XX"
3. Clic droit → "Démarrer"

### Solution 3 : Redémarrer PostgreSQL

```powershell
# En tant qu'administrateur
Restart-Service -Name "postgresql-x64-XX"
```

---

## ✅ Vérification

Une fois PostgreSQL démarré, réessayez :

```bash
npm run seed
```

Vous devriez voir :
```
✅ DATABASE_URL trouvée
🌱 Démarrage du seed de la base de données...
👤 Création des utilisateurs hôtes...
  ✅ Créé: host1@test.com
  ...
```

---

## 🔧 Si PostgreSQL N'est Pas Installé

Si PostgreSQL n'est pas installé sur votre machine :

1. **Téléchargez PostgreSQL :** https://www.postgresql.org/download/windows/
2. **Installez-le** avec les options par défaut
3. **Notez le mot de passe** que vous définissez pour l'utilisateur `postgres`
4. **Mettez à jour** `.env.local` avec ce mot de passe
5. **Réessayez** `npm run seed`

---

## 💡 Alternative : Utiliser une Base de Données Distante

Si vous préférez utiliser une base de données PostgreSQL distante (cloud) :

1. Obtenez les informations de connexion (host, port, user, password, database)
2. Mettez à jour `DATABASE_URL` dans `.env.local` :
   ```env
   DATABASE_URL="postgresql://user:password@host.distant.com:5432/database?schema=public"
   ```

---

## 📝 Résumé

| Problème | Solution |
|----------|----------|
| ✅ Variables d'environnement | **Résolu** - Le wrapper charge correctement `.env.local` |
| ❌ PostgreSQL non démarré | **À faire** - Démarrer le service PostgreSQL |
| ❌ Port incorrect | **À vérifier** - Vérifier le port dans pgAdmin |
| ❌ PostgreSQL non installé | **À installer** - Installer PostgreSQL |

Une fois PostgreSQL démarré, le script de seed devrait fonctionner ! 🎉
