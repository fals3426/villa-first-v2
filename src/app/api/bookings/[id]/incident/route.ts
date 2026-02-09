import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { incidentService } from '@/server/services/checkin/incident.service';
import { reportIncidentSchema } from '@/lib/validations/incident.schema';

/**
 * POST /api/bookings/[id]/incident
 * 
 * Signale un incident lors du check-in (Story 8.5)
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id: bookingId } = await context.params;
    const body = await request.json();
    const validation = reportIncidentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', issues: validation.error.issues },
        { status: 400 }
      );
    }

    const incident = await incidentService.reportIncident(
      bookingId,
      session.user.id,
      validation.data
    );

    return NextResponse.json(
      {
        success: true,
        data: incident,
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur lors du signalement de l\'incident:', error);

    if (error instanceof Error) {
      if (error.message === 'BOOKING_NOT_FOUND') {
        return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
      }
      if (error.message === 'NOT_AUTHORIZED') {
        return NextResponse.json(
          { error: 'Vous n\'êtes pas autorisé à signaler un incident pour cette réservation' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erreur lors du signalement de l\'incident' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bookings/[id]/incident
 * 
 * Récupère les incidents d'une réservation (Story 8.5)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id: bookingId } = await context.params;
    const incidents = await incidentService.getIncidentsForBooking(bookingId, session.user.id);

    return NextResponse.json(
      {
        data: incidents,
        meta: {
          count: incidents.length,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des incidents:', error);

    if (error instanceof Error) {
      if (error.message === 'BOOKING_NOT_FOUND') {
        return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
      }
      if (error.message === 'NOT_AUTHORIZED') {
        return NextResponse.json(
          { error: 'Vous n\'êtes pas autorisé à voir ces incidents' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erreur lors de la récupération des incidents' },
      { status: 500 }
    );
  }
}
