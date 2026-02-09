import { prisma } from '@/lib/prisma';
import { isStripeConfigured, createPaymentIntent, getPaymentIntent, stripe as stripeClient } from '@/lib/stripe';
import { auditService } from '@/server/services/audit/audit.service';

const PREAUTHORIZATION_AMOUNT = 2500; // 25€ en centimes
const MOCK_PAYMENT_PREFIX = 'pi_mock_';

/** Vérifie si un Payment Intent est une simulation (développement) */
export function isMockPayment(paymentIntentId: string): boolean {
  return paymentIntentId.startsWith(MOCK_PAYMENT_PREFIX);
}

/**
 * Service pour gérer les paiements et préautorisations (Story 5.3)
 */
export const paymentService = {
  /**
   * Crée une préautorisation de 25€ pour une réservation (Story 5.3)
   */
  async createPreauthorization(
    bookingId: string,
    tenantId: string,
    paymentMethodId: string
  ) {
    // Vérifier que Stripe est configuré
    if (!isStripeConfigured()) {
      throw new Error('STRIPE_NOT_CONFIGURED');
    }

    // Vérifier que la réservation existe et appartient au locataire
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            hostId: true,
          },
        },
      },
    });

    if (!booking) {
      throw new Error('BOOKING_NOT_FOUND');
    }

    if (booking.tenantId !== tenantId) {
      throw new Error('BOOKING_NOT_OWNED');
    }

    if (booking.status !== 'pending') {
      throw new Error('BOOKING_NOT_PENDING');
    }

    // Vérifier qu'il n'y a pas déjà une préautorisation active
    const existingPayment = await prisma.payment.findFirst({
      where: {
        bookingId,
        status: { in: ['pending', 'captured'] },
      },
    });

    if (existingPayment) {
      throw new Error('PREAUTHORIZATION_ALREADY_EXISTS');
    }

    try {
      // Créer le Payment Intent Stripe
      const paymentIntent = await createPaymentIntent(
        PREAUTHORIZATION_AMOUNT,
        paymentMethodId,
        {
          bookingId,
          tenantId,
          listingId: booking.listingId,
        }
      );

      // Enregistrer la préautorisation dans la base de données
      const payment = await prisma.payment.create({
        data: {
          bookingId,
          amount: PREAUTHORIZATION_AMOUNT,
          stripePaymentIntentId: paymentIntent.id,
          status: 'pending',
          // Expiration par défaut : 7 jours (Story 5.8)
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        include: {
          booking: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      });

      // Audit
      await auditService.logAction(
        tenantId,
        'payment_preauthorization_created',
        'payment',
        payment.id,
        {
          bookingId,
          amount: PREAUTHORIZATION_AMOUNT,
          stripePaymentIntentId: paymentIntent.id,
        }
      );

      return payment;
    } catch (error: any) {
      // Convertir les erreurs Stripe en erreurs métier
      if (error.type === 'StripeCardError') {
        throw new Error('CARD_DECLINED');
      }
      if (error.type === 'StripeInvalidRequestError') {
        throw new Error('INVALID_PAYMENT_METHOD');
      }
      if (error.code === 'payment_intent_payment_attempt_failed') {
        throw new Error('PAYMENT_ATTEMPT_FAILED');
      }

      // Erreur générique
      console.error('Stripe error:', error);
      throw new Error('PAYMENT_CREATION_FAILED');
    }
  },

  /**
   * Simule une préautorisation (dev uniquement, sans Stripe)
   */
  async simulatePreauthorization(bookingId: string, tenantId: string) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SIMULATION_NOT_ALLOWED_IN_PRODUCTION');
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: {
          select: { id: true, title: true, hostId: true },
        },
      },
    });

    if (!booking) throw new Error('BOOKING_NOT_FOUND');
    if (booking.tenantId !== tenantId) throw new Error('BOOKING_NOT_OWNED');
    if (booking.status !== 'pending') throw new Error('BOOKING_NOT_PENDING');

    const existingPayment = await prisma.payment.findFirst({
      where: {
        bookingId,
        status: { in: ['pending', 'captured'] },
      },
    });

    if (existingPayment) throw new Error('PREAUTHORIZATION_ALREADY_EXISTS');

    const mockPaymentIntentId = `${MOCK_PAYMENT_PREFIX}${bookingId}_${Date.now()}`;

    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount: PREAUTHORIZATION_AMOUNT,
        stripePaymentIntentId: mockPaymentIntentId,
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      include: {
        booking: {
          select: { id: true, status: true },
        },
      },
    });

    await auditService.logAction(
      tenantId,
      'payment_preauthorization_simulated',
      'payment',
      payment.id,
      { bookingId, amount: PREAUTHORIZATION_AMOUNT }
    );

    return payment;
  },

  /**
   * Récupère le statut d'une préautorisation (Story 5.4)
   */
  async getPreauthorizationStatus(paymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!payment) {
      throw new Error('PAYMENT_NOT_FOUND');
    }

    // Synchroniser avec Stripe si configuré (ignorer les paiements simulés)
    if (isStripeConfigured() && payment.stripePaymentIntentId && !isMockPayment(payment.stripePaymentIntentId)) {
      try {
        const paymentIntent = await getPaymentIntent(payment.stripePaymentIntentId);

        // Mettre à jour le statut si nécessaire
        let newStatus = payment.status;
        if (paymentIntent.status === 'succeeded' && payment.status === 'pending') {
          newStatus = 'captured';
        } else if (paymentIntent.status === 'canceled' && payment.status === 'pending') {
          newStatus = 'cancelled';
        }

        if (newStatus !== payment.status) {
          await prisma.payment.update({
            where: { id: paymentId },
            data: { status: newStatus },
          });
          payment.status = newStatus;
        }
      } catch (error) {
        console.error('Error syncing with Stripe:', error);
        // Continue avec le statut de la base de données
      }
    }

    return payment;
  },

  /**
   * Annule une préautorisation (Story 5.2, 5.8)
   */
  async cancelPreauthorization(paymentId: string, userId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          select: {
            id: true,
            tenantId: true,
          },
        },
      },
    });

    if (!payment) {
      throw new Error('PAYMENT_NOT_FOUND');
    }

    // Vérifier que l'utilisateur est le locataire ou l'hôte
    const isTenant = payment.booking.tenantId === userId;
    if (!isTenant) {
      // TODO: Vérifier si l'utilisateur est l'hôte
      throw new Error('PAYMENT_NOT_OWNED');
    }

    if (payment.status !== 'pending') {
      throw new Error('PAYMENT_NOT_CANCELLABLE');
    }

    // Annuler dans Stripe si configuré (ignorer les paiements simulés)
    if (isStripeConfigured() && payment.stripePaymentIntentId && !isMockPayment(payment.stripePaymentIntentId)) {
      try {
        const { cancelPaymentIntent } = await import('@/lib/stripe');
        await cancelPaymentIntent(payment.stripePaymentIntentId);
      } catch (error) {
        console.error('Error cancelling Stripe payment intent:', error);
        // Continue quand même avec la mise à jour en base
      }
    }

    // Mettre à jour le statut
    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'cancelled' },
    });

    // Audit
    await auditService.logAction(
      userId,
      'payment_preauthorization_cancelled',
      'payment',
      paymentId,
      {
        bookingId: payment.bookingId,
      }
    );

      return updated;
    },

  /**
   * Capture toutes les préautorisations pour une annonce (Story 5.7)
   */
  async captureAllPreauthorizations(listingId: string) {
    // Trouver toutes les préautorisations pending pour les réservations actives de cette annonce
    const pendingPayments = await prisma.payment.findMany({
      where: {
        status: 'pending',
        booking: {
          listingId,
          status: 'pending',
        },
      },
      include: {
        booking: {
          select: {
            id: true,
            tenantId: true,
          },
        },
      },
    });

    const results: Array<{
      paymentId: string;
      bookingId: string;
      success: boolean;
      error?: string;
    }> = [];

    // Capturer chaque préautorisation
    for (const payment of pendingPayments) {
      try {
        if (!isMockPayment(payment.stripePaymentIntentId) && isStripeConfigured()) {
          const { capturePaymentIntent } = await import('@/lib/stripe');
          await capturePaymentIntent(payment.stripePaymentIntentId);
        }

        // Mettre à jour le statut en base (pour mock et Stripe)
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'captured', updatedAt: new Date() },
        });

        // Audit
        await auditService.logAction(
          payment.booking.tenantId,
          'payment_captured',
          'payment',
          payment.id,
          {
            bookingId: payment.bookingId,
            amount: payment.amount,
            listingId,
          }
        );

        results.push({
          paymentId: payment.id,
          bookingId: payment.bookingId,
          success: true,
        });
      } catch (error: any) {
        console.error(`Erreur lors de la capture du paiement ${payment.id}:`, error);

        // Marquer comme failed
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'failed', updatedAt: new Date() },
        });

        // Audit
        await auditService.logAction(
          payment.booking.tenantId,
          'payment_capture_failed',
          'payment',
          payment.id,
          {
            bookingId: payment.bookingId,
            error: error.message || 'Erreur inconnue',
          }
        );

        results.push({
          paymentId: payment.id,
          bookingId: payment.bookingId,
          success: false,
          error: error.message || 'Erreur lors de la capture',
        });
      }
    }

    return results;
  },

  /**
   * Rembourse un paiement (Story 9.6)
   */
  async refundPayment(paymentId: string, amount: number, supportUserId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error('PAYMENT_NOT_FOUND');
    }

    if (payment.status !== 'captured') {
      throw new Error('PAYMENT_NOT_CAPTURED');
    }

    if (!payment.stripePaymentIntentId) {
      throw new Error('NO_STRIPE_PAYMENT_INTENT');
    }

    if (isMockPayment(payment.stripePaymentIntentId)) {
      throw new Error('REMBOURSEMENT_NON_DISPONIBLE_SIMULATION');
    }

    // Effectuer le remboursement via Stripe
    if (!isStripeConfigured() || !stripeClient) {
      throw new Error('STRIPE_NOT_CONFIGURED');
    }

    const refund = await stripeClient.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: amount, // Montant en centimes
    });

    // Mettre à jour le statut du paiement
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'refunded',
        updatedAt: new Date(),
      },
    });

    return {
      id: refund.id,
      amount: refund.amount,
      status: refund.status,
    };
  },
};
