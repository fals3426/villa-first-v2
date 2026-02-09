import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { photoService } from '@/server/services/listings/photo.service';
import { reorderPhotosSchema } from '@/lib/validations/photo.schema';

/**
 * PATCH /api/listings/[id]/photos/reorder
 * Réorganise l'ordre des photos d'une annonce (Story 3.2)
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
    const validation = reorderPhotosSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'INVALID_INPUT', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Réorganiser les photos
    await photoService.reorderListingPhotos(
      listingId,
      session.user.id,
      validation.data.updates
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error reordering listing photos:', error);

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
