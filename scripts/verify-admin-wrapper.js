const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

if (fs.existsSync(path.join(__dirname, '..', '.env.local'))) {
  dotenv.config({ path: path.join(__dirname, '..', '.env.local') });
} else if (fs.existsSync(path.join(__dirname, '..', '.env'))) {
  dotenv.config({ path: path.join(__dirname, '..', '.env') });
}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL non définie');
  process.exit(1);
}

execSync('npx tsx scripts/verify-admin-credentials.ts', {
  stdio: 'inherit',
  env: process.env,
  cwd: path.resolve(__dirname, '..'),
});
