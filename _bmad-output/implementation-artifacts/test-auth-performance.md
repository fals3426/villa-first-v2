# Guide de Test - Performance Authentification

**Date :** 2026-01-28  
**Objectif :** Vérifier que les optimisations d'authentification fonctionnent et mesurer les gains de performance

---

## 🧪 Test Manuel

### Prérequis
1. Serveur de développement démarré : `npm run dev`
2. Un utilisateur de test créé dans la base de données
3. Terminal ouvert pour voir les logs

### Étapes de Test

1. **Démarrer le serveur**
   ```bash
   npm run dev
   ```

2. **Ouvrir le navigateur**
   - Aller sur `http://localhost:3000/login`

3. **Tester l'authentification**
   - Entrer un email valide
   - Entrer le mot de passe correspondant
   - Cliquer sur "Se connecter"

4. **Observer les logs dans le terminal**
   Vous devriez voir des logs comme :
   ```
   [Auth] Success - Normalize: 0ms, Query: 15ms, Compare: 120ms, Total: 135ms
   [NextAuth] Authorization success - Total: 140ms
   ```

### Métriques Attendues

**Temps cible :** < 200ms (idéalement < 150ms)

**Répartition attendue :**
- Normalisation email : < 1ms
- Requête Prisma : 10-50ms
- bcrypt compare : 50-200ms (normal avec 12 rounds)
- Callbacks NextAuth : 5-10ms
- **Total :** 150-300ms

### Cas de Test

#### ✅ Test 1 : Authentification réussie
- **Action :** Se connecter avec credentials valides
- **Attendu :** 
  - Redirection vers `/dashboard`
  - Logs `[Auth] Success` dans le terminal
  - Temps total < 500ms

#### ✅ Test 2 : Email invalide
- **Action :** Entrer un email invalide (ex: "test")
- **Attendu :**
  - Pas de requête DB (validation précoce)
  - Logs `[Auth] User not found` si email format valide mais utilisateur inexistant
  - Temps très rapide (< 50ms)

#### ✅ Test 3 : Mot de passe incorrect
- **Action :** Entrer un email valide avec mauvais mot de passe
- **Attendu :**
  - Logs `[Auth] Invalid password` dans le terminal
  - Temps incluant bcrypt compare (50-200ms)
  - Message d'erreur affiché

#### ✅ Test 4 : Dashboard après connexion
- **Action :** Après connexion réussie, vérifier le dashboard
- **Attendu :**
  - Dashboard charge rapidement (< 500ms)
  - Logs `[Dashboard] Session: Xms, Total: Yms` dans le terminal
  - Pas de requête DB pour onboarding (utilise JWT)

---

## 📊 Analyse des Logs

### Logs de Performance Attendus

**Authentification réussie :**
```
[Auth] Success - Normalize: 0ms, Query: 15ms, Compare: 120ms, Total: 135ms
[NextAuth] Authorization success - Total: 140ms
```

**Utilisateur non trouvé :**
```
[Auth] User not found - Normalize: 0ms, Query: 12ms, Total: 12ms
```

**Mot de passe incorrect :**
```
[Auth] Invalid password - Normalize: 0ms, Query: 15ms, Compare: 125ms, Total: 140ms
```

**Dashboard (après optimisations) :**
```
[Dashboard] Session: 5ms, Total: 8ms
```

### Interprétation

- **Query < 50ms** : ✅ Excellent (requête DB optimisée)
- **Query 50-100ms** : ⚠️ Acceptable (peut être amélioré avec index)
- **Query > 100ms** : ❌ Problème (vérifier index, connexion DB)

- **Compare < 200ms** : ✅ Normal pour bcrypt 12 rounds
- **Compare 200-300ms** : ⚠️ Acceptable mais lent
- **Compare > 300ms** : ⚠️ Avertissement affiché (vérifier charge serveur)

---

## 🔍 Vérifications Post-Test

### ✅ Checklist

- [ ] Les logs de performance apparaissent dans le terminal
- [ ] Le temps total d'authentification < 500ms (idéalement < 200ms)
- [ ] La requête Prisma < 50ms
- [ ] Le dashboard charge rapidement (< 500ms)
- [ ] Pas de requête DB pour onboarding (utilise JWT)
- [ ] Les erreurs sont gérées correctement
- [ ] Pas d'erreurs dans la console du navigateur

### 🐛 Dépannage

**Problème : Pas de logs dans le terminal**
- Vérifier que `NODE_ENV=development`
- Vérifier que le serveur est en mode développement

**Problème : Temps très élevé (> 1000ms)**
- Vérifier la connexion à la base de données
- Vérifier la charge du serveur
- Vérifier les logs pour identifier le bottleneck

**Problème : bcrypt compare très lent (> 300ms)**
- Normal si serveur sous charge
- Vérifier la CPU du serveur
- Considérer réduire à 10 rounds si nécessaire (compromis sécurité)

---

## 📝 Résultats Attendus

### Avant Optimisations
- Temps authentification : ~740ms
- Requête DB : ~50-100ms
- bcrypt compare : ~200-400ms
- Callbacks NextAuth : ~50-100ms

### Après Optimisations
- Temps authentification : **150-300ms** (réduction ~60-70%)
- Requête DB : **10-50ms** (optimisée avec index)
- bcrypt compare : **50-200ms** (normal)
- Callbacks NextAuth : **5-10ms** (optimisés)
- Dashboard : **< 500ms** (vs 2.2s avant)

---

## 🚀 Prochaines Étapes

1. **Si temps > 500ms** : Analyser les logs pour identifier le bottleneck
2. **Si bcrypt > 300ms** : Vérifier charge serveur ou réduire rounds (compromis sécurité)
3. **Si requête DB > 100ms** : Vérifier index sur email dans Prisma
4. **Si tout OK** : Passer aux optimisations suivantes (lazy load Leaflet, etc.)

---

**Note :** Les tests automatisés sont disponibles dans `tests/auth-performance.test.ts` mais nécessitent un utilisateur de test configuré.
