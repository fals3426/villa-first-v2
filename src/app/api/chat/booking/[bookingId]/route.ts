import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { chatService } from '@/server/services/chat/chat.service';

/**
 * GET /api/chat/booking/[bookingId]
 * 
 * Récupère ou crée le chat pour une réservation (Story 6.1)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ bookingId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { bookingId } = await context.params;

    // Récupérer la réservation
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: {
          select: {
            id: true,
            hostId: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    }

    // Vérifier l'accès
    const isTenant = booking.tenantId === session.user.id;
    const isHost = booking.listing.hostId === session.user.id;

    if (!isTenant && !isHost) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas accès à cette réservation' },
        { status: 403 }
      );
    }

    // Vérifier que la réservation est active (pending, confirmed ou price_changed)
    if (!['pending', 'confirmed', 'price_changed'].includes(booking.status)) {
      return NextResponse.json(
        { error: 'Le chat n\'est disponible que pour les réservations actives' },
        { status: 400 }
      );
    }

    // Récupérer ou créer le chat
    const chat = await chatService.getOrCreateChat(
      booking.listingId,
      booking.tenantId,
      booking.listing.hostId
    );

    return NextResponse.json(
      {
        data: chat,
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération du chat:', error);

    if (error instanceof Error) {
      if (error.message === 'NO_ACTIVE_BOOKING') {
        return NextResponse.json(
          { error: 'Aucune réservation active pour cette annonce' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erreur lors de la récupération du chat' },
      { status: 500 }
    );
  }
}
