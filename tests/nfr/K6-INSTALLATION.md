# Installation k6 - Guide

## Windows

### Option 1 : Chocolatey (Recommandé)
```bash
choco install k6
```

### Option 2 : Téléchargement manuel
1. Télécharger depuis https://k6.io/docs/getting-started/installation/
2. Extraire dans un dossier (ex: `C:\k6`)
3. Ajouter au PATH système

### Option 3 : Scoop
```bash
scoop install k6
```

## Vérification Installation

```bash
k6 version
```

## Utilisation

### Smoke Test (10 utilisateurs, 30 secondes)
```bash
npm run test:performance:smoke
```

### Test Complet (50 → 100 utilisateurs)
```bash
npm run test:performance
```

### Test Personnalisé
```bash
k6 run --vus 50 --duration 2m tests/nfr/performance.k6.js
```

## Variables d'Environnement

```bash
# Spécifier URL de base
BASE_URL=https://staging.example.com k6 run tests/nfr/performance.k6.js

# Token d'authentification (si nécessaire)
AUTH_TOKEN=your_token k6 run tests/nfr/performance.k6.js
```

## Résultats

Les résultats sont affichés dans la console et sauvegardés dans `summary.json`.
