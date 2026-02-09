import { NextRequest, NextResponse } from 'next/server';
import { requireSupport } from '@/lib/middleware/support-guard';
import { fraudManagementService } from '@/server/services/support/fraud-management.service';
import { z } from 'zod';

const suspendUserSchema = z.object({
  reason: z.string().min(10, 'La raison doit contenir au moins 10 caractères').max(1000),
  evidence: z.record(z.string(), z.any()).optional(),
});

/**
 * POST /api/admin/users/[id]/suspend
 * 
 * Suspend un utilisateur (bannissement) (Story 9.5)
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSupport();
    const { id: userId } = await context.params;
    const body = await request.json();
    const validation = suspendUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', issues: validation.error.issues },
        { status: 400 }
      );
    }

    const result = await fraudManagementService.suspendUser(
      userId,
      session.user.id,
      validation.data.reason,
      validation.data.evidence
    );

    return NextResponse.json(
      {
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la suspension:', error);

    if (error instanceof Error) {
      if (error.message === 'USER_NOT_FOUND') {
        return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
      }
    }

    return NextResponse.json(
      { error: 'Erreur lors de la suspension' },
      { status: 500 }
    );
  }
}
