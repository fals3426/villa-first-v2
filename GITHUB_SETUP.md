# 🚀 Commandes pour partager le projet sur GitHub

**Date :** 2026-01-31  
**Projet :** Villa first v2

---

## 📋 Étape 1 : Préparer le commit local

```bash
cd "c:\Users\Falsone\Desktop\Villa first v2"
git add .
git commit -m "Initial commit - Villa first v2"
```

---

## 📋 Étape 2 : Créer le dépôt sur GitHub

1. Va sur : **https://github.com/new**
2. **Repository name** : `villa-first-v2` (ou le nom que tu veux)
3. **Description** : `Marketplace de colocations vérifiées à Bali`
4. Choisis **Public** ou **Private**
5. ⚠️ **NE COCHE PAS** "Initialize with README" (tu as déjà un repo local)
6. Clique sur **"Create repository"**

---

## 📋 Étape 3 : Connecter et pousser vers GitHub

**Remplace `TON_USERNAME` par ton username GitHub et `TON_REPO` par le nom du repo que tu as créé.**

```bash
cd "c:\Users\Falsone\Desktop\Villa first v2"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/TON_REPO.git
git push -u origin main
```

---

## 📋 Exemple complet (à adapter)

Si ton username GitHub est `falsone` et que tu crées un repo `villa-first-v2` :

```bash
cd "c:\Users\Falsone\Desktop\Villa first v2"
git add .
git commit -m "Initial commit - Villa first v2"
git branch -M main
git remote add origin https://github.com/falsone/villa-first-v2.git
git push -u origin main
```

---

## ✅ Vérification

Après le push, vérifie que tout est bien en ligne :

```bash
git remote -v
git status
```

Tu devrais voir :
- `origin  https://github.com/TON_USERNAME/TON_REPO.git (fetch)`
- `origin  https://github.com/TON_USERNAME/TON_REPO.git (push)`
- `Your branch is up to date with 'origin/main'`

---

## 🔐 Sécurité

✅ Les fichiers suivants sont **automatiquement ignorés** (grâce à `.gitignore`) :
- `.env*` (variables d'environnement sensibles)
- `node_modules/` (dépendances)
- `.next/` (build Next.js)
- `public/uploads/` (fichiers uploadés)
- Fichiers de build et logs

---

## 🆘 En cas d'erreur

### Erreur : "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/TON_USERNAME/TON_REPO.git
```

### Erreur : "failed to push some refs"
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Erreur d'authentification
GitHub utilise maintenant des **Personal Access Tokens** au lieu des mots de passe :
1. Va sur : https://github.com/settings/tokens
2. Génère un nouveau token avec les permissions `repo`
3. Utilise le token comme mot de passe lors du `git push`

---

**Bon push ! 🚀**
