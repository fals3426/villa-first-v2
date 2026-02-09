import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { paymentService } from '@/server/services/payments/payment.service';
import { createPreauthorizationSchema } from '@/lib/validations/payment.schema';

/**
 * POST /api/bookings/[id]/payment/preauthorize
 * 
 * Crée une préautorisation de 25€ pour une réservation (Story 5.3)
 */
export async function POST(
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

    // Vérifier que l'utilisateur est un locataire
    if (session.user.userType !== 'tenant') {
      return NextResponse.json(
        { error: 'Seuls les locataires peuvent créer une préautorisation' },
        { status: 403 }
      );
    }

    const userId = session.user.id;
    const { id: bookingId } = await context.params;
    const body = await request.json();

    // Valider les données
    const validation = createPreauthorizationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', issues: validation.error.issues },
        { status: 400 }
      );
    }

    // Créer la préautorisation
    const payment = await paymentService.createPreauthorization(
      bookingId,
      userId,
      validation.data.paymentMethodId
    );

    return NextResponse.json(
      {
        success: true,
        data: payment,
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur lors de la création de la préautorisation:', error);

    if (error instanceof Error) {
      const errorMessage = error.message;

      if (errorMessage === 'STRIPE_NOT_CONFIGURED') {
        return NextResponse.json(
          { error: 'Le système de paiement n\'est pas configuré' },
          { status: 503 }
        );
      }

      if (errorMessage === 'BOOKING_NOT_FOUND') {
        return NextResponse.json(
          { error: 'Réservation introuvable' },
          { status: 404 }
        );
      }

      if (errorMessage === 'BOOKING_NOT_OWNED') {
        return NextResponse.json(
          { error: 'Vous n\'avez pas l\'autorisation pour cette réservation' },
          { status: 403 }
        );
      }

      if (errorMessage === 'BOOKING_NOT_PENDING') {
        return NextResponse.json(
          { error: 'Cette réservation ne peut plus être sécurisée' },
          { status: 400 }
        );
      }

      if (errorMessage === 'PREAUTHORIZATION_ALREADY_EXISTS') {
        return NextResponse.json(
          { error: 'Une préautorisation existe déjà pour cette réservation' },
          { status: 409 }
        );
      }

      if (errorMessage === 'CARD_DECLINED') {
        return NextResponse.json(
          {
            error: 'Votre carte a été refusée. Veuillez vérifier vos informations ou utiliser une autre carte.',
            code: 'CARD_DECLINED',
          },
          { status: 402 }
        );
      }

      if (errorMessage === 'INVALID_PAYMENT_METHOD') {
        return NextResponse.json(
          {
            error: 'Méthode de paiement invalide. Veuillez réessayer.',
            code: 'INVALID_PAYMENT_METHOD',
          },
          { status: 400 }
        );
      }

      if (errorMessage === 'PAYMENT_ATTEMPT_FAILED') {
        return NextResponse.json(
          {
            error: 'Le paiement a échoué. Veuillez réessayer.',
            code: 'PAYMENT_ATTEMPT_FAILED',
          },
          { status: 402 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création de la préautorisation' },
      { status: 500 }
    );
  }
}
