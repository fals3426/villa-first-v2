# Guide : Génération de Données de Test pour Villa first v2

**Date :** 2026-01-28  
**Objectif :** Créer des villas de test avec toutes les données nécessaires pour tester l'application complètement

---

## 🎯 Objectif

Ce guide explique comment générer des données de test (fausses villas avec de fausses images) pour pouvoir tester l'entièreté de l'application, notamment le parcours de réservation.

---

## 📋 Prérequis

1. **Base de données PostgreSQL** configurée et accessible
2. **Variables d'environnement** configurées (`.env.local` avec `DATABASE_URL`)
3. **Prisma** configuré et migrations appliquées
4. **Node.js** et npm installés

---

## 🚀 Installation

### Étape 1 : Installer les dépendances

Le script nécessite `tsx` pour exécuter du TypeScript. Il sera installé automatiquement avec :

```bash
npm install
```

Si `tsx` n'est pas installé, installez-le manuellement :

```bash
npm install --save-dev tsx
```

---

## 🎬 Utilisation

### Exécuter le script de seed

```bash
npm run seed
```

Ou directement avec tsx :

```bash
npx tsx scripts/seed.ts
```

---

## 📊 Données Générées

Le script crée automatiquement :

### 👤 Utilisateurs Hôtes (5)

| Email | Mot de passe | Statut |
|-------|--------------|--------|
| `host1@test.com` | `Test1234!` | KYC vérifié ✅ |
| `host2@test.com` | `Test1234!` | KYC vérifié ✅ |
| `host3@test.com` | `Test1234!` | KYC vérifié ✅ |
| `host4@test.com` | `Test1234!` | KYC vérifié ✅ |
| `host5@test.com` | `Test1234!` | KYC vérifié ✅ |

**Note :** Tous les hôtes ont :
- ✅ KYC vérifié (nécessaire pour créer des annonces)
- ✅ Onboarding complété
- ✅ Prénom et nom de test
- ✅ Numéro de téléphone de test

---

### 🏠 Villas Créées (5)

#### 1. **Villa moderne à Canggu avec piscine**
- **Type :** VILLA
- **Capacité :** 4 places
- **Prix :** 800€/place
- **Localisation :** Canggu, Bali (-8.6451, 115.1383)
- **Statut :** Publiée ✅
- **Score de complétude :** ~85%
- **Règles de validation :** FULL_ONLY (4 places)

**Contenu :**
- ✅ Photos : Cuisine (2-3), Chambres (2-3), Salles de bain (2-3), Extérieurs (2-3), Autres (2)
- ✅ Disponibilités : Créneaux pour les 3 prochains mois
- ✅ Règles de colocation définies
- ✅ Charte de la colocation
- ✅ Instructions de check-in avec codes d'accès

---

#### 2. **Colocation zen à Ubud dans maison traditionnelle**
- **Type :** VILLA
- **Capacité :** 3 places
- **Prix :** 600€/place
- **Localisation :** Ubud, Bali (-8.5069, 115.2625)
- **Statut :** Publiée ✅
- **Score de complétude :** ~85%
- **Règles de validation :** PARTIAL (2 places)

**Contenu :**
- ✅ Photos complètes par catégorie
- ✅ Disponibilités pour les 3 prochains mois
- ✅ Règles spécifiques (méditation, respect de la culture)
- ✅ Charte spirituelle
- ✅ Instructions de check-in

---

#### 3. **Appartement moderne à Seminyak centre-ville**
- **Type :** ROOM
- **Capacité :** 2 places
- **Prix :** 1200€/place
- **Localisation :** Seminyak, Bali (-8.6844, 115.1700)
- **Statut :** Publiée ✅
- **Score de complétude :** ~85%
- **Règles de validation :** MANUAL

**Contenu :**
- ✅ Photos complètes
- ✅ Disponibilités
- ✅ Règles urbaines
- ✅ Charte communautaire
- ✅ Instructions de check-in

---

#### 4. **Villa de luxe à Sanur avec vue sur mer**
- **Type :** VILLA
- **Capacité :** 5 places
- **Prix :** 1500€/place
- **Localisation :** Sanur, Bali (-8.6905, 115.2620)
- **Statut :** Publiée ✅
- **Score de complétude :** ~85%
- **Règles de validation :** FULL_ONLY (5 places)

**Contenu :**
- ✅ Photos de luxe
- ✅ Disponibilités
- ✅ Règles premium (piscine, plage privée)
- ✅ Charte de luxe
- ✅ Instructions de check-in

---

#### 5. **Colocation économique à Denpasar**
- **Type :** SHARED_ROOM
- **Capacité :** 4 places
- **Prix :** 400€/place
- **Localisation :** Denpasar, Bali (-8.6705, 115.2126)
- **Statut :** Publiée ✅
- **Score de complétude :** ~85%
- **Règles de validation :** PARTIAL (2 places)

**Contenu :**
- ✅ Photos économiques
- ✅ Disponibilités
- ✅ Règles économiques
- ✅ Charte solidaire
- ✅ Instructions de check-in

---

## 🖼️ Images Utilisées

Les images sont des **placeholders de haute qualité** provenant d'Unsplash :

- **Cuisine :** Images de cuisines modernes et équipées
- **Chambres :** Images de chambres confortables
- **Salles de bain :** Images de salles de bain modernes
- **Extérieurs :** Images de jardins, terrasses, piscines
- **Autres :** Images diverses (salons, espaces communs)

