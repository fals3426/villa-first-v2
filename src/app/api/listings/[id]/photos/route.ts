import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { photoService } from '@/server/services/listings/photo.service';
import { addPhotosSchema } from '@/lib/validations/photo.schema';
import { PhotoCategory } from '@prisma/client';

/**
 * POST /api/listings/[id]/photos
 * Ajoute des photos à une annonce dans une catégorie (Story 3.2)
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
    const category = formData.get('category') as string;
    const files = formData.getAll('files') as File[];

    // Valider la catégorie
    const validation = addPhotosSchema.safeParse({ category });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'INVALID_INPUT', details: validation.error.issues },
        { status: 400 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'NO_FILES_PROVIDED' },
        { status: 400 }
      );
    }

    // Upload les photos
    const photos = await photoService.addListingPhotos(
      listingId,
      session.user.id,
      validation.data.category as PhotoCategory,
      files
    );

    return NextResponse.json(
      { photos },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error uploading listing photos:', error);

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
 * GET /api/listings/[id]/photos
 * Récupère toutes les photos d'une annonce groupées par catégorie
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listingId } = await context.params;

    const photos = await photoService.getListingPhotosByCategory(listingId);

    return NextResponse.json({ photos });
  } catch (error: any) {
    console.error('Error fetching listing photos:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
