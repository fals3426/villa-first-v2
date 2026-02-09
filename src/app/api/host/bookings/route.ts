import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/host/bookings
 * 
 * Récupère les réservations pour les annonces de l'hôte connecté (Story 5.6)
 * 
 * Query params:
 * - listingId?: string (filtrer par annonce)
 * - status?: string (pending, confirmed, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    if (session.user.userType !== 'host') {
      return NextResponse.json(
        { error: 'Seuls les hôtes peuvent accéder à cette ressource' },
        { status: 403 }
      );
    }

    const hostId = session.user.id;
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');
    const status = searchParams.get('status');

    // Construire la requête
    const where: any = {
      listing: {
        hostId, // Seulement les réservations pour les annonces de l'hôte
      },
    };

    if (listingId) {
      where.listingId = listingId;
    }

    if (status) {
      where.status = status;
    }

    // Récupérer les réservations avec détails
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            location: true,
            capacity: true,
            validationRule: true,
            validationThreshold: true,
          },
        },
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            expiresAt: true,
            stripePaymentIntentId: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Grouper par annonce pour faciliter l'affichage
    const bookingsByListing = bookings.reduce((acc, booking) => {
      const listingId = booking.listingId;
      if (!acc[listingId]) {
        acc[listingId] = {
          listing: booking.listing,
          bookings: [],
        };
      }
      acc[listingId].bookings.push(booking);
      return acc;
    }, {} as Record<string, { listing: typeof bookings[0]['listing']; bookings: typeof bookings }>);

    return NextResponse.json(
      {
        data: bookings,
        grouped: Object.values(bookingsByListing),
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
