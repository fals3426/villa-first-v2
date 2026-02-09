/**
 * GET /api/bookings/[id]
 * Récupère le détail d'une réservation (pour la page détail)
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id: bookingId } = await context.params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            description: true,
            address: true,
            location: true,
            capacity: true,
            pricePerPlace: true,
            photos: {
              orderBy: { position: 'asc' },
              select: { url: true, category: true },
            },
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            expiresAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        checkIns: {
          select: { id: true, photoUrl: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    }

    if (booking.tenantId !== session.user.id) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Nombre de colocataires (réservations confirmées qui chevauchent)
    const overlappingBookings = await prisma.booking.count({
      where: {
        listingId: booking.listingId,
        status: 'confirmed',
        id: { not: bookingId },
        checkIn: { lt: booking.checkOut },
        checkOut: { gt: booking.checkIn },
      },
    });

    return NextResponse.json({
      data: {
        ...booking,
        checkIn: booking.checkIn.toISOString(),
        checkOut: booking.checkOut.toISOString(),
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
        listing: booking.listing,
        colocationCount: overlappingBookings + 1, // +1 pour inclure le locataire actuel
      },
    });
  } catch (error) {
    console.error('Erreur récupération réservation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}
