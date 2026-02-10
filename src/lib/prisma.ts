import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// S'assurer que DATABASE_URL est définie
if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not defined. Please check your .env.local file.'
  );
}

// Configuration de l'URL de connexion
const databaseUrl = process.env.DATABASE_URL || '';

// Pour Vercel Postgres et les environnements serverless, utiliser sslmode=require
// Pour le développement local, utiliser sslmode=disable
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
const sslMode = isProduction ? 'require' : 'disable';

// Construire l'URL proprement
let cleanDatabaseUrl = databaseUrl;
if (databaseUrl.includes('?')) {
  // Si l'URL contient déjà des paramètres, ajouter ou remplacer sslmode
  const urlParts = databaseUrl.split('?');
  const baseUrl = urlParts[0];
  const existingParams = new URLSearchParams(urlParts[1] || '');
  existingParams.set('sslmode', sslMode);
  cleanDatabaseUrl = `${baseUrl}?${existingParams.toString()}`;
} else {
  cleanDatabaseUrl = `${databaseUrl}?sslmode=${sslMode}`;
}

// Log pour debug (masquer les credentials)
if (process.env.NODE_ENV === 'development') {
  console.log('[Prisma] Database URL:', cleanDatabaseUrl.replace(/postgres:\/\/[^:]+:[^@]+@/, 'postgres://***:***@'));
}

// Créer le pool de connexions avec configuration optimisée pour serverless
const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString: cleanDatabaseUrl,
    max: isProduction ? 1 : 10, // Sur Vercel/serverless, limiter à 1 connexion par instance
    min: 0, // Permettre de fermer toutes les connexions quand inactif
    idleTimeoutMillis: isProduction ? 10000 : 30000, // Plus court en production pour libérer rapidement
    connectionTimeoutMillis: 10000, // Timeout de connexion de 10s
    // Gérer les erreurs de connexion
    allowExitOnIdle: true, // Permettre la fermeture des connexions inactives
    // Options supplémentaires pour la stabilité
    keepAlive: true,
    keepAliveInitialDelayMillis: 0, // Démarrer keep-alive immédiatement
    // Timeouts
    statement_timeout: 20000, // Timeout pour les requêtes SQL (20s)
    query_timeout: 20000, // Timeout pour les requêtes (20s)
  });

// Gérer les erreurs du pool - uniquement si c'est un nouveau pool
// Évite les MaxListenersExceededWarning lors du HMR en développement
if (!globalForPrisma.pool) {
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });
  
  // Augmenter la limite des écouteurs pour éviter les warnings en développement
  // (utile si d'autres modules ajoutent aussi des écouteurs)
  if (process.env.NODE_ENV === 'development') {
    pool.setMaxListeners(20);
  }
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.pool = pool;
}

// Créer l'adapter PostgreSQL
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Configuration pour serverless/Vercel
    datasources: {
      db: {
        url: cleanDatabaseUrl,
      },
    },
  });

// Gérer les erreurs de connexion fermée et reconnecter automatiquement
if (!globalForPrisma.prisma) {
  // En production/serverless, reconnecter automatiquement si la connexion est fermée
  prisma.$on('error' as never, (e: any) => {
    if (e.code === 'P1017' || e.message?.includes('Server has closed the connection')) {
      console.warn('[Prisma] Connection closed, will reconnect on next query');
    }
  });
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
