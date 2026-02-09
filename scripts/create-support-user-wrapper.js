/**
 * Wrapper pour charger .env.local avant d'exécuter create-support-user.ts
 */

const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const envLocalPath = path.resolve(__dirname, '..', '.env.local');
const envPath = path.resolve(__dirname, '..', '.env');

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL non définie. Vérifiez .env.local');
  process.exit(1);
}

const scriptPath = path.resolve(__dirname, 'create-support-user.ts');
execSync(`npx tsx "${scriptPath}"`, {
  stdio: 'inherit',
  env: process.env,
  cwd: path.resolve(__dirname, '..'),
});
