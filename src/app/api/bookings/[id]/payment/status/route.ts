import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { paymentService } from '@/server/services/payments/payment.service';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/bookings/[id]/payment/status
 * 
 * Récupère le statut d'une préautorisation (Story 5.4)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'ID de paiement requis' },
        { status: 400 }
      );
    }

    // Récupérer le statut
    const payment = await paymentService.getPreauthorizationStatus(paymentId);

    // Vérifier que l'utilisateur a le droit de voir ce paiement
    // (locataire ou hôte de l'annonce)
    const booking = await prisma.booking.findUnique({
      where: { id: payment.bookingId },
      include: {
        listing: {
          select: {
            hostId: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Réservation introuvable' },
        { status: 404 }
      );
    }

    const isTenant = booking.tenantId === userId;
    const isHost = booking.listing.hostId === userId;

    if (!isTenant && !isHost) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas l\'autorisation de voir ce paiement' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        data: payment,
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération du statut:', error);

    if (error instanceof Error && error.message === 'PAYMENT_NOT_FOUND') {
      return NextResponse.json(
        { error: 'Paiement introuvable' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la récupération du statut' },
      { status: 500 }
    );
  }
}
