import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { calendarService } from '@/server/services/listings/calendar.service';
import { setAvailabilitySchema } from '@/lib/validations/calendar.schema';

/**
 * GET /api/listings/[id]/calendar
 * Récupère les créneaux de disponibilité pour un mois donné (Story 3.7)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listingId } = await context.params;
    const { searchParams } = new URL(request.url);
    
    const month = parseInt(searchParams.get('month') || new Date().getMonth().toString());
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    const slots = await calendarService.getCalendarForListing(listingId, month, year);

    return NextResponse.json({
      data: slots,
      meta: { month, year },
    });
  } catch (error: any) {
    console.error('Error fetching calendar:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/listings/[id]/calendar
 * Crée ou met à jour un créneau de disponibilité (Story 3.7)
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Vérifier le rôle hôte
    if (session.user.userType !== 'host') {
      return NextResponse.json(
        { error: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const { id: listingId } = await context.params;
    const body = await request.json();

    // Valider les données
    const validation = setAvailabilitySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'INVALID_INPUT', details: validation.error.issues },
        { status: 400 }
      );
    }

    const startDate = new Date(validation.data.startDate);
    const endDate = new Date(validation.data.endDate);

    // Créer ou mettre à jour le créneau
    const slot = await calendarService.setAvailabilitySlot(
      listingId,
      session.user.id,
      startDate,
      endDate,
      validation.data.isAvailable
    );

    return NextResponse.json(
      {
        data: slot,
        meta: { timestamp: new Date().toISOString() },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error setting availability:', error);

    if (
      error.message === 'LISTING_NOT_FOUND' ||
      error.message === 'LISTING_NOT_OWNED' ||
      error.message === 'INVALID_DATE_RANGE'
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'LISTING_NOT_FOUND' ? 404 : 400 }
      );
    }

    return NextResponse.json(
      { error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
