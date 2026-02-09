import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import { verificationService } from '@/server/services/verification/verification.service';

const createVerificationSchema = z.object({
  listingId: z.string().min(1, 'Annonce requise'),
  documents: z
    .array(
      z.object({
        storageUrl: z.string().url(),
        fileType: z.string().min(1),
        fileSize: z.number().int().positive(),
        originalFileName: z.string().min(1),
      })
    )
    .min(1, 'Au moins un document est requis'),
});

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

    if (session.user.userType !== 'host') {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'Seuls les hôtes peuvent demander une vérification',
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createVerificationSchema.safeParse(body);

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
      const verificationRequest = await verificationService.createVerificationRequest({
        hostId: session.user.id,
        listingId: validation.data.listingId,
        documents: validation.data.documents,
      });

      return NextResponse.json(
        {
          data: verificationRequest,
          meta: { timestamp: new Date().toISOString() },
        },
        { status: 201 }
      );
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'HOST_KYC_NOT_VERIFIED') {
          return NextResponse.json(
            {
              error: {
                code: 'HOST_KYC_NOT_VERIFIED',
                message:
                  'Votre KYC doit être vérifié avant de pouvoir demander la vérification de vos annonces.',
              },
            },
            { status: 403 }
          );
        }

        if (error.message === 'VERIFICATION_REQUEST_ALREADY_EXISTS') {
          return NextResponse.json(
            {
              error: {
                code: 'VERIFICATION_REQUEST_ALREADY_EXISTS',
                message:
                  'Une demande de vérification est déjà en cours pour cette annonce.',
              },
            },
            { status: 409 }
          );
        }
      }

      throw error;
    }
  } catch (error) {
    console.error('Error creating verification request:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message:
            'Une erreur est survenue lors de la création de la demande de vérification.',
        },
      },
      { status: 500 }
    );
  }
}

