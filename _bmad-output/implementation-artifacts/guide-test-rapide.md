# Guide de Test Rapide - Démarrage en 5 Minutes

**Date :** 2026-01-23  
**Serveur :** http://localhost:3000

---

## ⚡ Démarrage Rapide

### 1. Vérifier que le serveur tourne

Ouvrir : http://localhost:3000

Si le serveur n'est pas démarré :
```bash
npm run dev
```

---

## 🎯 Tests Essentiels (5 minutes)

### Test 1 : Recherche Basique (1 min)

1. Aller sur : http://localhost:3000/listings
2. Taper "Canggu" dans la barre de recherche
3. ✅ Vérifier que des résultats apparaissent

---

### Test 2 : Carte Interactive (2 min)

1. Sur `/listings`, cliquer sur le toggle **"Carte"** (en haut à droite)
2. ✅ Vérifier que la carte s'affiche
3. ✅ Cliquer sur un marqueur → popup s'affiche
4. ✅ Les marqueurs verts = annonces vérifiées

**Note :** Si la carte est vide, les listings n'ont pas de coordonnées. Voir section "Données de Test" ci-dessous.

---

### Test 3 : Comparaison (1 min)

1. Sur `/listings`, cocher 2-3 checkboxes sur les annonces
2. ✅ Badge flottant apparaît en bas
3. Cliquer sur **"Comparer"**
4. ✅ Vue de comparaison s'affiche avec les annonces côte à côte

---

### Test 4 : Réservation (1 min)

1. Se connecter : http://localhost:3000/login
   - Email : `tenant@test.com`
   - Password : `password123`
2. Aller sur une annonce
3. Cliquer sur **"Réserver"** ou aller sur `/bookings/new/[listingId]`
4. Sélectionner des dates
5. ✅ Soumettre → Réservation créée

---

## 📊 Créer des Données de Test

### Option 1 : Via l'Interface (Recommandé)

1. **Créer un compte Hôte** :
   - `/register` → Email: `host@test.com`, Type: Hôte
   - Compléter le profil

2. **Créer une annonce** :
   - `/host/listings/new`
   - Remplir :
     - Titre : "Villa à Canggu"
     - Localisation : "Canggu, Bali"
     - **Latitude** : `-8.6451`
     - **Longitude** : `115.1383`
     - Prix : 800
     - Capacité : 4
   - Ajouter une photo
   - Publier

3. **Créer un compte Locataire** :
   - `/register` → Email: `tenant@test.com`, Type: Locataire

### Option 2 : Via Prisma Studio (Rapide)

1. Ouvrir Prisma Studio :
   ```bash
   npx prisma studio
   ```

2. **Créer un utilisateur Hôte** :
   - Table `users` → Add record
   - Email : `host@test.com`
   - Password : (hashé avec bcrypt, ou utiliser l'interface)
   - userType : `host`

3. **Créer un listing** :
   - Table `listings` → Add record
   - Remplir les champs obligatoires
   - **Important** : Ajouter `latitude` et `longitude` pour la carte
   - Status : `published`

---

## 🐛 Problèmes Courants

### "Aucun résultat" sur `/listings`

**Cause :** Aucune annonce n'est `published`

**Solution :**
- Créer une annonce via `/host/listings/new`
- OU via Prisma Studio : Changer le status à `published`

---

### Carte vide

**Cause :** Les listings n'ont pas de coordonnées

**Solution :**
1. Ouvrir Prisma Studio : `npx prisma studio`
2. Table `listings` → Éditer un listing
3. Ajouter :
   - `latitude` : `-8.6451` (exemple Canggu)
   - `longitude` : `115.1383`
4. Sauvegarder

---

### Erreur "Can't reach database"

**Cause :** Prisma Postgres n'est pas démarré

**Solution :**
```bash
npx prisma dev --detach
```

---

## ✅ Checklist Rapide

- [ ] Serveur démarré (http://localhost:3000)
- [ ] Au moins 1 annonce `published` créée
- [ ] Au moins 1 annonce avec coordonnées (pour la carte)
- [ ] Compte Hôte créé
- [ ] Compte Locataire créé
- [ ] Recherche fonctionne
- [ ] Carte s'affiche
- [ ] Comparaison fonctionne
- [ ] Réservation fonctionne

---

## 📝 URLs de Test

- **Liste des annonces** : http://localhost:3000/listings
- **Carte** : http://localhost:3000/listings?view=map
- **Recherche** : http://localhost:3000/listings?location=Canggu
- **Comparaison** : http://localhost:3000/listings/compare?ids=id1,id2
- **Réservation** : http://localhost:3000/bookings/new/[listingId]

---

**Guide créé le :** 2026-01-23
