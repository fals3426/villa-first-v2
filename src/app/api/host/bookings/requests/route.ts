import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { bookingRequestService } from '@/server/services/bookings/booking-request.service';
import { z } from 'zod';

const getRequestsSchema = z.object({
  listingId: z.string().cuid().optional(),
  status: z.enum(['pending', 'accepted', 'rejected', 'confirmed', 'expired', 'cancelled', 'price_changed']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * GET /api/host/bookings/requests
 * 
 * Récupère les demandes de réservation pour l'hôte avec filtres (Story 7.1)
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

    const { searchParams } = new URL(request.url);
    const filters: {
      listingId?: string;
      status?: string;
      startDate?: Date;
      endDate?: Date;
    } = {};

    if (searchParams.get('listingId')) {
      filters.listingId = searchParams.get('listingId')!;
    }

    if (searchParams.get('status')) {
      filters.status = searchParams.get('status')!;
    }

    if (searchParams.get('startDate')) {
      filters.startDate = new Date(searchParams.get('startDate')!);
    }

    if (searchParams.get('endDate')) {
      filters.endDate = new Date(searchParams.get('endDate')!);
    }

    const requests = await bookingRequestService.getHostBookingRequests(session.user.id, filters);

    return NextResponse.json(
      {
        data: requests,
        meta: {
          count: requests.length,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des demandes' },
      { status: 500 }
    );
  }
}
