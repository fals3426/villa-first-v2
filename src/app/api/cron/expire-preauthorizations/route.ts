import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isMockPayment } from '@/server/services/payments/payment.service';
import { calendarService } from '@/server/services/listings/calendar.service';
import { auditService } from '@/server/services/audit/audit.service';

/**
 * POST /api/cron/expire-preauthorizations
 * 
 * Job cron pour expirer automatiquement les préautorisations (Story 5.8)
 * À exécuter quotidiennement (ex: via Vercel Cron ou service externe)
 * 
 * Headers requis (sécurité):
 * - Authorization: Bearer <CRON_SECRET>
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier le secret cron (sécurité)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const now = new Date();

    // Trouver toutes les préautorisations expirées
    const expiredPayments = await prisma.payment.findMany({
      where: {
        status: 'pending',
        expiresAt: {
          lte: now, // Expirées
        },
      },
      include: {
        booking: {
          select: {
            id: true,
            listingId: true,
            tenantId: true,
            checkIn: true,
            checkOut: true,
            status: true,
          },
        },
      },
    });

    const results = [];

    for (const payment of expiredPayments) {
      try {
        // Annuler la préautorisation Stripe si configuré (ignorer les paiements simulés)
        if (payment.stripePaymentIntentId && !isMockPayment(payment.stripePaymentIntentId)) {
          try {
            const { cancelPaymentIntent } = await import('@/lib/stripe');
            const { isStripeConfigured } = await import('@/lib/stripe');
            if (isStripeConfigured()) {
              await cancelPaymentIntent(payment.stripePaymentIntentId);
            }
          } catch (error) {
            console.error(
              `Erreur lors de l'annulation Stripe pour ${payment.id}:`,
              error
            );
            // Continue quand même avec la mise à jour en base
          }
        }

        // Mettre à jour le statut de la préautorisation
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'expired', updatedAt: new Date() },
        });

        // Mettre à jour le statut de la réservation si elle est encore pending
        if (payment.booking.status === 'pending') {
          await prisma.booking.update({
            where: { id: payment.booking.id },
            data: { status: 'expired', updatedAt: new Date() },
          });

          // Libérer les dates dans le calendrier
          await calendarService.unblockDatesForBooking(
            payment.booking.listingId,
            payment.booking.checkIn,
            payment.booking.checkOut
          );
        }

        // Audit
        await auditService.logAction(
          payment.booking.tenantId,
          'payment_preauthorization_expired',
          'payment',
          payment.id,
          {
            bookingId: payment.booking.id,
            listingId: payment.booking.listingId,
            expiredAt: now.toISOString(),
          }
        );

        results.push({
          paymentId: payment.id,
          bookingId: payment.booking.id,
          success: true,
        });
      } catch (error) {
        console.error(`Erreur lors de l'expiration du paiement ${payment.id}:`, error);
        results.push({
          paymentId: payment.id,
          bookingId: payment.booking.id,
          success: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          expiredCount: results.filter((r) => r.success).length,
          failedCount: results.filter((r) => !r.success).length,
          results,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de l\'expiration des préautorisations:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'expiration des préautorisations' },
      { status: 500 }
    );
  }
}
