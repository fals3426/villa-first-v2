import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { kycService } from '@/server/services/kyc/kyc.service';

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

    const kyc = await kycService.getStatus(session.user.id);

    return NextResponse.json({
      data: kyc || { status: 'not_started' },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Error fetching KYC status:', error);
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
