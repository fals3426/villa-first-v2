import { NextResponse } from 'next/server';
import { requireSupport } from '@/lib/middleware/support-guard';
import { incidentManagementService } from '@/server/services/support/incident-management.service';

/**
 * GET /api/admin/incidents/urgent
 * 
 * Récupère les incidents urgents nécessitant une attention immédiate (Story 9.3)
 */
export async function GET() {
  try {
    await requireSupport();

    const urgentIncidents = await incidentManagementService.getUrgentIncidents();

    return NextResponse.json(
      {
        data: urgentIncidents,
        meta: {
          count: urgentIncidents.length,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des incidents urgents:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des incidents urgents' },
      { status: 500 }
    );
  }
}
