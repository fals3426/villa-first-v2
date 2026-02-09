import { NextRequest, NextResponse } from 'next/server';
import { requireSupport } from '@/lib/middleware/support-guard';
import { incidentManagementService } from '@/server/services/support/incident-management.service';
import { z } from 'zod';

const resolveIncidentSchema = z.object({
  resolutionNotes: z.string().max(2000).optional(),
});

/**
 * POST /api/admin/incidents/[id]/resolve
 * 
 * Résout un incident (Story 9.3)
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSupport();
    const { id: incidentId } = await context.params;
    const body = await request.json();
    const validation = resolveIncidentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', issues: validation.error.issues },
        { status: 400 }
      );
    }

    const result = await incidentManagementService.resolveIncident(
      incidentId,
      session.user.id,
      validation.data.resolutionNotes
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
    console.error('Erreur lors de la résolution:', error);

    if (error instanceof Error) {
      if (error.message === 'INCIDENT_NOT_FOUND') {
        return NextResponse.json({ error: 'Incident introuvable' }, { status: 404 });
      }
    }

    return NextResponse.json(
      { error: 'Erreur lors de la résolution' },
      { status: 500 }
    );
  }
}
