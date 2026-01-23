import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { onboardingService } from '@/server/services/user/onboarding.service';
import { vibesPreferencesSchema } from '@/lib/validations/vibes.schema';

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

    const body = await request.json();

    // Validation
    const validation = vibesPreferencesSchema.safeParse(body);
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

    // Mettre à jour
    const result = await onboardingService.updateVibesPreferences(
      session.user.id,
      validation.data
    );

    return NextResponse.json({
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Error updating vibes:', error);
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
