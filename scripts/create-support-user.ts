/**
 * Script pour créer ou transformer un utilisateur en support/admin
 * 
 * Usage:
 *   node scripts/create-support-user-wrapper.js
 *   (ou npm run create-support-user si le script est ajouté)
 * 
 * Ce script permet de :
 * - Créer un nouvel utilisateur avec le rôle support
 * - Transformer un utilisateur existant en support (et hasher le mot de passe si besoin)
 */

import { prisma } from '../src/lib/prisma';
import { hash } from 'bcryptjs';

const EMAIL = 'admin@villafirst.com';
const PASSWORD = 'Admin123'; // Pas de caractère spécial pour éviter les erreurs de saisie

function isValidCuid(id: string | null): boolean {
  return !!id && id.length >= 20 && id.length <= 30 && /^c[a-z0-9]+$/i.test(id);
}

async function createSupportUser() {
  try {
    console.log('🔍 Recherche de l\'utilisateur...');
    
    const existing = await prisma.user.findUnique({
      where: { email: EMAIL },
    });

    if (existing && !isValidCuid(existing.id)) {
      console.log('⚠️  Utilisateur admin trouvé avec un ID invalide (vide ou corrompu). Suppression...');
      await prisma.user.delete({ where: { email: EMAIL } });
      console.log('   Ancien enregistrement supprimé.');
      // Continue pour créer un nouvel utilisateur propre
    } else if (existing) {
      const hashedPassword = await hash(PASSWORD, 12);
      await prisma.user.update({
        where: { email: EMAIL },
        data: { userType: 'support', password: hashedPassword },
      });
      console.log(`✅ Utilisateur ${EMAIL} mis à jour : rôle support + mot de passe hashé`);
      console.log(`📧 Email: ${EMAIL}`);
      console.log(`🔑 Mot de passe: ${PASSWORD}`);
      printSuccess();
      return;
    }

    if (!existing || !isValidCuid(existing?.id)) {
      // Créer un nouvel utilisateur support
      const hashedPassword = await hash(PASSWORD, 12);
      await prisma.user.create({
        data: {
          email: EMAIL,
          password: hashedPassword,
          userType: 'support',
        },
      });
      console.log(`✅ Utilisateur support créé avec succès !`);
      console.log(`📧 Email: ${EMAIL}`);
      console.log(`🔑 Mot de passe: ${PASSWORD}`);
    }

    printSuccess();
  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  }
}

function printSuccess() {
  console.log('\n🚀 Tu peux maintenant te connecter et accéder aux pages admin :');
    console.log('   - /admin/dashboard');
    console.log('   - /admin/verifications');
    console.log('   - /admin/incidents');
    console.log('   - /admin/audit-logs');
}

createSupportUser()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
