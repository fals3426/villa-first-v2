# Guide de Test Complet - Epic 4 & Epic 5.1

**Date :** 2026-01-23  
**Serveur :** http://localhost:3000 (démarré)

---

## 🚀 Prérequis

✅ **Serveur de développement démarré** : `npm run dev`  
✅ **Base de données synchronisée** : Migration Prisma appliquée  
✅ **Prisma Postgres actif** : `npx prisma dev --detach`

---

## 📋 Étape 1 : Créer des Données de Test

### Option A : Via l'Interface (Recommandé pour tester le workflow complet)

1. **Créer un compte Hôte :**
   - Aller sur : http://localhost:3000/register
   - Remplir le formulaire avec :
     - Email : `host@test.com`
     - Password : `password123`
     - Type : **Hôte**
   - Cliquer sur "Créer un compte"

2. **Compléter le profil :**
   - Remplir le formulaire d'onboarding
   - Ajouter des informations de base

3. **Créer une annonce :**
   - Aller sur : http://localhost:3000/host/listings/new
   - Remplir les informations :
     - **Titre** : "Villa moderne à Canggu"
     - **Description** : "Superbe villa avec piscine"
     - **Localisation** : "Canggu, Bali"
     - **Latitude** : `-8.6451` (Canggu)
     - **Longitude** : `115.1383`
     - **Capacité** : 4
     - **Prix par place** : 800
     - **Type** : Colocation
   - Ajouter des photos
   - Définir des règles avec vibes (ex: "calm", "social")
   - Publier l'annonce

4. **Créer un compte Locataire :**
   - Aller sur : http://localhost:3000/register
   - Remplir avec :
     - Email : `tenant@test.com`
     - Password : `password123`
     - Type : **Locataire**
   - Compléter le profil

### Option B : Via Script SQL (Rapide pour tester)

Voir le fichier `scripts/seed-test-data.sql` (à créer si nécessaire)

---

## 🧪 Étape 2 : Tester Epic 4 - Recherche & Découverte

### Test 4.1 : Recherche par Localisation

1. **Aller sur** : http://localhost:3000/listings
2. **Dans la barre de recherche**, taper : `Canggu`
3. **Vérifier** :
   - ✅ Les annonces avec "Canggu" dans la localisation apparaissent
   - ✅ Les annonces vérifiées apparaissent en premier
   - ✅ Le nombre de résultats est affiché

**URLs de test :**
- http://localhost:3000/listings?location=Canggu
- http://localhost:3000/listings?location=Ubud

---

### Test 4.2 : Filtrage par Budget

1. **Aller sur** : http://localhost:3000/listings
2. **Utiliser le filtre de budget** :
   - Déplacer les curseurs du slider
   - OU saisir directement : Min = `500`, Max = `1000`
3. **Vérifier** :
   - ✅ Seules les annonces dans cette fourchette apparaissent
   - ✅ Le nombre de résultats se met à jour
   - ✅ Les prix affichés sont dans la fourchette

**URLs de test :**
- http://localhost:3000/listings?minPrice=500&maxPrice=1000
- http://localhost:3000/listings?minPrice=0&maxPrice=2000

---

### Test 4.3 : Filtrage par Vibes

1. **Aller sur** : http://localhost:3000/listings
2. **Sélectionner des vibes** :
   - Cocher "Calm"
   - Cocher "Social"
3. **Vérifier** :
   - ✅ Les annonces avec ces vibes apparaissent
   - ✅ Les tags vibes sont mis en évidence sur les cartes
   - ✅ Décocher retire le filtre

**URLs de test :**
- http://localhost:3000/listings?vibes=calm,social
- http://localhost:3000/listings?vibes=remote

---

### Test 4.4 : Carte avec Géolocalisation ⭐

1. **Aller sur** : http://localhost:3000/listings
2. **Cliquer sur le toggle "Carte"** (en haut à droite)
3. **Vérifier** :
   - ✅ La carte Leaflet s'affiche
   - ✅ Les marqueurs des annonces sont visibles
   - ✅ Les annonces vérifiées ont un marqueur **vert**
   - ✅ Les annonces non vérifiées ont un marqueur **bleu**
   - ✅ Cliquer sur un marqueur affiche un popup avec :
     - Photo principale
     - Titre
     - Prix
     - Badge vérifié (si applicable)
   - ✅ La géolocalisation utilisateur fonctionne (si autorisée)

