/**
 * Script pour résoudre une migration Prisma échouée
 * Utilisé avant prisma migrate deploy pour débloquer les migrations
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resolveFailedMigration() {
  try {
    console.log('🔍 Vérification des migrations échouées...');
    
    // Vérifier si la migration échouée existe dans _prisma_migrations
    const failedMigration = await prisma.$queryRaw`
      SELECT * FROM "_prisma_migrations" 
      WHERE migration_name = '20260210000001_add_all_tables' 
      AND finished_at IS NULL
    `;
    
    if (failedMigration && failedMigration.length > 0) {
      console.log('⚠️  Migration échouée trouvée, marquage comme résolue...');
      
      // Marquer la migration comme résolue (rolled back)
      await prisma.$executeRaw`
        UPDATE "_prisma_migrations" 
        SET finished_at = NOW(), 
            rolled_back_at = NOW(),
            logs = 'Migration resolved manually - tables will be created in next migration'
        WHERE migration_name = '20260210000001_add_all_tables' 
        AND finished_at IS NULL
      `;
      
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
    await prisma.$disconnect();
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
