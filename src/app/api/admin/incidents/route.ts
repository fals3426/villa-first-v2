import { NextRequest, NextResponse } from 'next/server';
import { requireSupport } from '@/lib/middleware/support-guard';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const getIncidentsSchema = z.object({
  status: z.enum(['reported', 'in_progress', 'resolved', 'closed']).optional(),
  type: z.enum(['CODE_NOT_WORKING', 'PLACE_DIFFERENT', 'ACCESS_ISSUE', 'OTHER']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * GET /api/admin/incidents
 * 
 * Récupère la liste des incidents de check-in (Story 9.2)
 */
export async function GET(request: NextRequest) {
  try {
    await requireSupport();

    const searchParams = request.nextUrl.searchParams;
    const validation = getIncidentsSchema.safeParse({
      status: searchParams.get('status') || undefined,
      type: searchParams.get('type') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Paramètres invalides', issues: validation.error.issues },
        { status: 400 }
      );
    }

    const where: any = {};
    if (validation.data.status) {
      where.status = validation.data.status;
    }
    if (validation.data.type) {
      where.type = validation.data.type;
    }
    if (validation.data.startDate || validation.data.endDate) {
      where.createdAt = {};
      if (validation.data.startDate) {
        where.createdAt.gte = new Date(validation.data.startDate);
      }
      if (validation.data.endDate) {
        where.createdAt.lte = new Date(validation.data.endDate);
      }
    }

    const incidents = await prisma.incident.findMany({
      where,
      include: {
        booking: {
          include: {
            tenant: {
              select: {
                id: true,
                email: true,
                profilePictureUrl: true,
              },
            },
            listing: {
              select: {
                id: true,
                title: true,
                address: true,
                hostId: true,
                host: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [
        // Priorité : incidents signalés récemment en premier (Story 9.2)
        { createdAt: 'desc' },
      ],
    });

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
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des incidents' },
      { status: 500 }
    );
  }
}
