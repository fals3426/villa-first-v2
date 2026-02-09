import { prisma } from '@/lib/prisma';
import { auditService } from '@/server/services/audit/audit.service';
import { notificationService } from '@/server/services/notifications/notification.service';
import { paymentService } from '@/server/services/payments/payment.service';

/**
 * Service de remboursement pour le support (Story 9.6)
 */
export const refundService = {
  /**
   * Rembourse un locataire (Story 9.6)
   */
  async refundBooking(
    bookingId: string,
    supportUserId: string,
    amount: number | null, // null = remboursement total
    reason: string
  ) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        tenant: {
          select: {
            id: true,
            email: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            hostId: true,
          },
        },
        payments: {
          where: {
            status: 'captured',
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!booking) {
      throw new Error('BOOKING_NOT_FOUND');
    }

    // Trouver le paiement capturé
    const capturedPayment = booking.payments[0];
    if (!capturedPayment) {
      throw new Error('NO_CAPTURED_PAYMENT');
    }

    // Calculer le montant à rembourser
    const refundAmount = amount !== null ? amount : capturedPayment.amount;

    if (refundAmount > capturedPayment.amount) {
      throw new Error('REFUND_AMOUNT_EXCEEDS_PAYMENT');
    }

    // Effectuer le remboursement via Stripe
    let refundResult;
    try {
      refundResult = await paymentService.refundPayment(
        capturedPayment.id,
        refundAmount,
        supportUserId
      );
    } catch (err) {
      throw new Error('REFUND_FAILED');
    }

    // Mettre à jour le statut de la réservation
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'cancelled', // On pourrait ajouter un statut "refunded" si nécessaire
        updatedAt: new Date(),
      },
    });

    // Créer un enregistrement de remboursement (on pourrait créer un modèle Refund)
    // Pour l'instant, on utilise les audit logs

    // Audit log
    await auditService.logAction(supportUserId, 'BOOKING_REFUNDED', 'Booking', bookingId, {
      bookingId,
      refundAmount,
      originalAmount: capturedPayment.amount,
      reason,
      stripeRefundId: refundResult.id,
      isPartialRefund: refundAmount < capturedPayment.amount,
    });

    // Notifier le locataire
    await notificationService.sendNotification(booking.tenant.id, 'new_booking', {
      title: 'Remboursement effectué',
      message: `Un remboursement de ${(refundAmount / 100).toFixed(2)}€ a été effectué pour votre réservation "${booking.listing.title}".`,
      url: `/bookings`,
      listingTitle: booking.listing.title,
    }).catch((err) => {
      console.error('Erreur lors de l\'envoi de la notification:', err);
    });

    return {
      success: true,
      bookingId,
      refundAmount,
      stripeRefundId: refundResult.id,
    };
  },
};
