/**
 * Script pour résoudre une migration Prisma échouée
 * Utilisé avant prisma migrate deploy pour débloquer les migrations
 */

const { Pool } = require('pg');

async function resolveFailedMigration() {
  let pool = null;
  
  try {
    // Vérifier que DATABASE_URL est définie
    if (!process.env.DATABASE_URL) {
      console.log('⚠️  DATABASE_URL non définie, skip de la résolution');
      return;
    }

    console.log('🔍 Vérification des migrations échouées...');
    
    // Créer une connexion PostgreSQL directe
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
    });
    
    // Vérifier si la migration échouée existe dans _prisma_migrations
    const result = await pool.query(`
      SELECT * FROM "_prisma_migrations" 
      WHERE migration_name = $1 
      AND finished_at IS NULL
    `, ['20260210000001_add_all_tables']);
    
    if (result.rows && result.rows.length > 0) {
      console.log('⚠️  Migration échouée trouvée, marquage comme résolue...');
      
      // Marquer la migration comme résolue (rolled back)
      await pool.query(`
        UPDATE "_prisma_migrations" 
        SET finished_at = NOW(), 
            rolled_back_at = NOW(),
            logs = 'Migration resolved manually - tables will be created in next migration'
        WHERE migration_name = $1 
        AND finished_at IS NULL
      `, ['20260210000001_add_all_tables']);
      
      console.log('✅ Migration échouée marquée comme résolue');
    } else {
      console.log('✅ Aucune migration échouée trouvée');
    }
  } catch (error) {
    // Si la table _prisma_migrations n'existe pas encore, c'est OK
    if (error.message.includes('does not exist') || error.code === '42P01') {
      console.log('ℹ️  Table _prisma_migrations n\'existe pas encore (normal pour première migration)');
    } else {
      console.error('❌ Erreur lors de la résolution:', error.message);
      // Ne pas faire échouer le build si ça échoue
    }
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

resolveFailedMigration()
  .then(() => {
    console.log('✅ Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(0); // Exit avec 0 pour ne pas faire échouer le build
  });
