import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { validationService } from '@/server/services/bookings/validation.service';
import { updateValidationRulesSchema } from '@/lib/validations/validation.schema';

/**
 * GET /api/listings/[id]/validation-rules
 * 
 * Récupère les règles de validation d'une annonce (Story 5.5)
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
    const rules = await validationService.getValidationRules(listingId);

    if (!rules) {
      return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 });
    }

    return NextResponse.json(
      {
        data: rules,
        meta: { timestamp: new Date().toISOString() },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des règles:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des règles' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/listings/[id]/validation-rules
 * 
 * Met à jour les règles de validation d'une annonce (Story 5.5)
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

    if (session.user.userType !== 'host') {
      return NextResponse.json(
        { error: 'Seuls les hôtes peuvent modifier les règles de validation' },
        { status: 403 }
      );
    }

    const { id: listingId } = await context.params;
    const body = await request.json();

    // Valider les données
    const validation = updateValidationRulesSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', issues: validation.error.issues },
        { status: 400 }
      );
    }

    // Mettre à jour les règles
    const listing = await validationService.updateValidationRules(
      listingId,
      session.user.id,
      validation.data
    );

    return NextResponse.json(
      {
        success: true,
        data: listing,
        meta: { timestamp: new Date().toISOString() },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la mise à jour des règles:', error);

    if (error instanceof Error) {
      if (error.message === 'LISTING_NOT_FOUND') {
        return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 });
      }
      if (error.message === 'LISTING_NOT_OWNED') {
        return NextResponse.json(
          { error: 'Vous n\'avez pas l\'autorisation de modifier cette annonce' },
          { status: 403 }
        );
      }
      if (error.message === 'INVALID_THRESHOLD') {
        return NextResponse.json(
          { error: 'Le seuil doit être entre 1 et 100' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des règles' },
      { status: 500 }
    );
  }
}
