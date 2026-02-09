import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { onboardingService } from '@/server/services/user/onboarding.service';

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

    // Utiliser JWT si disponible (évite requête DB)
    if (session.user.onboardingCompleted !== undefined) {
      return NextResponse.json({
        data: {
          completed: session.user.onboardingCompleted,
          userType: session.user.userType,
          // Note: vibesPreferences nécessite toujours une requête DB si nécessaire
          vibesPreferences: null,
        },
        meta: { timestamp: new Date().toISOString(), cached: true },
      });
    }

    // Fallback: requête DB si JWT non disponible (compatibilité)
    const status = await onboardingService.getOnboardingStatus(session.user.id);

    return NextResponse.json({
      data: status,
      meta: { timestamp: new Date().toISOString(), cached: false },
    });
  } catch (error) {
    console.error('Error fetching onboarding status:', error);
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
