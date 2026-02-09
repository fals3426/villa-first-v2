/**
 * Wrapper pour charger les variables d'environnement AVANT d'exécuter le script TypeScript
 * Ce wrapper garantit que .env.local est chargé avant que tsx n'exécute le script principal
 */

const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Charger .env.local en priorité, puis .env
const envLocalPath = path.resolve(__dirname, '..', '.env.local');
const envPath = path.resolve(__dirname, '..', '.env');

console.log('🔧 Chargement des variables d\'environnement...\n');

let envLoaded = false;

if (fs.existsSync(envLocalPath)) {
  console.log('📄 Chargement de .env.local...');
  const result = dotenv.config({ path: envLocalPath });
  if (result.error) {
    console.error('❌ Erreur lors du chargement de .env.local:', result.error);
  } else {
    envLoaded = true;
    console.log('✅ .env.local chargé');
  }
} else {
  console.warn('⚠️  Fichier .env.local non trouvé à:', envLocalPath);
}

if (fs.existsSync(envPath) && !envLoaded) {
  console.log('📄 Chargement de .env...');
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error('❌ Erreur lors du chargement de .env:', result.error);
  } else {
    console.log('✅ .env chargé');
  }
}

// Vérifier que DATABASE_URL est chargée
if (!process.env.DATABASE_URL) {
  console.error('\n❌ ERREUR : DATABASE_URL n\'est toujours pas définie après le chargement des fichiers .env !\n');
  console.error('📝 Vérifications :');
  console.error(`   1. Fichier .env.local existe : ${fs.existsSync(envLocalPath) ? '✅' : '❌'}`);
  if (fs.existsSync(envLocalPath)) {
    console.error(`      Chemin : ${envLocalPath}`);
    try {
      const content = fs.readFileSync(envLocalPath, 'utf-8');
      const hasDatabaseUrl = content.includes('DATABASE_URL');
      console.error(`   2. DATABASE_URL présent dans le fichier : ${hasDatabaseUrl ? '✅' : '❌'}`);
      if (hasDatabaseUrl) {
        const match = content.match(/DATABASE_URL="([^"]+)"/);
        if (match) {
          console.error(`   3. Valeur trouvée : ${match[1].replace(/:[^:@]+@/, ':****@')}`);
        } else {
          console.error(`   3. Format incorrect - DATABASE_URL doit être entre guillemets`);
        }
      }
    } catch (e) {
      console.error(`   Erreur lecture fichier : ${e.message}`);
    }
  }
  console.error(`   4. Variables DATABASE dans process.env : ${Object.keys(process.env).filter(k => k.includes('DATABASE')).join(', ') || 'Aucune'}`);
  console.error('\n💡 Vérifiez que DATABASE_URL est bien définie dans .env.local\n');
  process.exit(1);
}

console.log('✅ DATABASE_URL trouvée:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'));
console.log('');

// Maintenant exécuter le script TypeScript avec les variables chargées
const { execSync } = require('child_process');
const scriptPath = path.resolve(__dirname, 'seed.ts');

try {
  execSync(`npx tsx "${scriptPath}"`, {
    stdio: 'inherit',
    env: process.env, // Passer toutes les variables d'environnement
    cwd: path.resolve(__dirname, '..'),
  });
} catch (error) {
  process.exit(error.status || 1);
}
