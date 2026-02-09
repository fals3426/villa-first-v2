# Plan d'Action NFR - Villa first v2 MVP

**Date:** 2026-01-28
**Priorité:** CRITICAL - Actions requises avant release MVP
**Estimation totale:** 5-7 jours de développement

---

## 🎯 Stratégie : Quick Wins → Critical → High Priority

**Philosophie:** Commencer par les actions à faible effort/haut impact, puis sécuriser les fondations critiques avant release.

---

## Phase 1 : Quick Wins (2-3 heures) - DÉMARRAGE IMMÉDIAT

### ✅ Action 1.1 : Scan de dépendances (30 min)

**Script à exécuter:**

```bash
# 1. Ajouter script audit dans package.json
npm pkg set scripts.audit="npm audit --audit-level=moderate"
npm pkg set scripts.audit:fix="npm audit fix"

# 2. Exécuter scan initial
npm run audit

# 3. Corriger les vulnérabilités critiques/high
npm audit fix

# 4. Vérifier résultat
npm run audit
```

**Validation:** 0 critical, < 3 high vulnerabilities

**Fichier à modifier:** `package.json`

---

### ✅ Action 1.2 : Configuration Lighthouse CI (1 heure)

**Créer `.github/workflows/lighthouse.yml`:**

```yaml
name: Lighthouse CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v11
        with:
          urls: |
            http://localhost:3000
          uploadArtifacts: true
          temporaryPublicStorage: true
          configPath: .lighthouserc.json
```

**Créer `.lighthouserc.json`:**

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "startServerCommand": "npm start",
      "url": ["http://localhost:3000"]
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.8}],
        "first-contentful-paint": ["error", {"maxNumericValue": 2000}],
        "interactive": ["error", {"maxNumericValue": 3500}]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

**Installation:**

```bash
npm install --save-dev @lhci/cli
```

**Validation:** Lighthouse CI passe avec Score ≥ 90 (desktop), ≥ 80 (mobile)

---

### ✅ Action 1.3 : Configuration Sentry (1 heure)

**Installation:**

```bash
npm install @sentry/nextjs
```

**Configuration `sentry.client.config.ts`:**

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event, hint) {
    // Redact sensitive data
    if (event.request) {
      if (event.request.data) {
        const sensitiveKeys = ['password', 'token', 'creditCard', 'cvv'];
        event.request.data = redactSensitiveData(event.request.data, sensitiveKeys);
      }
    }
    return event;
  },
});

function redactSensitiveData(obj: any, keys: string[]): any {
  if (typeof obj !== 'object' || obj === null) return obj;
  const redacted = { ...obj };
  for (const key of Object.keys(redacted)) {
    if (keys.some(k => key.toLowerCase().includes(k))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof redacted[key] === 'object') {
      redacted[key] = redactSensitiveData(redacted[key], keys);
    }
  }
  return redacted;
}
```

**Configuration `next.config.ts`:**

```typescript
const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  // ... votre config existante
};

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});
```

**Variables d'environnement `.env.local`:**

```bash
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project
```

**Validation:** Erreurs capturées dans Sentry dashboard

---

## Phase 2 : Critical Actions (4 jours) - SÉCURISATION FONDAMENTALE

### 🔒 Action 2.1 : Tests de sécurité automatisés (2 jours)

**Installation Playwright:**

```bash
npm install --save-dev @playwright/test
npx playwright install chromium
```

**Créer `playwright.config.ts`:**

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/nfr',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['junit', { outputFile: 'test-results/junit.xml' }]],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Créer `tests/nfr/security.spec.ts`:**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Security NFR: Authentication & Authorization', () => {
  test('unauthenticated users cannot access protected routes', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText(/sign|login/i)).toBeVisible();
    
    // Verify no sensitive data leaked
    const content = await page.content();
    expect(content).not.toContain('user_id');
    expect(content).not.toContain('api_key');
  });

  test('passwords are never logged or exposed in errors', async ({ page }) => {
    const consoleLogs: string[] = [];
    page.on('console', (msg) => consoleLogs.push(msg.text()));

    await page.goto('/login');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('WrongPassword123!');
    await page.getByRole('button', { name: /sign|login/i }).click();

    await expect(page.getByText(/invalid|error/i)).toBeVisible();

    // Verify password NEVER appears
    const pageContent = await page.content();
    expect(pageContent).not.toContain('WrongPassword123!');
    expect(consoleLogs.join('\n')).not.toContain('WrongPassword123!');
  });

  test('SQL injection attempts are blocked', async ({ page }) => {
    await page.goto('/search');
    await page.getByPlaceholder(/search/i).fill("'; DROP TABLE users; --");
    await page.getByRole('button', { name: /search/i }).click();

    // Should return empty results, NOT crash
    await expect(page.getByText(/no results|not found/i)).toBeVisible();
    
    // Verify app still works
    await page.goto('/');
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('XSS attempts are sanitized', async ({ page }) => {
    await page.goto('/profile/edit');
    const xssPayload = '<script>alert("XSS")</script>';
    await page.getByLabel(/bio|description/i).fill(xssPayload);
    await page.getByRole('button', { name: /save/i }).click();

    await page.reload();
    const bio = await page.getByTestId('user-bio').textContent();
    
    // Text should be escaped
    expect(bio).toContain('&lt;script&gt;');
    expect(bio).not.toContain('<script>');
  });
});
```

