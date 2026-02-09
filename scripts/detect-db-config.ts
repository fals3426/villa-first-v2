/**
 * Script de diagnostic pour détecter la configuration PostgreSQL
 * et mettre à jour automatiquement .env.local
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const envLocalPath = resolve(process.cwd(), '.env.local');

// Charger .env.local si il existe
if (existsSync(envLocalPath)) {
  config({ path: envLocalPath });
}

interface DbConfig {
  user: string;
  password: string;
  host: string;
  port: string;
  database: string;
}

// Configurations communes à tester
const COMMON_CONFIGS: DbConfig[] = [
  { user: 'postgres', password: '', host: 'localhost', port: '5432', database: 'villa_first_v2' },
  { user: 'postgres', password: 'postgres', host: 'localhost', port: '5432', database: 'villa_first_v2' },
  { user: 'postgres', password: 'admin', host: 'localhost', port: '5432', database: 'villa_first_v2' },
  { user: 'postgres', password: 'root', host: 'localhost', port: '5432', database: 'villa_first_v2' },
];

function testConnection(config: DbConfig): boolean {
  try {
    const url = `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
    // Test simple avec psql si disponible
    const testCmd = `psql "${url}" -c "SELECT 1;" 2>&1`;
    try {
      execSync(testCmd, { stdio: 'ignore', timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

function updateEnvFile(config: DbConfig) {
  const url = `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}?schema=public`;
  
  let content = '';
  if (existsSync(envLocalPath)) {
    content = readFileSync(envLocalPath, 'utf-8');
  } else {
    // Contenu par défaut
    content = `# Database
DATABASE_URL=""

# NextAuth
NEXTAUTH_SECRET="jxqUiK7L7ZZfxyGlM9uiiutY4lHM7MBP+sNW2r4FJlI="
NEXTAUTH_URL="http://localhost:3000"

# Stripe (optionnel pour le seed, nécessaire pour les paiements)
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Redis (optionnel)
REDIS_URL=""

# Encryption (pour stockage sécurisé KYC - optionnel pour le seed)
ENCRYPTION_KEY=""
`;
  }

  // Remplacer DATABASE_URL
  const lines = content.split('\n');
  const updatedLines = lines.map(line => {
    if (line.startsWith('DATABASE_URL=')) {
      return `DATABASE_URL="${url}"`;
    }
    return line;
  });

  writeFileSync(envLocalPath, updatedLines.join('\n'), 'utf-8');
  console.log(`✅ Fichier .env.local mis à jour avec :`);
  console.log(`   DATABASE_URL="${url.replace(/:[^:@]+@/, ':****@')}"`);
}

async function main() {
  console.log('🔍 Diagnostic de la configuration PostgreSQL...\n');

  // Vérifier si psql est disponible
  try {
    execSync('psql --version', { stdio: 'ignore' });
  } catch {
    console.log('⚠️  psql n\'est pas dans le PATH. Test manuel requis.\n');
    console.log('📝 Veuillez modifier manuellement .env.local avec votre configuration PostgreSQL.\n');
    console.log('💡 Configurations communes à essayer :');
    COMMON_CONFIGS.forEach((cfg, i) => {
      const passwordDisplay = cfg.password ? cfg.password : '(aucun mot de passe)';
      console.log(`   ${i + 1}. Utilisateur: ${cfg.user}, Mot de passe: ${passwordDisplay}`);
    });
    return;
  }

  console.log('🧪 Test des configurations communes...\n');

  for (const cfg of COMMON_CONFIGS) {
    const passwordDisplay = cfg.password || '(aucun mot de passe)';
    console.log(`   Test: ${cfg.user} / ${passwordDisplay}...`);
    
    if (testConnection(cfg)) {
      console.log(`   ✅ Connexion réussie !\n`);
      updateEnvFile(cfg);
      console.log('\n🎉 Configuration détectée et appliquée automatiquement !');
      console.log('   Vous pouvez maintenant exécuter : npm run seed\n');
      return;
    }
  }

  console.log('❌ Aucune configuration automatique trouvée.\n');
  console.log('📝 Veuillez modifier manuellement .env.local avec votre configuration PostgreSQL.\n');
  console.log('💡 Format attendu :');
  console.log('   DATABASE_URL="postgresql://user:password@host:port/database?schema=public"\n');
}

main().catch(console.error);
