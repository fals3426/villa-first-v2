import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { videoService } from '@/server/services/listings/video.service';

/**
 * POST /api/listings/[id]/video
 * Upload une vidéo pour une annonce (Story 3.3)
 */
export async function POST(
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

    // Parser FormData
    const formData = await request.formData();
    const file = formData.get('video') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'NO_FILE_PROVIDED' },
        { status: 400 }
      );
    }

    // Upload la vidéo
    const listing = await videoService.setListingVideo(
      listingId,
      session.user.id,
      file
    );

    return NextResponse.json(
      { data: listing },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error uploading listing video:', error);

    if (
      error.message === 'LISTING_NOT_FOUND' ||
      error.message === 'LISTING_NOT_OWNED' ||
      error.message === 'INVALID_FORMAT' ||
      error.message === 'FILE_TOO_LARGE'
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'LISTING_NOT_FOUND' ? 404 : 400 }
      );
    }

    return NextResponse.json(
      { error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/listings/[id]/video
 * Supprime la vidéo d'une annonce (Story 3.3)
 */
export async function DELETE(
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

    // Supprimer la vidéo
    await videoService.deleteListingVideo(listingId, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting listing video:', error);

    if (
      error.message === 'LISTING_NOT_FOUND' ||
      error.message === 'LISTING_NOT_OWNED' ||
      error.message === 'NO_VIDEO_TO_DELETE'
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'LISTING_NOT_FOUND' ? 404 : 400 }
      );
    }

    return NextResponse.json(
      { error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
