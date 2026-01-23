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

    const verifiedData = await kycService.getVerifiedData(session.user.id);

    if (!verifiedData) {
      return NextResponse.json({
        data: null,
        meta: { timestamp: new Date().toISOString() },
      });
    }

    return NextResponse.json({
      data: verifiedData,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Error fetching verified KYC data:', error);
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
