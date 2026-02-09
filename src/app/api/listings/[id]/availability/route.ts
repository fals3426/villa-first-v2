/**
 * GET /api/listings/[id]/availability?month=1&year=2026
 * Disponibilité pour réservation : slots + réservations (dates libres/occupées)
 * Public - pas d'auth requise pour consulter les disponibilités
 */
import { NextRequest, NextResponse } from 'next/server';
import { calendarService } from '@/server/services/listings/calendar.service';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listingId } = await context.params;
    const { searchParams } = new URL(request.url);

    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    const { slots, bookings } = await calendarService.getAvailabilityForBooking(
      listingId,
      month,
      year
    );

    return NextResponse.json({
      data: {
        slots: slots.map((s) => ({
          id: s.id,
          startDate: s.startDate.toISOString(),
          endDate: s.endDate.toISOString(),
          isAvailable: s.isAvailable,
        })),
        bookings: bookings.map((b) => ({
          checkIn: b.checkIn.toISOString(),
          checkOut: b.checkOut.toISOString(),
        })),
      },
      meta: { month, year },
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