**Script package.json:**

```json
{
  "scripts": {
    "test:security": "playwright test tests/nfr/security.spec.ts"
  }
}
```

**Validation:** Tous les tests de sécurité verts

---

### ⚡ Action 2.2 : Tests de performance avec k6 (2 jours)

**Installation k6:**

```bash
# Windows (via Chocolatey)
choco install k6

# Ou télécharger depuis https://k6.io/docs/getting-started/installation/
```

**Créer `tests/nfr/performance.k6.js`:**

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const searchDuration = new Trend('search_duration');
const paymentDuration = new Trend('payment_duration');
const checkinDuration = new Trend('checkin_duration');

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 50 },
    { duration: '1m', target: 100 },
    { duration: '3m', target: 100 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    // PRD thresholds
    search_duration: ['p(95)<1000'], // < 1 seconde
    payment_duration: ['p(95)<5000'], // < 5 secondes
    checkin_duration: ['p(95)<3000'], // < 3 secondes
    errors: ['rate<0.01'], // < 1% error rate
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test 1: Search performance (< 1s)
  const searchResponse = http.get(`${BASE_URL}/api/listings?location=bali&limit=10`);
  const searchTime = searchResponse.timings.duration;
  searchDuration.add(searchTime);
  
  check(searchResponse, {
    'search status is 200': (r) => r.status === 200,
    'search responds in <1s': (r) => r.timings.duration < 1000,
  });
  errorRate.add(searchResponse.status !== 200);

  // Test 2: Payment performance (< 5s)
  const paymentResponse = http.post(`${BASE_URL}/api/payments/preauthorize`, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: 25,
      listingId: 'test-listing-id',
    }),
  });
  paymentDuration.add(paymentResponse.timings.duration);
  
  check(paymentResponse, {
    'payment status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    'payment responds in <5s': (r) => r.timings.duration < 5000,
  });
  errorRate.add(paymentResponse.status >= 400);

  // Test 3: Check-in performance (< 3s)
  const checkinResponse = http.post(`${BASE_URL}/api/check-in`, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bookingId: 'test-booking-id',
      photo: 'base64-encoded-photo',
      coordinates: { lat: -8.4095, lng: 115.1889 },
    }),
  });
  checkinDuration.add(checkinResponse.timings.duration);
  
  check(checkinResponse, {
    'checkin status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    'checkin responds in <3s': (r) => r.timings.duration < 3000,
  });
  errorRate.add(checkinResponse.status >= 400);

  sleep(1);
}

export function handleSummary(data) {
  const p95Search = data.metrics.search_duration.values['p(95)'];
  const p95Payment = data.metrics.payment_duration.values['p(95)'];
  const p95Checkin = data.metrics.checkin_duration.values['p(95)'];
  const errorRateValue = data.metrics.errors.values.rate;

  return {
    'summary.json': JSON.stringify(data),
    stdout: `
Performance NFR Results:
- Search p95: ${p95Search < 1000 ? '✅ PASS' : '❌ FAIL'} (${p95Search.toFixed(2)}ms / 1000ms threshold)
- Payment p95: ${p95Payment < 5000 ? '✅ PASS' : '❌ FAIL'} (${p95Payment.toFixed(2)}ms / 5000ms threshold)
- Check-in p95: ${p95Checkin < 3000 ? '✅ PASS' : '❌ FAIL'} (${p95Checkin.toFixed(2)}ms / 3000ms threshold)
- Error rate: ${errorRateValue < 0.01 ? '✅ PASS' : '❌ FAIL'} (${(errorRateValue * 100).toFixed(2)}% / 1% threshold)
    `,
  };
}
```

**Script package.json:**

```json
{
  "scripts": {
    "test:performance": "k6 run tests/nfr/performance.k6.js",
    "test:performance:smoke": "k6 run --vus 10 --duration 30s tests/nfr/performance.k6.js"
  }
}
```

**Validation:** Tous les seuils PRD respectés (p95 < 1s recherche, < 5s paiement, < 3s check-in)

---

## Phase 3 : High Priority (3-4 jours) - MONITORING & TESTS

### 📊 Action 3.1 : Monitoring de disponibilité (4 heures)

**Option 1 : UptimeRobot (Gratuit, rapide)**

1. Créer compte sur https://uptimerobot.com
2. Ajouter monitor HTTP(s) pour votre domaine
3. Configurer alertes email/SMS si disponibilité < 99%
4. Dashboard public optionnel pour transparence

**Option 2 : Pingdom (Plus avancé)**

1. Créer compte sur https://www.pingdom.com
2. Configurer uptime check avec seuil 99%
3. Alertes Slack/Email configurées

**Script de validation locale `scripts/health-check.sh`:**

```bash
#!/bin/bash
# scripts/health-check.sh

