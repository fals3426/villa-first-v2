import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { calendarService } from '@/server/services/listings/calendar.service';

/**
 * DELETE /api/listings/[id]/calendar/[slotId]
 * Supprime un créneau de disponibilité (Story 3.7)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; slotId: string }> }
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

    const { slotId } = await context.params;

    // Supprimer le créneau
    await calendarService.deleteAvailabilitySlot(slotId, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting availability slot:', error);

    if (
      error.message === 'SLOT_NOT_FOUND' ||
      error.message === 'LISTING_NOT_OWNED'
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'SLOT_NOT_FOUND' ? 404 : 403 }
      );
    }

    return NextResponse.json(
      { error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
