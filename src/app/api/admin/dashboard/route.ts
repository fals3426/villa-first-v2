import { NextResponse } from 'next/server';
import { requireSupport } from '@/lib/middleware/support-guard';
import { supportService } from '@/server/services/support/support.service';

/**
 * GET /api/admin/dashboard
 * 
 * Récupère les statistiques du dashboard support (Story 9.1)
 */
export async function GET() {
  try {
    await requireSupport();

    const stats = await supportService.getDashboardStats();

    return NextResponse.json(
      {
        data: stats,
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);

    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json(
        { error: 'Accès réservé au support' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}
