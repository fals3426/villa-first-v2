import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { verificationService } from '@/server/services/verification/verification.service';

const rejectSchema = z.object({
  reason: z.string().min(1, 'La raison de rejet est obligatoire'),
});

/**
 * POST /api/admin/verifications/[id]/reject
 * Rejette une demande de vérification (Story 2.4)
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
    const body = await request.json();
    const validation = rejectSchema.safeParse(body);

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

    try {
      const updated = await verificationService.rejectRequest(
        id,
        session.user.id,
        validation.data.reason
      );

      return NextResponse.json({
        data: { status: 'rejected', verificationRequest: updated },
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
                  'Cette demande ne peut pas être rejetée dans son état actuel',
              },
            },
            { status: 409 }
          );
        }

        if (error.message === 'REJECTION_REASON_REQUIRED') {
          return NextResponse.json(
            {
              error: {
                code: 'VALIDATION_ERROR',
                message: 'La raison de rejet est obligatoire',
              },
            },
            { status: 400 }
          );
        }
      }

      throw error;
    }
  } catch (error) {
    console.error('Error rejecting verification request:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Une erreur est survenue lors du rejet',
        },
      },
      { status: 500 }
    );
  }
}
