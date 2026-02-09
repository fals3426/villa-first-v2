import { NextRequest, NextResponse } from 'next/server';
import { requireSupport } from '@/lib/middleware/support-guard';
import { calendarAlertService } from '@/server/services/support/calendar-alert.service';

/**
 * GET /api/admin/calendar-alerts
 * 
 * Récupère les alertes de synchronisation de calendrier (Story 9.8)
 */
export async function GET(request: NextRequest) {
  try {
    await requireSupport();

    const searchParams = request.nextUrl.searchParams;
    const listingId = searchParams.get('listingId') || undefined;

    const alerts = await calendarAlertService.getSyncFailureAlerts(listingId);

    return NextResponse.json(
      {
        data: alerts,
        meta: {
          count: alerts.length,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des alertes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des alertes' },
      { status: 500 }
    );
  }
}
