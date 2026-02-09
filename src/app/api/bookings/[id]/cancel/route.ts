import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { auditService } from '@/server/services/audit/audit.service';
import { calendarService } from '@/server/services/listings/calendar.service';

/**
 * POST /api/bookings/[id]/cancel
 * 
 * Annule une réservation (Story 5.2)
 * Permet d'annuler une réservation avec statut "price_changed" ou autre
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

    const userId = session.user.id;
    const { id: bookingId } = await context.params;

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
      return NextResponse.json(
        { error: 'Réservation introuvable' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est le locataire ou l'hôte
    const isTenant = booking.tenantId === userId;
    const isHost = booking.listing.hostId === userId;

    if (!isTenant && !isHost) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas l\'autorisation d\'annuler cette réservation' },
        { status: 403 }
      );
    }

    // Ne pas permettre l'annulation de réservations confirmées (sauf cas spéciaux)
    if (booking.status === 'confirmed') {
      return NextResponse.json(
        { error: 'Les réservations confirmées ne peuvent pas être annulées via cette route' },
        { status: 400 }
      );
    }

    // Annuler la réservation
    const cancelledBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'cancelled',
        updatedAt: new Date(),
      },
    });

    // Libérer les dates dans le calendrier si la réservation était en pending ou price_changed
    if (booking.status === 'pending' || booking.status === 'price_changed') {
      // Note: Pour simplifier, on libère les dates
      // En production, on pourrait vouloir garder un historique
      await calendarService.unblockDatesForBooking(
        booking.listingId,
        booking.checkIn,
        booking.checkOut
      );
    }

    // Audit
    await auditService.logAction(
      userId,
      'booking_cancelled',
      'booking',
      bookingId,
      {
        listingId: booking.listingId,
        previousStatus: booking.status,
        cancelledBy: isTenant ? 'tenant' : 'host',
      }
    );

    return NextResponse.json(
      {
        success: true,
        data: cancelledBooking,
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la réservation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'annulation de la réservation' },
      { status: 500 }
    );
  }
}
