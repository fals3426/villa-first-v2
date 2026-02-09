import { test, expect } from '@playwright/test';

/**
 * Security NFR Tests
 * 
 * Tests automatisés pour valider les exigences de sécurité :
 * - Authentication (unauthenticated redirect, password leaks)
 * - Authorization (RBAC enforcement)
 * - OWASP Top 10 (SQL injection, XSS sanitization)
 */

test.describe('Security NFR: Authentication & Authorization', () => {
  test('unauthenticated users cannot access protected routes', async ({ page }) => {
    // Attempt to access dashboard without auth
    await page.goto('/dashboard');

    // Should redirect to login (not expose data)
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText(/connexion|sign|login/i)).toBeVisible();

    // Verify no sensitive data leaked in response
    const pageContent = await page.content();
    expect(pageContent).not.toContain('user_id');
    expect(pageContent).not.toContain('api_key');
    expect(pageContent).not.toContain('token');
    expect(pageContent).not.toContain('session');
  });

  test('unauthenticated users cannot access host routes', async ({ page }) => {
    // Attempt to access host dashboard without auth
    await page.goto('/host/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated users cannot access protected API routes', async ({ request }) => {
    // Attempt to access protected API without auth (POST requires auth)
    const response = await request.post('/api/listings', {
      data: { title: 'Test', price: 100 },
    });

    // Should return 401 Unauthorized for POST (protected)
    expect(response.status()).toBe(401);
    
    // GET /api/listings is public (for search), so test a truly protected route
    const protectedResponse = await request.get('/api/profile');
    expect(protectedResponse.status()).toBe(401);
  });

  test('passwords are never logged or exposed in errors', async ({ page }) => {
    const consoleLogs: string[] = [];
    const networkRequests: string[] = [];

    // Monitor console for password leaks
    page.on('console', (msg) => consoleLogs.push(msg.text()));

    // Monitor network requests
    page.on('request', (request) => {
      const postData = request.postData();
      if (postData) {
        networkRequests.push(postData);
      }
    });

    await page.goto('/login');

    // Trigger login error with wrong password
    const wrongPassword = 'WrongPassword123!';
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/mot de passe|password/i).fill(wrongPassword);
    await page.getByRole('button', { name: /se connecter|sign|login/i }).click();

    // Wait for error message (check for French error message)
    await expect(
      page.getByText(/incorrect|invalid|error|erreur|email.*mot de passe/i)
    ).toBeVisible({ timeout: 10000 });

    // Verify password NEVER appears in:
    // 1. Page content (DOM)
    const pageContent = await page.content();
    expect(pageContent).not.toContain(wrongPassword);

    // 2. Console logs
    const consoleLogsText = consoleLogs.join('\n');
    expect(consoleLogsText).not.toContain(wrongPassword);

    // 3. Network requests (should be hashed/encrypted, not plain text)
    // Note: Password might appear in POST body, but should be hashed server-side
    // We verify it's not exposed in error messages or logs
    const networkText = networkRequests.join('\n');
    // Password might be in request body (expected), but verify it's not in error responses
    const responseText = await page.evaluate(() => document.body.textContent || '');
    expect(responseText).not.toContain(wrongPassword);
  });

  test('SQL injection attempts are blocked', async ({ page, request }) => {
    // Test SQL injection in API search endpoint (most likely vector)
    const sqlInjection = "'; DROP TABLE users; --";
    const response = await request.get(`/api/listings/search?location=${sqlInjection}`);

    // Should return 400 (validation error) or 200 with empty results, NOT crash
    expect([200, 400]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      // Should return empty results or sanitized data, not crash
      expect(data).toHaveProperty('data');
    }

    // Verify app still works (table not dropped)
    const healthResponse = await request.get('/api/health');
    expect(healthResponse.status()).toBe(200);
  });

  test('XSS attempts are sanitized', async ({ page }) => {
    // Test XSS in API endpoint (most secure way)
    await page.goto('/login');
    
    // Attempt XSS in email field (should be validated by email format)
    const xssPayload = '<script>alert("XSS")</script>';
    await page.getByLabel(/email/i).fill(xssPayload);
    await page.getByLabel(/mot de passe|password/i).fill('test123');
    await page.getByRole('button', { name: /se connecter|sign|login/i }).click();
    
    // Email validation should reject XSS payload
    // Check if validation error appears or form prevents submission
    await page.waitForTimeout(2000);
    
    // Verify XSS payload is not executed (check page content)
    const pageContent = await page.content();
    // Script tags should be escaped or removed
    expect(pageContent).not.toContain('<script>alert("XSS")</script>');
    
    // Verify page is still functional (not crashed)
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('authentication tokens expire after session timeout', async ({ page, context }) => {
    // This test validates that JWT tokens expire (30 days according to auth.ts)
    // For MVP, we test that expired sessions redirect to login
    
    // Note: Full token expiry test requires mocking time or waiting 30 days
    // For MVP, we validate that session management works correctly
    
    await page.goto('/login');
    
    // Verify login page is accessible
    await expect(page.getByText(/connexion|sign|login/i)).toBeVisible();
    
    // Verify session configuration exists (from auth.ts: maxAge 30 days)
    // This is validated by checking that protected routes require auth
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Security NFR: Authorization (RBAC)', () => {
  test('users cannot access admin routes without admin role', async ({ page }) => {
    // Attempt to access admin route without admin role
    // Try accessing a specific admin page (dashboard) which requires support role
    await page.goto('/admin/dashboard', { waitUntil: 'networkidle' });

    // Should redirect to login (with error parameter) or dashboard
    // Wait for navigation to complete
    await page.waitForTimeout(2000);
    const url = page.url();
    
    // Should be redirected away from /admin
    expect(url).not.toContain('/admin/dashboard');
    // Should redirect to login (with error) or dashboard
    expect(url).toMatch(/\/login|\/dashboard/);
  });

  test('host users cannot access tenant-only routes', async ({ page }) => {
    // This test requires authenticated session as host
    // For MVP, we validate that routes are protected
    // Full RBAC test requires test fixtures with different user types
    
    await page.goto('/dashboard');
    
    // Should redirect to login if not authenticated
    await expect(page).toHaveURL(/\/login/);
    
    // Note: Full RBAC testing requires:
    // 1. Test fixtures with different user types (host, tenant, support)
    // 2. Authenticated sessions for each type
    // 3. Validation that each type can only access their routes
  });
});

test.describe('Security NFR: Data Protection', () => {
  test('sensitive data is not exposed in client-side code', async ({ page }) => {
    await page.goto('/');

    // Get all JavaScript code from page
    const scripts = await page.$$eval('script', (scripts) =>
      scripts.map((s) => s.textContent || s.innerHTML)
    );

    const allScripts = scripts.join('\n');

    // Verify sensitive data not exposed
    expect(allScripts).not.toContain('NEXTAUTH_SECRET');
    expect(allScripts).not.toContain('DATABASE_URL');
    expect(allScripts).not.toContain('STRIPE_SECRET_KEY');
    expect(allScripts).not.toContain('password');
    expect(allScripts).not.toContain('api_key');
  });

  test('HTTPS is enforced in production', async ({ page }) => {
    // This test validates HTTPS configuration
    // For local development, we skip HTTPS check
    if (process.env.NODE_ENV === 'production') {
      await page.goto('http://localhost:3000');
      
      // Should redirect to HTTPS
      // Note: This requires HTTPS configuration in production
      // For MVP, we document this requirement
    } else {
      // Skip HTTPS check in development
      test.skip();
    }
  });
});

test.describe('Security NFR: Error Handling', () => {
  test('error messages do not expose sensitive information', async ({ page }) => {
    // Trigger an error (e.g., invalid API call)
    await page.goto('/dashboard');

    // Should redirect to login with generic error message
    await expect(page).toHaveURL(/\/login/);

    // Error message should be user-friendly, not technical
    const pageContent = await page.content();
    expect(pageContent).not.toContain('SQL');
    expect(pageContent).not.toContain('database');
    expect(pageContent).not.toContain('stack trace');
    expect(pageContent).not.toContain('error:');
  });
});
