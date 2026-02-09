/**
 * POST /api/bookings/[id]/payment/simulate
 * Simule une préautorisation (développement uniquement, quand Stripe n'est pas configuré)
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { paymentService } from '@/server/services/payments/payment.service';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Simulation non disponible en production' },
        { status: 403 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    if (session.user.userType !== 'tenant') {
      return NextResponse.json(
        { error: 'Seuls les locataires peuvent créer une préautorisation' },
        { status: 403 }
      );
    }

    const { id: bookingId } = await context.params;

    const payment = await paymentService.simulatePreauthorization(
      bookingId,
      session.user.id
    );

    return NextResponse.json(
      {
        success: true,
        data: payment,
        meta: { timestamp: new Date().toISOString(), simulated: true },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur simulation préautorisation:', error);

    if (error instanceof Error) {
      const msg = error.message;
      if (msg === 'BOOKING_NOT_FOUND') {
        return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
      }
      if (msg === 'BOOKING_NOT_OWNED') {
        return NextResponse.json(
          { error: "Vous n'avez pas l'autorisation pour cette réservation" },
          { status: 403 }
        );
      }
      if (msg === 'BOOKING_NOT_PENDING') {
        return NextResponse.json(
          { error: 'Cette réservation ne peut plus être sécurisée' },
          { status: 400 }
        );
      }
      if (msg === 'PREAUTHORIZATION_ALREADY_EXISTS') {
        return NextResponse.json(
          { error: 'Une préautorisation existe déjà pour cette réservation' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erreur lors de la simulation' },
      { status: 500 }
    );
  }
}