**URLs de test :**
- http://localhost:3000/listings?view=map
- http://localhost:3000/listings?view=map&location=Canggu

**⚠️ Important :** Les annonces doivent avoir des coordonnées `latitude` et `longitude` pour apparaître sur la carte.

---

### Test 4.5 : Affichage des Résultats

1. **Aller sur** : http://localhost:3000/listings
2. **Vérifier** :
   - ✅ Seules les annonces `published` sont affichées
   - ✅ Les annonces sont triées par :
     1. Vérifiées en premier
     2. Score de complétude (décroissant)
     3. Date de création (plus récentes)
   - ✅ Chaque carte affiche :
     - Photo principale
     - Badge vérifié (si applicable)
     - Titre
     - Localisation
     - Prix par place
     - Capacité
     - Tags vibes
     - Score de complétude
   - ✅ Le nombre total de résultats est affiché
   - ✅ La pagination fonctionne (20 par page)

**URLs de test :**
- http://localhost:3000/listings
- http://localhost:3000/listings?page=2

---

### Test 4.6 : Comparaison d'Annonces ⭐

1. **Aller sur** : http://localhost:3000/listings
2. **Sélectionner des annonces** :
   - Cocher la checkbox sur 2-3 annonces
3. **Vérifier** :
   - ✅ Un badge flottant apparaît en bas avec le nombre sélectionné
   - ✅ Le bouton "Comparer" est activé si ≥ 2 annonces
   - ✅ La limite de 5 annonces est respectée
   - ✅ Les checkboxes sont désactivées si la limite est atteinte
4. **Cliquer sur "Comparer"**
5. **Vérifier la vue de comparaison** :
   - ✅ Les annonces sont affichées côte à côte
   - ✅ Toutes les informations sont présentes :
     - Photos
     - Titres
     - Prix
     - Localisation
     - Capacité
     - Vibes
     - Badge vérifié
     - Score de complétude
   - ✅ Le bouton pour retirer une annonce fonctionne
   - ✅ Les liens vers les détails fonctionnent
   - ✅ Sur mobile, scroll horizontal fonctionne

**URLs de test :**
- http://localhost:3000/listings (sélectionner plusieurs)
- http://localhost:3000/listings/compare?ids=id1,id2,id3

**Scénario complet :**
1. Sélectionner 3 annonces
2. Vérifier le badge (3/5)
3. Cliquer sur "Comparer"
4. Vérifier la vue
5. Retirer une annonce
6. Vérifier que la vue se met à jour
7. Fermer le navigateur
8. Rouvrir → Vérifier que la sélection est perdue (sessionStorage)

---

## 🧪 Étape 3 : Tester Epic 5.1 - Réservation

### Prérequis

- ✅ Un compte **Locataire** créé et connecté
- ✅ Au moins une annonce **publiée** avec des dates disponibles
- ✅ Le locataire doit avoir complété le KYC (optionnel pour MVP)

### Test 5.1 : Créer une Réservation

1. **Se connecter en tant que Locataire** :
   - Aller sur : http://localhost:3000/login
   - Email : `tenant@test.com`
   - Password : `password123`

2. **Aller sur une annonce** :
   - Cliquer sur une annonce depuis `/listings`
   - OU aller directement sur : http://localhost:3000/listings/[listingId]

3. **Cliquer sur "Réserver"** (si le bouton existe)
   - OU aller sur : http://localhost:3000/bookings/new/[listingId]

4. **Remplir le formulaire de réservation** :
   - **Date d'arrivée** : Sélectionner une date future (ex: dans 7 jours)
   - **Date de départ** : Sélectionner une date après l'arrivée (ex: +30 jours)
   - **Vérifier** :
     - ✅ Les dates passées ne sont pas sélectionnables
     - ✅ La date de départ doit être après l'arrivée
     - ✅ Les dates déjà réservées sont bloquées (si calendrier visible)

5. **Soumettre la réservation** :
   - Cliquer sur "Réserver"
   - **Vérifier** :
     - ✅ Un message de succès s'affiche
     - ✅ La réservation est créée avec le statut `pending`
     - ✅ Les dates sont bloquées dans le calendrier
     - ✅ Redirection vers une page de confirmation

6. **Vérifier dans la base de données** (optionnel) :
   ```sql
   SELECT * FROM bookings WHERE "tenantId" = '...';
   ```

