/**
 * Vérifie que le compte admin existe et que le mot de passe fonctionne
 * Usage: npx tsx scripts/verify-admin-credentials.ts
 */

import { prisma } from '../src/lib/prisma';
import { compare } from 'bcryptjs';

const EMAIL = 'admin@villafirst.com';
const PASSWORD = 'Admin123';

async function verify() {
  console.log('🔍 Vérification du compte admin...\n');

  const user = await prisma.user.findUnique({
    where: { email: EMAIL },
    select: { id: true, email: true, userType: true, password: true },
  });

  if (!user) {
    console.log('❌ Aucun utilisateur avec cet email:', EMAIL);
    console.log('\n👉 Exécute: npm run create-support-user');
    return;
  }

  console.log('✅ Utilisateur trouvé:', user.email);
  console.log('   - userType:', user.userType);
  console.log('   - id:', user.id);

  const isValid = await compare(PASSWORD, user.password);
  if (!isValid) {
    console.log('\n❌ Mot de passe INCORRECT pour Admin123');
    console.log('\n👉 Exécute: npm run create-support-user pour réinitialiser le mot de passe');
    return;
  }

  console.log('\n✅ Mot de passe valide !');
  console.log('\n🚀 Connecte-toi avec:');
  console.log('   Email:', EMAIL);
  console.log('   Mot de passe:', PASSWORD);
  console.log('\n   URL: http://localhost:3000/login?callbackUrl=/admin/dashboard');
}

verify()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
