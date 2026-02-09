/**
 * Utilitaires pour la vérification d'annonces
 * Story 2.2, 2.6 - Différenciation visuelle annonces vérifiées
 */

import { verificationService } from '@/server/services/verification/verification.service';
import type { VerificationStatus as BadgeStatus } from '@/components/features/verification/VerifiedBadge';

/**
 * Convertit le statut de VerificationRequest vers le statut du VerifiedBadge
 */
export function mapVerificationStatusToBadgeStatus(
  requestStatus: 'pending' | 'in_review' | 'approved' | 'rejected' | 'suspended' | 'revoked' | null
): BadgeStatus {
  if (!requestStatus) {
    return 'not_verified';
  }

  switch (requestStatus) {
    case 'approved':
      return 'verified';
    case 'pending':
    case 'in_review':
      return 'pending';
    case 'suspended':
    case 'revoked':
      return 'suspended';
    case 'rejected':
    default:
      return 'not_verified';
  }
}

/**
 * Helper pour obtenir le statut de vérification d'une annonce
 * Utilisé dans les services listings pour exposer isVerified
 */
export async function getListingVerificationStatus(listingId: string) {
  return verificationService.getListingVerificationStatus(listingId);
}
