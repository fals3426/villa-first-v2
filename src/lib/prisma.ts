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

// Nettoyer l'URL de connexion pour éviter les paramètres problématiques de Prisma Postgres
// L'URL TCP de Prisma Postgres contient des paramètres comme connect_timeout=0 qui causent des problèmes
const databaseUrl = process.env.DATABASE_URL || '';
const cleanDatabaseUrl = databaseUrl.includes('?') 
  ? databaseUrl.split('?')[0] + '?sslmode=disable'
  : databaseUrl + '?sslmode=disable';

// Log pour debug (masquer les credentials)
if (process.env.NODE_ENV === 'development') {
  console.log('[Prisma] Database URL:', cleanDatabaseUrl.replace(/postgres:\/\/[^:]+:[^@]+@/, 'postgres://***:***@'));
}

// Créer le pool de connexions avec configuration optimisée
const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString: cleanDatabaseUrl,
    max: 10, // Nombre maximum de connexions dans le pool
    idleTimeoutMillis: 30000, // Fermer les connexions inactives après 30s
    connectionTimeoutMillis: 20000, // Timeout de connexion de 20s (augmenté pour éviter les timeouts)
    // Gérer les erreurs de connexion
    allowExitOnIdle: false,
    // Options supplémentaires pour la stabilité
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    // Désactiver single_use_connections pour réutiliser les connexions
    statement_timeout: 30000, // Timeout pour les requêtes SQL (30s)
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
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
