import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkinInstructionService } from '@/server/services/checkin/checkin-instruction.service';
import { z } from 'zod';

const updateInstructionsSchema = z.object({
  address: z.string().min(1).optional(),
  accessCodes: z.record(z.string(), z.string()).optional(),
  hostPhone: z.string().optional(),
  hostEmail: z.string().email().optional(),
  instructions: z.string().max(2000).optional(),
});

/**
 * GET /api/listings/[id]/checkin-instructions
 * 
 * Récupère les instructions de check-in pour une annonce (Story 8.4)
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

    const { id: listingId } = await context.params;

    // Vérifier l'ownership
    const { prisma } = await import('@/lib/prisma');
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { hostId: true },
    });

    if (!listing || listing.hostId !== session.user.id) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à voir ces instructions' },
        { status: 403 }
      );
    }

    const instructions = await checkinInstructionService.getOrCreateInstructions(
      listingId,
      session.user.id
    );

    return NextResponse.json(
      {
        data: instructions,
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des instructions:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des instructions' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/listings/[id]/checkin-instructions
 * 
 * Met à jour les instructions de check-in (Story 8.4)
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id: listingId } = await context.params;
    const body = await request.json();
    const validation = updateInstructionsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', issues: validation.error.issues },
        { status: 400 }
      );
    }

    const instructions = await checkinInstructionService.updateInstructions(
      listingId,
      session.user.id,
      validation.data
    );

    return NextResponse.json(
      {
        success: true,
        data: instructions,
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la mise à jour des instructions:', error);

    if (error instanceof Error) {
      if (error.message === 'LISTING_NOT_FOUND') {
        return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 });
      }
      if (error.message === 'NOT_AUTHORIZED') {
        return NextResponse.json(
          { error: 'Vous n\'êtes pas autorisé à modifier ces instructions' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des instructions' },
      { status: 500 }
    );
  }
}
