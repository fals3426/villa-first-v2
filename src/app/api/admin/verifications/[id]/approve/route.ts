import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verificationService } from '@/server/services/verification/verification.service';

/**
 * POST /api/admin/verifications/[id]/approve
 * Approuve une demande de vérification (Story 2.4)
 */
export async function POST(
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
    try {
      const updated = await verificationService.approveRequest(
        id,
        session.user.id
      );

      return NextResponse.json({
        data: { status: 'approved', verificationRequest: updated },
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'VERIFICATION_REQUEST_NOT_FOUND') {
          return NextResponse.json(
            {
              error: {
                code: 'NOT_FOUND',
                message: 'Demande de vérification non trouvée',
              },
            },
            { status: 404 }
          );
        }

        if (error.message === 'INVALID_STATUS_TRANSITION') {
          return NextResponse.json(
            {
              error: {
                code: 'INVALID_STATUS_TRANSITION',
                message:
                  'Cette demande ne peut pas être approuvée dans son état actuel',
              },
            },
            { status: 409 }
          );
        }
      }

      throw error;
    }
  } catch (error) {
    console.error('Error approving verification request:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Une erreur est survenue lors de l\'approbation',
        },
      },
      { status: 500 }
    );
  }
}
