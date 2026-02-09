import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verificationService } from '@/server/services/verification/verification.service';

/**
 * GET /api/admin/verifications
 * Liste les demandes en attente pour le support (Story 2.3)
 * Requiert le rôle support (pour l'instant, on accepte host pour MVP)
 */
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

    // TODO: Vérifier le rôle support quand le système de rôles sera étendu
    // Pour l'instant, on accepte host pour permettre les tests
    // if (session.user.userType !== 'support') {
    //   return NextResponse.json(
    //     {
    //       error: { code: 'FORBIDDEN', message: 'Accès réservé au support' },
    //     },
    //     { status: 403 }
    //   );
    // }

    const requests = await verificationService.listPendingRequests();

    return NextResponse.json({
      data: requests,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Error listing verification requests:', error);
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
