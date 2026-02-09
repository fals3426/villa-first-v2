# 🔧 Correction - Problème de Lock Next.js

**Date :** 2026-01-23  
**Problème :** "Unable to acquire lock" - Le serveur Next.js ne peut pas démarrer

---

## 🐛 Problème Identifié

L'erreur `Unable to acquire lock at .next\dev\lock` indique qu'une instance précédente du serveur Next.js est toujours en cours d'exécution et bloque le démarrage d'une nouvelle instance.

**Symptômes :**
- Erreur : "Unable to acquire lock"
- Port 3000 occupé par le processus 35132
- Le serveur essaie d'utiliser le port 3001 à la place

---

## ✅ Solution Appliquée

### 1. Arrêter les Processus Node.js en Conflit

```powershell
# Arrêter le processus spécifique
Stop-Process -Id 35132 -Force

# Arrêter tous les processus Node.js (sauf Cursor)
Get-Process | Where-Object {$_.Path -like "*nodejs*"} | Stop-Process -Force
```

### 2. Supprimer le Fichier de Lock

```powershell
# Supprimer le fichier de lock
Remove-Item ".next\dev\lock" -Force
```

### 3. Vérifier que le Port 3000 est Libre

```powershell
# Vérifier le port 3000
Get-NetTCPConnection -LocalPort 3000
```

---

## 🚀 Redémarrer le Serveur

Après avoir nettoyé les processus et le lock :

```bash
npm run dev
```

Le serveur devrait maintenant démarrer correctement sur le port 3000.

---

## 🔍 Si le Problème Persiste

### Méthode Manuelle

1. **Ouvrir le Gestionnaire des Tâches** (Ctrl+Shift+Esc)
2. **Onglet "Détails"**
3. **Chercher les processus "node.exe"**
4. **Arrêter tous les processus node.exe** (sauf ceux de Cursor)
5. **Supprimer le dossier `.next`** :
   ```powershell
   Remove-Item -Recurse -Force .next
   ```
6. **Redémarrer le serveur** :
   ```bash
   npm run dev
   ```

### Vérifier les Ports

```powershell
# Voir tous les ports utilisés par Node.js
Get-NetTCPConnection | Where-Object {$_.OwningProcess -in (Get-Process node).Id} | Select-Object LocalPort, State, OwningProcess
```

---

## 📝 Prévention

Pour éviter ce problème à l'avenir :

1. **Toujours arrêter le serveur proprement** avec `Ctrl+C`
2. **Attendre quelques secondes** avant de redémarrer
3. **Vérifier les processus** si le serveur ne démarre pas

---

**Correction appliquée le :** 2026-01-23
