import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { kycDeletionService } from '@/server/services/kyc/kyc-deletion.service';

export async function DELETE() {
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

    await kycDeletionService.deleteKycData(session.user.id);

    return NextResponse.json({
      data: {
        message: 'Vos données KYC ont été supprimées conformément à votre demande (RGPD)',
      },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Error deleting KYC data:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Une erreur est survenue lors de la suppression',
        },
      },
      { status: 500 }
    );
  }
}
