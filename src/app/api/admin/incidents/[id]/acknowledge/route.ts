import { NextRequest, NextResponse } from 'next/server';
import { requireSupport } from '@/lib/middleware/support-guard';
import { incidentManagementService } from '@/server/services/support/incident-management.service';

/**
 * POST /api/admin/incidents/[id]/acknowledge
 * 
 * Accuse réception d'un incident (Story 9.3)
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSupport();
    const { id: incidentId } = await context.params;

    const result = await incidentManagementService.acknowledgeIncident(
      incidentId,
      session.user.id
    );

    return NextResponse.json(
      {
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          withinSLA: result.withinSLA,
          minutesSinceReport: result.minutesSinceReport,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de l\'accusé de réception:', error);

    if (error instanceof Error) {
      if (error.message === 'INCIDENT_NOT_FOUND') {
        return NextResponse.json({ error: 'Incident introuvable' }, { status: 404 });
      }
      if (error.message === 'INCIDENT_ALREADY_ACKNOWLEDGED') {
        return NextResponse.json(
          { error: 'Cet incident a déjà été pris en charge' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erreur lors de l\'accusé de réception' },
      { status: 500 }
    );
  }
}
