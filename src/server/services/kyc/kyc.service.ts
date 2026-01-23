import { prisma } from '@/lib/prisma';
import { secureStorageService } from '@/server/services/storage/secure-storage.service';
import { kycProvider } from '@/lib/kyc/provider';
import { encryptionService } from '@/server/services/security/encryption.service';
import { auditService } from '@/server/services/audit/audit.service';

export const kycService = {
  async initiateVerification(userId: string, documentFile: File) {
    // Upload sécurisé
    const documentUrl = await secureStorageService.uploadDocument(
      documentFile,
      userId,
      'kyc'
    );

    // Initier vérification avec provider
    const providerId = await kycProvider.initiateVerification(
      documentUrl,
      userId
    );

    // Créer ou mettre à jour l'enregistrement KYC
    const kyc = await prisma.kycVerification.upsert({
      where: { userId },
      create: {
        userId,
        documentUrl,
        status: 'pending',
        provider: 'mock', // À changer pour 'stripe' quand configuré
        providerId,
      },
      update: {
        documentUrl,
        status: 'pending',
        providerId,
        updatedAt: new Date(),
      },
    });

    // Pour le mock provider, simuler une vérification automatique après délai
    // En production, cela sera géré par le webhook du provider
    if (kyc.provider === 'mock') {
      setTimeout(async () => {
        try {
          const status = await kycProvider.checkStatus(providerId);
          if (status === 'verified') {
            // Simuler des données vérifiées pour le mock
            await kycService.storeVerifiedData(userId, {
              name: 'John Doe', // À remplacer par données réelles en production
              dateOfBirth: '1990-01-01',
              nationality: 'FR',
            });
          } else if (status === 'rejected') {
            await kycService.updateStatus(
              userId,
              status,
              'Document non valide'
            );
          }
        } catch (error) {
          console.error('Error updating mock KYC status:', error);
        }
      }, 3000); // 3 secondes pour simuler la vérification
    }

    return kyc;
  },

  async getStatus(userId: string) {
    return prisma.kycVerification.findUnique({
      where: { userId },
    });
  },

  async updateStatus(
    userId: string,
    status: 'verified' | 'rejected',
    rejectionReason?: string
  ) {
    const kyc = await prisma.kycVerification.update({
      where: { userId },
      data: {
        status,
        verifiedAt: status === 'verified' ? new Date() : undefined,
        rejectedAt: status === 'rejected' ? new Date() : undefined,
        rejectionReason:
          status === 'rejected' ? rejectionReason || 'Document non valide' : undefined,
        updatedAt: new Date(),
      },
    });

    // Audit log
    await auditService.logAction(
      userId,
      status === 'verified' ? 'kyc_verified' : 'kyc_rejected',
      'kyc',
      kyc.id,
      {
        status,
        verifiedAt: kyc.verifiedAt?.toISOString(),
        rejectedAt: kyc.rejectedAt?.toISOString(),
        rejectionReason: kyc.rejectionReason,
      }
    );

    return kyc;
  },

  async storeVerifiedData(
    userId: string,
    verifiedData: {
      name: string;
      dateOfBirth: string;
      nationality: string;
    }
  ) {
    // Chiffrer les données sensibles
    const encryptedName = encryptionService.encrypt(verifiedData.name);
    const encryptedNationality = encryptionService.encrypt(verifiedData.nationality);

    // Calculer date de conservation (RGPD: 3 ans après dernière utilisation)
    const retentionUntil = new Date();
    retentionUntil.setFullYear(retentionUntil.getFullYear() + 3);

    // Parser la date de naissance (format: DD/MM/YYYY ou YYYY-MM-DD)
    let dateOfBirth: Date;
    if (verifiedData.dateOfBirth.includes('/')) {
      const [day, month, year] = verifiedData.dateOfBirth.split('/');
      dateOfBirth = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      dateOfBirth = new Date(verifiedData.dateOfBirth);
    }

    // Mettre à jour
    const kyc = await prisma.kycVerification.update({
      where: { userId },
      data: {
        status: 'verified',
        verifiedName: encryptedName,
        verifiedDateOfBirth: dateOfBirth,
        verifiedNationality: encryptedNationality,
        verifiedAt: new Date(),
        retentionUntil,
        updatedAt: new Date(),
      },
    });

    // Audit log
    await auditService.logAction(
      userId,
      'kyc_verified',
      'kyc',
      kyc.id,
      {
        verifiedAt: new Date().toISOString(),
        retentionUntil: retentionUntil.toISOString(),
      }
    );

    return kyc;
  },

  async checkKycVerified(userId: string): Promise<boolean> {
    const kyc = await prisma.kycVerification.findUnique({
      where: { userId },
      select: { status: true },
    });

    return kyc?.status === 'verified';
  },

  async getVerifiedData(userId: string) {
    const kyc = await prisma.kycVerification.findUnique({
      where: { userId },
      select: {
        verifiedName: true,
        verifiedDateOfBirth: true,
        verifiedNationality: true,
        verifiedAt: true,
        retentionUntil: true,
      },
    });

    if (!kyc || !kyc.verifiedName) {
      return null;
    }

    // Déchiffrer les données
    return {
      name: encryptionService.decrypt(kyc.verifiedName),
      dateOfBirth: kyc.verifiedDateOfBirth,
      nationality: kyc.verifiedNationality
        ? encryptionService.decrypt(kyc.verifiedNationality)
        : null,
      verifiedAt: kyc.verifiedAt,
      retentionUntil: kyc.retentionUntil,
    };
  },
};
