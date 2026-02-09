import { prisma } from '@/lib/prisma';
import { auditService } from '@/server/services/audit/audit.service';
import { kycService } from '@/server/services/kyc/kyc.service';

export type VerificationRequestStatus =
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'suspended'
  | 'revoked';

interface CreateVerificationRequestInput {
  hostId: string;
  listingId: string;
  documents: {
    storageUrl: string;
    fileType: string;
    fileSize: number;
    originalFileName: string;
  }[];
}

export const verificationService = {
  async createVerificationRequest(input: CreateVerificationRequestInput) {
    const { hostId, listingId, documents } = input;

    // Vérifier que l'utilisateur est bien KYC vérifié
    const isKycVerified = await kycService.checkKycVerified(hostId);
    if (!isKycVerified) {
      throw new Error('HOST_KYC_NOT_VERIFIED');
    }

    // TODO: Vérifier l'ownership de l'annonce (listingId) quand le modèle Listing sera disponible

    // Vérifier qu'il n'y a pas déjà une demande en cours pour cette annonce
    const existing = await prisma.verificationRequest.findFirst({
      where: {
        hostId,
        listingId,
        status: {
          in: ['pending', 'in_review'],
        },
      },
    });

    if (existing) {
      throw new Error('VERIFICATION_REQUEST_ALREADY_EXISTS');
    }

    const verificationRequest = await prisma.verificationRequest.create({
      data: {
        hostId,
        listingId,
        status: 'pending',
        documents: {
          create: documents.map((doc) => ({
            storageUrl: doc.storageUrl,
            fileType: doc.fileType,
            fileSize: doc.fileSize,
            originalFileName: doc.originalFileName,
          })),
        },
      },
      include: {
        documents: true,
      },
    });

    // Audit
    await auditService.logAction(
      hostId,
      'verification_request_created',
      'verification_request',
      verificationRequest.id,
      {
        listingId,
        documentsCount: documents.length,
      }
    );

    return verificationRequest;
  },

  async getLatestRequestForListing(hostId: string, listingId: string) {
    return prisma.verificationRequest.findFirst({
      where: { hostId, listingId },
      orderBy: { createdAt: 'desc' },
      include: { documents: true },
    });
  },

  /**
   * Détermine le statut de vérification d'une annonce basé sur la dernière demande
   * Retourne le statut compatible avec VerifiedBadge
   */
  async getListingVerificationStatus(listingId: string): Promise<{
    status: 'verified' | 'pending' | 'suspended' | 'not_verified';
    details?: {
      idVerified?: boolean;
      titleVerified?: boolean;
      mandateVerified?: boolean;
      calendarSynced?: boolean;
    };
    verifiedAt?: Date;
  }> {
    const latestRequest = await prisma.verificationRequest.findFirst({
      where: { listingId },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestRequest) {
      return { status: 'not_verified' };
    }

    // Mapping VerificationRequestStatus -> VerifiedBadge status
    switch (latestRequest.status) {
      case 'approved':
        return {
          status: 'verified',
          details: {
            idVerified: true, // KYC vérifié (prérequis pour créer la demande)
            titleVerified: true, // Documents titre/mandat approuvés
            mandateVerified: true,
            calendarSynced: false, // TODO: à implémenter dans Epic 3
          },
          verifiedAt: latestRequest.updatedAt,
        };
      case 'pending':
      case 'in_review':
        return { status: 'pending' };
      case 'suspended':
      case 'revoked':
        return { status: 'suspended' };
      case 'rejected':
        return { status: 'not_verified' };
      default:
        return { status: 'not_verified' };
    }
  },

  /**
   * Liste toutes les demandes en attente pour le support
   */
  async listPendingRequests() {
    return prisma.verificationRequest.findMany({
      where: {
        status: {
          in: ['pending', 'in_review'],
        },
      },
      orderBy: { createdAt: 'asc' },
      include: {
        host: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            kycVerification: {
              select: {
                status: true,
              },
            },
          },
        },
        documents: true,
      },
    });
  },

  /**
   * Récupère une demande par ID avec toutes les relations
   */
  async getRequestById(requestId: string) {
    return prisma.verificationRequest.findUnique({
      where: { id: requestId },
      include: {
        host: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            kycVerification: {
              select: {
                status: true,
                verifiedAt: true,
              },
            },
          },
        },
        documents: true,
      },
    });
  },

  /**
   * Approuve une demande de vérification (Story 2.4)
   */
  async approveRequest(requestId: string, supportUserId: string) {
    const request = await prisma.verificationRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('VERIFICATION_REQUEST_NOT_FOUND');
    }

    // Vérifier que le statut permet l'approbation
    if (request.status !== 'pending' && request.status !== 'in_review') {
      throw new Error('INVALID_STATUS_TRANSITION');
    }

    const updated = await prisma.verificationRequest.update({
      where: { id: requestId },
      data: {
        status: 'approved',
        updatedAt: new Date(),
      },
    });

    // Audit
    await auditService.logAction(
      supportUserId,
      'verification_request_approved',
      'verification_request',
      requestId,
      {
        hostId: request.hostId,
        listingId: request.listingId,
        approvedBy: supportUserId,
      }
    );

    return updated;
  },

  /**
   * Rejette une demande de vérification (Story 2.4)
   */
  async rejectRequest(
    requestId: string,
    supportUserId: string,
    reason: string
  ) {
    if (!reason || reason.trim().length === 0) {
      throw new Error('REJECTION_REASON_REQUIRED');
    }

    const request = await prisma.verificationRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('VERIFICATION_REQUEST_NOT_FOUND');
    }

    // Vérifier que le statut permet le rejet
    if (request.status !== 'pending' && request.status !== 'in_review') {
      throw new Error('INVALID_STATUS_TRANSITION');
    }

    const updated = await prisma.verificationRequest.update({
      where: { id: requestId },
      data: {
        status: 'rejected',
        reason: reason.trim(),
        updatedAt: new Date(),
      },
    });

    // Audit
    await auditService.logAction(
      supportUserId,
      'verification_request_rejected',
      'verification_request',
      requestId,
      {
        hostId: request.hostId,
        listingId: request.listingId,
        reason: reason.trim(),
        rejectedBy: supportUserId,
      }
    );

    return updated;
  },

  /**
   * Suspend un badge vérifié (Story 2.5)
   */
  async suspendVerification(
    requestId: string,
    supportUserId: string,
    reason: string
  ) {
    if (!reason || reason.trim().length === 0) {
      throw new Error('SUSPENSION_REASON_REQUIRED');
    }

    const request = await prisma.verificationRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('VERIFICATION_REQUEST_NOT_FOUND');
    }

    // Seulement possible si actuellement approved
    if (request.status !== 'approved') {
      throw new Error('INVALID_STATUS_TRANSITION');
    }

    const updated = await prisma.verificationRequest.update({
      where: { id: requestId },
      data: {
        status: 'suspended',
        reason: reason.trim(),
        updatedAt: new Date(),
      },
    });

    // Audit
    await auditService.logAction(
      supportUserId,
      'verification_suspended',
      'verification_request',
      requestId,
      {
        hostId: request.hostId,
        listingId: request.listingId,
        reason: reason.trim(),
        suspendedBy: supportUserId,
      }
    );

    return updated;
  },

  /**
   * Révoque un badge vérifié (Story 2.5)
   */
  async revokeVerification(
    requestId: string,
    supportUserId: string,
    reason: string
  ) {
    if (!reason || reason.trim().length === 0) {
      throw new Error('REVOCATION_REASON_REQUIRED');
    }

    const request = await prisma.verificationRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('VERIFICATION_REQUEST_NOT_FOUND');
    }

    // Possible si approved ou suspended
    if (request.status !== 'approved' && request.status !== 'suspended') {
      throw new Error('INVALID_STATUS_TRANSITION');
    }

    const updated = await prisma.verificationRequest.update({
      where: { id: requestId },
      data: {
        status: 'revoked',
        reason: reason.trim(),
        updatedAt: new Date(),
      },
    });

    // Audit
    await auditService.logAction(
      supportUserId,
      'verification_revoked',
      'verification_request',
      requestId,
      {
        hostId: request.hostId,
        listingId: request.listingId,
        reason: reason.trim(),
        revokedBy: supportUserId,
      }
    );

    return updated;
  },
};

