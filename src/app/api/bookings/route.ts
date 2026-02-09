import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { bookingService } from '@/server/services/bookings/booking.service';
import { createBookingSchema } from '@/lib/validations/booking.schema';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/bookings
 * 
 * Récupère les réservations de l'utilisateur connecté (Story 5.2)
 * 
 * Query params:
 * - status?: string (pending, confirmed, price_changed, etc.)
 */
export async function GET(request: NextRequest) {
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
    const status = searchParams.get('status');

    // Construire la requête
    const where: any = {
      tenantId: userId, // Seulement les réservations du locataire connecté
    };

    if (status) {
      where.status = status;
    }

    // Récupérer les réservations avec leurs paiements (Story 5.4)
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            location: true,
            capacity: true,
            pricePerPlace: true,
            photos: {
              where: { position: 0 },
              take: 1,
              select: { url: true },
            },
          },
        },
        payments: {
          // Inclure les paiements (préautorisations) pour afficher le statut (Story 5.4)
          select: {
            id: true,
            amount: true,
            status: true,
            expiresAt: true,
            stripePaymentIntentId: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        checkIns: {
          // Inclure les check-ins (Story 8.1)
          select: {
            id: true,
            photoUrl: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      {
        data: bookings,
        meta: {
          count: bookings.length,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des réservations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bookings
 * 
 * Crée une nouvelle réservation (Story 5.1)
 * 
 * Body:
 * - listingId: string
 * - checkIn: string (ISO datetime)
 * - checkOut: string (ISO datetime)
 */
export async function POST(request: NextRequest) {
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

    // Parser et valider le body
    const body = await request.json();
    const validation = createBookingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', issues: validation.error.issues },
        { status: 400 }
      );
    }

    // Créer la réservation
    const booking = await bookingService.createBooking(userId, validation.data);

    return NextResponse.json(
      {
        success: true,
        data: booking,
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur lors de la création de la réservation:', error);

    // Gérer les erreurs métier spécifiques
    if (error instanceof Error) {
      const errorMessage = error.message;

      if (errorMessage === 'USER_NOT_TENANT') {
        return NextResponse.json(
          { error: 'Seuls les locataires peuvent réserver' },
          { status: 403 }
        );
      }

      if (errorMessage === 'TENANT_KYC_NOT_VERIFIED') {
        return NextResponse.json(
          { error: 'Votre identité doit être vérifiée pour réserver' },
          { status: 403 }
        );
      }

      if (errorMessage === 'LISTING_NOT_FOUND') {
        return NextResponse.json(
          { error: 'Annonce introuvable' },
          { status: 404 }
        );
      }

      if (errorMessage === 'LISTING_NOT_PUBLISHED') {
        return NextResponse.json(
          { error: 'Cette annonce n\'est pas disponible à la réservation' },
          { status: 400 }
        );
      }

      if (errorMessage === 'CANNOT_BOOK_OWN_LISTING') {
        return NextResponse.json(
          { error: 'Vous ne pouvez pas réserver votre propre annonce' },
          { status: 400 }
        );
      }

      if (errorMessage === 'DATES_NOT_AVAILABLE') {
        return NextResponse.json(
          {
            error: 'Ces dates ne sont plus disponibles. Veuillez choisir d\'autres dates.',
            code: 'DATES_NOT_AVAILABLE',
          },
          { status: 400 }
        );
      }

      if (errorMessage === 'INVALID_DATE_RANGE') {
        return NextResponse.json(
          { error: 'La date de check-in doit être antérieure à la date de check-out' },
          { status: 400 }
        );
      }

      if (errorMessage === 'CHECK_IN_IN_PAST') {
        return NextResponse.json(
          { error: 'La date de check-in ne peut pas être dans le passé' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création de la réservation' },
      { status: 500 }
    );
  }
}
