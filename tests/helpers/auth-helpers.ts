/**
 * Authentication Helpers for Playwright Tests
 * 
 * Utilities pour créer des sessions authentifiées dans les tests
 */

import { Page, APIRequestContext } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
  userType: 'TENANT' | 'HOST' | 'SUPPORT';
}

/**
 * Login helper function
 */
export async function login(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/mot de passe|password/i).fill(password);
  await page.getByRole('button', { name: /se connecter|sign|login/i }).click();
  
  // Wait for redirect to dashboard or error
  await page.waitForURL(/\/dashboard|\/login/, { timeout: 5000 });
}

/**
 * Create authenticated session via API
 */
export async function createAuthenticatedSession(
  request: APIRequestContext,
  email: string,
  password: string
): Promise<string | null> {
  // Note: This requires API endpoint for authentication
  // For MVP, we use UI login flow
  // In future, add API endpoint: POST /api/auth/login
  return null;
}

/**
 * Test user fixtures
 */
export const testUsers = {
  tenant: {
    email: 'tenant@test.com',
    password: 'TestPassword123!',
    userType: 'TENANT' as const,
  },
  host: {
    email: 'host@test.com',
    password: 'TestPassword123!',
    userType: 'HOST' as const,
  },
  support: {
    email: 'support@test.com',
    password: 'TestPassword123!',
    userType: 'SUPPORT' as const,
  },
};