URL=${1:-http://localhost:3000}
MAX_RESPONSE_TIME=2000 # 2 seconds

response=$(curl -o /dev/null -s -w "%{http_code}\n%{time_total}" "$URL")
http_code=$(echo "$response" | head -n1)
time_total=$(echo "$response" | tail -n1)

if [ "$http_code" -eq 200 ] && (( $(echo "$time_total * 1000 < $MAX_RESPONSE_TIME" | bc -l) )); then
  echo "✅ Health check PASSED (${time_total}s)"
  exit 0
else
  echo "❌ Health check FAILED (HTTP: $http_code, Time: ${time_total}s)"
  exit 1
fi
```

**Validation:** Monitoring actif avec alertes configurées

---

### 🧪 Action 3.2 : Framework de tests automatisés (3 jours)

**Installation:**

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev @playwright/test
```

**Configuration Jest `jest.config.js`:**

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThresholds: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
```

**Créer `jest.setup.js`:**

```javascript
import '@testing-library/jest-dom';
```

**Créer `tests/unit/auth.test.ts`:**

```typescript
import { render, screen } from '@testing-library/react';
import { LoginForm } from '@/components/auth/LoginForm';

describe('LoginForm', () => {
  it('should render email and password fields', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should validate email format', async () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    // ... tests de validation
  });
});
```

**Créer `tests/e2e/payment.spec.ts`:**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Payment Flow', () => {
  test('user can complete payment preauthorization', async ({ page }) => {
    // Setup: Login
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign|login/i }).click();

    // Navigate to booking
    await page.goto('/listings/123');
    await page.getByRole('button', { name: /reserve|book/i }).click();

    // Payment form
    await page.getByLabel(/card/i).fill('4242424242424242');
    await page.getByLabel(/expiry/i).fill('12/25');
    await page.getByLabel(/cvv/i).fill('123');
    await page.getByRole('button', { name: /pay|submit/i }).click();

    // Verify success
    await expect(page.getByText(/success|confirmed/i)).toBeVisible({ timeout: 5000 });
  });
});
```

**Scripts package.json:**

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

**Validation:** Framework configuré avec ≥ 50% couverture sur fonctionnalités critiques

---

## 📋 Checklist d'Exécution

### Jour 1 (3 heures)
- [ ] ✅ Action 1.1 : Scan dépendances (30 min)
- [ ] ✅ Action 1.2 : Lighthouse CI (1h)
- [ ] ✅ Action 1.3 : Sentry (1h)
- [ ] ✅ Vérification : Quick wins complétés

### Jour 2-3 (4 jours)
- [ ] 🔒 Action 2.1 : Tests sécurité (2 jours)
- [ ] ⚡ Action 2.2 : Tests performance k6 (2 jours)
- [ ] ✅ Vérification : Critical actions complétées

### Jour 4-5 (3-4 jours)
- [ ] 📊 Action 3.1 : Monitoring disponibilité (4h)
- [ ] 🧪 Action 3.2 : Framework tests (3 jours)
- [ ] ✅ Vérification : High priority complétées

### Jour 6 (Validation)
- [ ] ✅ Ré-exécuter évaluation NFR
- [ ] ✅ Valider tous les seuils PRD avec preuves
- [ ] ✅ Gate YAML mis à jour avec nouveaux statuts

---

## 🎯 Critères de Succès

**Avant Release MVP:**

- ✅ npm audit : 0 critical, < 3 high
- ✅ Lighthouse CI : Score ≥ 90 (desktop), ≥ 80 (mobile)
- ✅ Sentry : Tracking actif avec alertes configurées
- ✅ Tests sécurité : Tous verts (auth, authz, OWASP)
- ✅ Tests performance : Tous seuils PRD respectés (k6)
- ✅ Monitoring : Disponibilité ≥ 99% avec alertes
- ✅ Tests automatisés : ≥ 50% couverture fonctionnalités critiques

---

## 📝 Notes Importantes

1. **Priorisation MVP:** Focus sur Security et Reliability (bloquants business)
2. **Performance:** Tests k6 peuvent être simplifiés pour MVP (smoke tests seulement)
3. **Maintainability:** 50% couverture acceptable pour MVP, objectif 80% en Growth
4. **Monitoring:** UptimeRobot gratuit suffit pour MVP, upgrade en Growth si besoin

---

**Prochaine étape:** Commencer Phase 1 (Quick Wins) immédiatement - 2-3 heures d'effort pour impact immédiat.

---

<!-- Powered by BMAD-CORE™ -->
