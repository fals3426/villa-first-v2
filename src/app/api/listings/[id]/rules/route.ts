import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listingService } from '@/server/services/listings/listing.service';
import { updateRulesAndCharterSchema } from '@/lib/validations/rules.schema';
import { Prisma } from '@prisma/client';

/**
 * PATCH /api/listings/[id]/rules
 * Met à jour les règles et la charte d'une annonce (Story 3.6)
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Vérifier le rôle hôte
    if (session.user.userType !== 'host') {
      return NextResponse.json(
        { error: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const { id: listingId } = await context.params;
    const body = await request.json();

    // Valider les données
    const validation = updateRulesAndCharterSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'INVALID_INPUT', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: { rules?: Record<string, unknown>; charter?: string } = {};
    
    if (validation.data.rules !== undefined) {
      updateData.rules = validation.data.rules as Record<string, unknown>;
    }
    
    if (validation.data.charter !== undefined) {
      updateData.charter = validation.data.charter || undefined;
    }

    // Mettre à jour l'annonce
    const listing = await listingService.updateListing(
      listingId,
      session.user.id,
      updateData
    );

    return NextResponse.json(
      {
        data: listing,
        meta: { timestamp: new Date().toISOString() },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating listing rules:', error);

    if (
      error.message === 'LISTING_NOT_FOUND' ||
      error.message === 'LISTING_NOT_OWNED'
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'LISTING_NOT_FOUND' ? 404 : 403 }
      );
    }

    return NextResponse.json(
      { error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
