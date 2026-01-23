import { prisma } from '@/lib/prisma';
import { auditService } from '@/server/services/audit/audit.service';
import { unlink } from 'fs/promises';
import path from 'path';

export const kycDeletionService = {
  async deleteKycData(userId: string) {
    const kyc = await prisma.kycVerification.findUnique({
      where: { userId },
    });

    if (!kyc) {
      return;
    }

    // Supprimer le document stocké
    if (kyc.documentUrl) {
      try {
        // Extraire le chemin depuis l'URL
        const urlPath = kyc.documentUrl.replace(/^\/secure\//, '');
        const filepath = path.join(process.cwd(), 'secure', urlPath);
        await unlink(filepath);
      } catch (error) {
        // Ne pas faire échouer si le fichier n'existe pas
        console.error('Error deleting KYC document:', error);
      }
    }

    // Supprimer les données KYC
    await prisma.kycVerification.delete({
      where: { userId },
    });

    // Audit log
    await auditService.logAction(
      userId,
      'kyc_deleted',
      'kyc',
      kyc.id,
      {
        deletedAt: new Date().toISOString(),
        reason: 'user_request',
      }
    );
  },
};
