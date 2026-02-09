import { NextRequest, NextResponse } from 'next/server';
import { calendarSyncService } from '@/server/services/listings/calendarSync.service';
import { calendarAlertService } from '@/server/services/support/calendar-alert.service';

/**
 * GET /api/cron/sync-calendars
 * Endpoint cron pour synchroniser tous les calendriers (Story 3.8)
 * 
 * À configurer dans Vercel Cron ou un service externe pour s'exécuter toutes les 30 minutes
 * Exemple Vercel Cron (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/sync-calendars",
 *     "schedule": "0,30 * * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  // Vérifier le secret pour sécuriser l'endpoint cron
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  try {
    const result = await calendarSyncService.syncAllListings();

    return NextResponse.json(
      {
        success: true,
        processed: result.processed,
        updated: result.updated,
        errors: result.errors,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in cron sync-calendars:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
