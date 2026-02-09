# Guide d'accès aux pages admin

## 🔐 Prérequis

Pour accéder aux pages admin, l'utilisateur doit avoir le **`userType = 'support'`** dans la base de données.

Les types d'utilisateurs disponibles sont :
- `tenant` - Locataire
- `host` - Hôte
- `support` - Support/Admin (accès aux pages admin)

---

## 📋 Méthode 1 : Modifier un utilisateur existant via Prisma Studio

### Étape 1 : Ouvrir Prisma Studio
```bash
npx prisma studio
```

### Étape 2 : Modifier le userType
1. Ouvre le navigateur (généralement `http://localhost:5555`)
2. Va dans la table **`users`**
3. Trouve l'utilisateur que tu veux transformer en admin
4. Clique sur l'utilisateur pour l'éditer
5. Change le champ **`userType`** de `tenant` ou `host` vers **`support`**
6. Sauvegarde les modifications

### Étape 3 : Se connecter
1. Déconnecte-toi si tu es connecté
2. Connecte-toi avec cet utilisateur
3. Accède à `/admin/dashboard` ou toute autre page admin

---

## 📋 Méthode 2 : Créer un utilisateur support directement en SQL

### Étape 1 : Se connecter à PostgreSQL
```bash
psql -U postgres -d villa_first_v2
```

### Étape 2 : Créer un utilisateur support
```sql
-- Remplace les valeurs suivantes :
-- 'admin@example.com' par l'email souhaité
-- 'MotDePasse123!' par le mot de passe souhaité
-- Le mot de passe sera hashé automatiquement par l'application

-- Note: Tu dois d'abord hasher le mot de passe avec bcrypt
-- Pour simplifier, utilise Prisma Studio ou crée l'utilisateur via l'interface d'inscription puis modifie le userType
```

**⚠️ Note** : Il est plus simple d'utiliser Prisma Studio car le mot de passe doit être hashé avec bcrypt.

---

## 📋 Méthode 3 : Créer un script de création d'utilisateur support

Crée un fichier `scripts/create-support-user.ts` :

```typescript
import { prisma } from '../src/lib/prisma';
import { hash } from 'bcryptjs';

async function createSupportUser() {
  const email = 'admin@villafirst.com';
  const password = 'AdminPassword123!';
  
  // Vérifier si l'utilisateur existe déjà
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    // Mettre à jour le userType si l'utilisateur existe
    await prisma.user.update({
      where: { email },
      data: { userType: 'support' },
    });
    console.log(`✅ Utilisateur ${email} mis à jour avec le rôle support`);
  } else {
    // Créer un nouvel utilisateur support
    const hashedPassword = await hash(password, 12);
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        userType: 'support',
      },
    });
    console.log(`✅ Utilisateur support créé : ${email}`);
  }
}

createSupportUser()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Puis exécute :
```bash
npx tsx scripts/create-support-user.ts
```

---

## 📋 Méthode 4 : Modifier via une requête Prisma directe

Dans un terminal Node.js ou via un script :

```typescript
import { prisma } from './src/lib/prisma';

async function makeUserSupport(email: string) {
  await prisma.user.update({
    where: { email },
    data: { userType: 'support' },
  });
  console.log(`✅ ${email} est maintenant un utilisateur support`);
}

// Utilisation
makeUserSupport('ton-email@example.com');
```

---

## 🚀 Accès aux pages admin

Une fois que tu as un utilisateur avec `userType = 'support'` :

1. **Connecte-toi** avec cet utilisateur sur `/login`
2. **Accède directement** aux pages admin :
   - `/admin/dashboard` - Dashboard admin
   - `/admin/verifications` - Gestion des vérifications
   - `/admin/incidents` - Gestion des incidents
   - `/admin/audit-logs` - Logs d'audit

### Protection automatique

Le layout admin (`src/app/admin/layout.tsx`) vérifie automatiquement :
- ✅ Si l'utilisateur est connecté
- ✅ Si `userType === 'support'`
- ❌ Sinon, redirection vers `/login?error=unauthorized`

---

## 🔍 Vérifier le rôle d'un utilisateur

### Via Prisma Studio
1. Ouvre Prisma Studio : `npx prisma studio`
2. Va dans la table `users`
3. Vérifie la colonne `userType`

### Via SQL
```sql
SELECT id, email, "userType" FROM users WHERE email = 'ton-email@example.com';
```

### Via l'application
Une fois connecté, tu peux vérifier dans les DevTools du navigateur :
- Onglet Application → Cookies → `next-auth.session-token`
- Ou dans la console : `session.user.userType`

---

## ⚠️ Notes importantes

1. **Sécurité** : Les pages admin sont protégées par le layout, mais assure-toi de ne pas exposer ces routes publiquement en production.

2. **Premier admin** : Pour créer le premier utilisateur support, utilise Prisma Studio (méthode 1) ou le script (méthode 3).

3. **Déconnexion/Reconnexion** : Après avoir modifié le `userType`, tu dois te déconnecter et te reconnecter pour que la session soit mise à jour.

4. **Session JWT** : Le JWT stocke le `userType`, donc après modification en base, il faut se reconnecter pour que le token soit régénéré avec le nouveau rôle.

---

## 📝 Pages admin disponibles

Une fois connecté en tant que support, tu as accès à :

| Route | Description |
|-------|-------------|
| `/admin/dashboard` | Dashboard avec statistiques |
| `/admin/verifications` | Liste des demandes de vérification |
| `/admin/verifications/[id]` | Détail d'une demande de vérification |
| `/admin/incidents` | Liste des incidents de check-in |
| `/admin/incidents/[id]` | Détail d'un incident |
| `/admin/audit-logs` | Logs d'audit de l'application |

---

## 🛠️ Dépannage

### Problème : Redirection vers `/login?error=unauthorized`
**Solution** : Vérifie que ton utilisateur a bien `userType = 'support'` dans la base de données et reconnecte-toi.

### Problème : Le userType n'est pas mis à jour après modification
**Solution** : Déconnecte-toi complètement (supprime les cookies) et reconnecte-toi pour régénérer le JWT.

### Problème : Prisma Studio ne s'ouvre pas
**Solution** : Vérifie que PostgreSQL est démarré et que la `DATABASE_URL` dans `.env.local` est correcte.