**Note :** Les images sont chargées depuis Unsplash avec des paramètres de taille optimisés (800x600).

---

## 🔧 Fonctionnalités Testables

Avec ces données, vous pouvez tester :

### ✅ Parcours Hôte

1. **Connexion en tant qu'hôte**
   - Email : `host1@test.com` / Mot de passe : `Test1234!`
   - Dashboard hôte avec les villas créées

2. **Gestion des annonces**
   - Voir les annonces créées
   - Modifier les annonces
   - Gérer les disponibilités
   - Gérer les photos

3. **Gestion des réservations**
   - Voir les demandes de réservation
   - Accepter/refuser les réservations
   - Gérer les validations

---

### ✅ Parcours Locataire

1. **Recherche de villas**
   - Rechercher par localisation (Canggu, Ubud, Seminyak, etc.)
   - Filtrer par budget (400€ - 1500€)
   - Filtrer par vibes
   - Voir les villas sur la carte

2. **Consultation d'une villa**
   - Voir les détails complets
   - Voir toutes les photos par catégorie
   - Voir les disponibilités
   - Lire les règles et la charte

3. **Réservation**
   - Sélectionner des dates disponibles
   - Effectuer une préautorisation de paiement (25€)
   - Attendre la validation par l'hôte
   - Voir le statut de la réservation

4. **Check-in**
   - Effectuer le check-in avec photo et GPS
   - Voir les instructions de check-in
   - Signaler un problème si nécessaire

---

## 🔄 Réexécuter le Seed

### Option 1 : Ajouter de nouvelles données (recommandé)

Par défaut, le script **ne supprime pas** les données existantes. Il vérifie si les utilisateurs existent déjà et les réutilise.

Pour ajouter de nouvelles villas, modifiez le tableau `VILLAS_DATA` dans `scripts/seed.ts`.

---

### Option 2 : Réinitialiser complètement

⚠️ **ATTENTION :** Cette opération supprime TOUTES les données !

Pour réinitialiser complètement la base de données :

1. **Décommentez les lignes de suppression** dans `scripts/seed.ts` (lignes 50-65)
2. **Exécutez le script :**
   ```bash
   npm run seed
   ```
3. **Recommentez les lignes de suppression** pour éviter les suppressions accidentelles

---

## 🐛 Dépannage

### Erreur : "DATABASE_URL is not defined"

**Solution :** Vérifiez que votre fichier `.env.local` contient bien `DATABASE_URL`.

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/villa_first_v2"
```

---

### Erreur : "Cannot find module 'tsx'"

**Solution :** Installez tsx :

```bash
npm install --save-dev tsx
```

---

### Erreur : "KYC_NOT_VERIFIED"

**Solution :** Le script crée automatiquement les vérifications KYC pour tous les hôtes. Si vous rencontrez cette erreur, vérifiez que le script s'est bien exécuté jusqu'au bout.

---

### Erreur : "EMAIL_ALREADY_EXISTS"

**Solution :** C'est normal ! Le script vérifie si les utilisateurs existent déjà et les réutilise. Si vous voulez créer de nouveaux utilisateurs, modifiez les emails dans `hostEmails` dans `scripts/seed.ts`.

---

## 📝 Personnalisation

### Ajouter de nouvelles villas

Modifiez le tableau `VILLAS_DATA` dans `scripts/seed.ts` :

```typescript
const VILLAS_DATA = [
  {
    title: 'Ma nouvelle villa',
    description: 'Description détaillée...',
    address: 'Adresse complète',
    location: 'Ville, Pays',
    latitude: -8.1234,
    longitude: 115.5678,
    capacity: 3,
    pricePerPlace: 700,
    listingType: ListingType.VILLA,
    // ... autres champs
  },
  // ... autres villas
];
```

---

### Modifier les images

Modifiez l'objet `PLACEHOLDER_IMAGES` dans `scripts/seed.ts` pour utiliser vos propres URLs d'images.

---

### Modifier les disponibilités

Le script crée automatiquement des créneaux pour les 3 prochains mois. Pour modifier cette période, changez la variable `months` dans la fonction `main()`.

---

## ✅ Vérification

Après avoir exécuté le script, vérifiez que tout fonctionne :

1. **Connectez-vous** avec un compte hôte (`host1@test.com` / `Test1234!`)
2. **Vérifiez le dashboard hôte** - vous devriez voir les villas créées
3. **Connectez-vous** avec un compte locataire (créez-en un via l'interface)
4. **Recherchez des villas** - vous devriez voir les 5 villas créées
5. **Consultez une villa** - vérifiez que les photos, disponibilités, règles sont bien présentes

---

## 🎉 Résultat Attendu

Après l'exécution du script, vous devriez avoir :

- ✅ **5 utilisateurs hôtes** avec KYC vérifié
- ✅ **5 villas complètes** avec :
  - Photos par catégorie (cuisine, chambres, salles de bain, extérieurs)
  - Disponibilités pour les 3 prochains mois
  - Règles et charte définies
  - Instructions de check-in
  - Score de complétude calculé (~85%)

Vous pouvez maintenant **tester l'entièreté de l'application** ! 🚀

---

## 📚 Ressources

- **Script de seed :** `scripts/seed.ts`
- **Schéma Prisma :** `prisma/schema.prisma`
- **Service de complétude :** `src/server/services/listings/completeness.service.ts`

---

**Besoin d'aide ?** Consultez les logs du script pour identifier les problèmes éventuels.
