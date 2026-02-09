import { NextResponse } from 'next/server';
import { verificationService } from '@/server/services/verification/verification.service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const { listingId } = await params;

    if (!listingId) {
      return NextResponse.json(
        {
          error: { code: 'VALIDATION_ERROR', message: 'Annonce requise' },
        },
        { status: 400 }
      );
    }

    const verificationStatus = await verificationService.getListingVerificationStatus(
      listingId
    );

    return NextResponse.json({
      data: verificationStatus,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Error fetching verification status:', error);
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
