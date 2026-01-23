import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { profileService } from '@/server/services/user/profile.service';
import { imageService } from '@/server/services/storage/image.service';
import { updateProfileSchema } from '@/lib/validations/profile.schema';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: { code: 'UNAUTHORIZED', message: 'Non authentifié' },
        },
        { status: 401 }
      );
    }

    const profile = await profileService.getProfile(session.user.id);

    if (!profile) {
      return NextResponse.json(
        {
          error: { code: 'NOT_FOUND', message: 'Profil non trouvé' },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: profile,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Une erreur est survenue',
        },
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: { code: 'UNAUTHORIZED', message: 'Non authentifié' },
        },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const data = {
      firstName: formData.get('firstName') as string | null,
      lastName: formData.get('lastName') as string | null,
      phone: formData.get('phone') as string | null,
    };

    // Nettoyer les valeurs vides
    const cleanedData: {
      firstName?: string;
      lastName?: string;
      phone?: string;
    } = {};
    if (data.firstName && data.firstName.trim()) {
      cleanedData.firstName = data.firstName.trim();
    }
    if (data.lastName && data.lastName.trim()) {
      cleanedData.lastName = data.lastName.trim();
    }
    if (data.phone && data.phone.trim()) {
      cleanedData.phone = data.phone.trim();
    }

    // Validation
    const validation = updateProfileSchema.safeParse(cleanedData);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Données invalides',
            details: validation.error.issues,
          },
        },
        { status: 400 }
      );
    }

    // Upload image si présente
    let profilePictureUrl: string | undefined;
    const imageFile = formData.get('profilePicture') as File | null;
    if (imageFile && imageFile.size > 0) {
      try {
        profilePictureUrl = await imageService.uploadProfilePicture(
          imageFile,
          session.user.id
        );
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'INVALID_FORMAT') {
            return NextResponse.json(
              {
                error: {
                  code: 'VALIDATION_ERROR',
                  message: "Format d'image invalide (JPG, PNG uniquement)",
                },
              },
              { status: 400 }
            );
          }
          if (error.message === 'FILE_TOO_LARGE') {
            return NextResponse.json(
              {
                error: {
                  code: 'VALIDATION_ERROR',
                  message: "L'image est trop grande (max 5MB)",
                },
              },
              { status: 400 }
            );
          }
        }
        throw error;
      }
    }

    // Mettre à jour le profil
    const updated = await profileService.updateProfile(session.user.id, {
      ...validation.data,
      ...(profilePictureUrl && { profilePictureUrl }),
    });

    return NextResponse.json({
      data: updated,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Une erreur est survenue',
        },
      },
      { status: 500 }
    );
  }
}
