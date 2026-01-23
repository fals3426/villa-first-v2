import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { kycService } from '@/server/services/kyc/kyc.service';
import { kycDocumentSchema } from '@/lib/validations/kyc.schema';

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

    const formData = await request.formData();
    const document = formData.get('document') as File | null;

    if (!document || document.size === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Document requis',
          },
        },
        { status: 400 }
      );
    }

    // Validation
    const validation = kycDocumentSchema.safeParse({ document });
    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Document invalide',
            details: validation.error.issues,
          },
        },
        { status: 400 }
      );
    }

    // Initier vérification
    const kyc = await kycService.initiateVerification(
      session.user.id,
      validation.data.document
    );

    return NextResponse.json({
      data: {
        id: kyc.id,
        status: kyc.status,
        message: 'Vérification en cours. Vous recevrez une notification une fois la vérification terminée.',
      },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Error initiating KYC:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Une erreur est survenue lors de la vérification',
        },
      },
      { status: 500 }
    );
  }
}
