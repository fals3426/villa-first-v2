import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { calendarSyncService } from '@/server/services/listings/calendarSync.service';

/**
 * POST /api/listings/[id]/calendar/sync
 * Synchronise manuellement le calendrier d'une annonce (Story 3.8)
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

    // Synchroniser le calendrier
    const result = await calendarSyncService.syncListingCalendar(listingId);

    if (result.errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          updated: result.updated,
          errors: result.errors,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        updated: result.updated,
        message: 'Calendrier synchronisé avec succès',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error syncing calendar:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
