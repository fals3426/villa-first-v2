import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { onboardingService } from '@/server/services/user/onboarding.service';
import { vibesPreferencesSchema } from '@/lib/validations/vibes.schema';

export async function POST(request: Request) {
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

    // Vérifier que c'est un locataire
    if (session.user.userType !== 'tenant') {
      return NextResponse.json(
        {
          error: { code: 'FORBIDDEN', message: 'Réservé aux locataires' },
        },
        { status: 403 }
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

    // Compléter l'onboarding
    const result = await onboardingService.completeOnboarding(
      session.user.id,
      validation.data
    );

    return NextResponse.json({
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Error completing onboarding:', error);
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
