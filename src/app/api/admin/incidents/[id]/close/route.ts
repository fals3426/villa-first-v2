import { NextRequest, NextResponse } from 'next/server';
import { requireSupport } from '@/lib/middleware/support-guard';
import { incidentManagementService } from '@/server/services/support/incident-management.service';

/**
 * POST /api/admin/incidents/[id]/close
 * 
 * Ferme un incident (Story 9.3)
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSupport();
    const { id: incidentId } = await context.params;

    const result = await incidentManagementService.closeIncident(
      incidentId,
      session.user.id
    );

    return NextResponse.json(
      {
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la fermeture:', error);

    if (error instanceof Error) {
      if (error.message === 'INCIDENT_NOT_FOUND') {
        return NextResponse.json({ error: 'Incident introuvable' }, { status: 404 });
      }
      if (error.message === 'INCIDENT_NOT_RESOLVED') {
        return NextResponse.json(
          { error: 'L\'incident doit être résolu avant d\'être fermé' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erreur lors de la fermeture' },
      { status: 500 }
    );
  }
}
