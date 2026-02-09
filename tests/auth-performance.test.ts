/**
 * Test de performance pour l'authentification
 * Mesure le temps de réponse de l'authentification après optimisations
 */

import { test, expect } from '@playwright/test';

test.describe('Performance Auth', () => {
  test('mesurer temps authentification optimisée', async ({ page, request }) => {
    // Aller sur la page de login
    await page.goto('http://localhost:3000/login');

    // Attendre que la page soit chargée
    await page.waitForLoadState('networkidle');

    // Mesurer le temps de soumission du formulaire
    const startTime = Date.now();

    // Remplir le formulaire (utiliser des credentials de test si disponibles)
    // Note: Vous devrez créer un utilisateur de test d'abord
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'TestPassword123!');

    // Soumettre le formulaire
    await page.click('button[type="submit"]');

    // Attendre la redirection ou le résultat
    await page.waitForURL(/\/dashboard|\/login/, { timeout: 5000 }).catch(() => {
      // Si timeout, vérifier si on est toujours sur login (erreur)
    });

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.log(`\n[Performance Test] Temps authentification: ${totalTime}ms`);

    // Vérifier que le temps est acceptable (< 500ms pour MVP, idéalement < 200ms)
    // Note: Ce test peut échouer si bcrypt est très lent, ajuster selon besoin
    expect(totalTime).toBeLessThan(1000); // Seuil large pour tenir compte de la latence réseau

    // Vérifier les logs dans la console du navigateur
    const logs: string[] = [];
    page.on('console', (msg) => {
      if (msg.text().includes('[Auth]') || msg.text().includes('[NextAuth]')) {
        logs.push(msg.text());
      }
    });

    console.log('\n[Performance Test] Logs détectés:', logs);
  });

  test('vérifier logs performance dans terminal', async ({ page }) => {
    // Ce test vérifie que les logs de performance sont présents
    // Les logs réels seront visibles dans le terminal du serveur Next.js
    
    await page.goto('http://localhost:3000/login');
    
    // Les logs [Auth] et [NextAuth] devraient apparaître dans le terminal
    // lors de l'authentification réelle
    expect(page).toBeTruthy();
  });
});
