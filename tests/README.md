# Tests Automatisés - Villa first v2

## Structure

```
tests/
├── nfr/                    # Tests Non-Functional Requirements
│   └── security.spec.ts   # Tests de sécurité (auth, authz, OWASP)
├── helpers/                # Helpers et utilitaires
│   └── auth-helpers.ts    # Helpers pour authentification
└── README.md              # Cette documentation
```

## Commandes

```bash
# Exécuter tous les tests
npm test

# Exécuter uniquement les tests de sécurité
npm run test:security

# Exécuter avec UI interactive
npm run test:ui

# Exécuter en mode debug
npx playwright test --debug
```

## Tests de Sécurité (NFR)

Les tests de sécurité valident :

1. **Authentication**
   - Redirection non-authentifiés vers `/login`
   - Protection des routes protégées (`/dashboard`, `/host/*`)
   - Protection des API routes (`/api/*`)
   - Pas de fuite de mots de passe dans logs/erreurs

2. **Authorization (RBAC)**
   - Accès restreint selon rôle utilisateur
   - Protection routes admin
   - Séparation host/tenant/support

3. **OWASP Top 10**
   - Protection SQL injection
   - Sanitization XSS
   - Protection données sensibles

4. **Data Protection**
   - Pas d'exposition secrets dans code client
   - HTTPS en production
   - Messages d'erreur génériques

## Configuration

Les tests utilisent `playwright.config.ts` avec :
- Base URL: `http://localhost:3000`
- Timeouts: action 15s, navigation 30s, expect 10s
- Retries: 2 en CI, 0 en local
- Workers: 1 en CI, auto en local

## Prérequis

1. Application démarrée (`npm run dev`)
2. Base de données configurée
3. Variables d'environnement définies

## Prochaines Étapes

- [ ] Ajouter tests de performance (k6)
- [ ] Ajouter tests E2E fonctionnels
- [ ] Ajouter tests de résilience (error handling, retries)
- [ ] Configurer CI/CD avec burn-in