### Test 5.1 : Cas d'Erreur

1. **Tenter de réserver une annonce déjà réservée** :
   - Sélectionner des dates qui chevauchent une réservation existante
   - **Vérifier** : ✅ Message d'erreur "Dates non disponibles"

2. **Tenter de réserver en tant qu'Hôte** :
   - Se connecter avec un compte Hôte
   - Essayer de réserver sa propre annonce
   - **Vérifier** : ✅ Redirection ou message d'erreur

3. **Tenter de réserver une annonce non publiée** :
   - Aller sur une annonce `draft`
   - **Vérifier** : ✅ Redirection ou message d'erreur

---

## 🔍 Vérifications Techniques

### Backend

**Tester les APIs directement :**

1. **Recherche** :
   ```bash
   curl "http://localhost:3000/api/listings/search?location=Canggu&minPrice=500&maxPrice=1000"
   ```

2. **Carte** :
   ```bash
   curl "http://localhost:3000/api/listings/map?location=Canggu"
   ```

3. **Comparaison** :
   ```bash
   curl "http://localhost:3000/api/listings/compare?ids=id1,id2"
   ```

4. **Réservation** :
   ```bash
   curl -X POST "http://localhost:3000/api/bookings" \
     -H "Content-Type: application/json" \
     -d '{
       "listingId": "...",
       "checkIn": "2026-02-01",
       "checkOut": "2026-02-15"
     }'
   ```

### Base de Données

**Vérifier les données :**

```sql
-- Voir toutes les annonces
SELECT id, title, location, latitude, longitude, status FROM listings;

-- Voir les réservations
SELECT id, "listingId", "tenantId", "checkIn", "checkOut", status FROM bookings;

-- Voir les slots de disponibilité
SELECT id, "listingId", "startDate", "endDate", "isAvailable" FROM "AvailabilitySlot";
```

**Ouvrir Prisma Studio :**
```bash
npx prisma studio
```

---

## 🐛 Problèmes Courants

### La carte ne s'affiche pas

**Cause :** Les listings n'ont pas de coordonnées `latitude`/`longitude`

**Solution :**
1. Ouvrir Prisma Studio : `npx prisma studio`
2. Aller dans la table `listings`
3. Éditer un listing
4. Ajouter `latitude` et `longitude` (ex: Canggu = `-8.6451`, `115.1383`)

### Aucun résultat de recherche

**Cause :** Aucune annonce n'est `published`

**Solution :**
1. Se connecter en tant qu'Hôte
2. Aller sur `/host/listings/[id]/edit`
3. Publier l'annonce

### Erreur "Can't reach database server"

**Cause :** Prisma Postgres n'est pas démarré

**Solution :**
```bash
npx prisma dev --detach
```

### Erreur lors de la réservation

**Cause :** Dates non disponibles ou validation échouée

**Solution :**
1. Vérifier que les dates sont dans le futur
2. Vérifier que `checkOut > checkIn`
3. Vérifier qu'il n'y a pas de réservation conflictuelle

---

## ✅ Checklist de Test Complète

### Epic 4
- [ ] Recherche par localisation fonctionne
- [ ] Filtrage par budget fonctionne
- [ ] Filtrage par vibes fonctionne
- [ ] Carte s'affiche avec marqueurs
- [ ] Marqueurs différenciés (vérifiés/non vérifiés)
- [ ] Popups sur la carte fonctionnent
- [ ] Toggle liste/carte fonctionne
- [ ] Tri par pertinence fonctionne
- [ ] Comparaison fonctionne (sélection, badge, vue)
- [ ] Responsive mobile fonctionne

### Epic 5.1
- [ ] Formulaire de réservation s'affiche
- [ ] Validation des dates fonctionne
- [ ] Réservation créée avec succès
- [ ] Dates bloquées après réservation
- [ ] Erreurs gérées correctement
- [ ] Redirection après succès

---

## 📝 Notes

- **SessionStorage** : La sélection de comparaison est perdue après fermeture du navigateur (comportement attendu)
- **Géolocalisation** : Nécessite l'autorisation du navigateur
- **Données de test** : Créer plusieurs annonces avec différents prix, vibes, et statuts de vérification pour tester tous les cas

---

**Guide créé le :** 2026-01-23  
**Serveur de test :** http://localhost:3000
