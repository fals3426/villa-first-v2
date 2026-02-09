import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { photoService } from '@/server/services/listings/photo.service';

/**
 * DELETE /api/listings/[id]/photos/[photoId]
 * Supprime une photo d'une annonce (Story 3.2)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; photoId: string }> }
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

    const { photoId } = await context.params;

    // Supprimer la photo
    await photoService.deleteListingPhoto(photoId, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting listing photo:', error);

    if (
      error.message === 'PHOTO_NOT_FOUND' ||
      error.message === 'LISTING_NOT_OWNED'
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'PHOTO_NOT_FOUND' ? 404 : 403 }
      );
    }

    return NextResponse.json(
      { error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
