import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verificationService } from '@/server/services/verification/verification.service';

/**
 * GET /api/admin/verifications/[id]
 * Récupère le détail d'une demande de vérification (Story 2.3)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const requestDetail = await verificationService.getRequestById(id);

    if (!requestDetail) {
      return NextResponse.json(
        {
          error: { code: 'NOT_FOUND', message: 'Demande non trouvée' },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: requestDetail,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Error fetching verification request:', error);
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
