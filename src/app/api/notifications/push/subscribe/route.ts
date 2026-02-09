import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pushService } from '@/server/services/notifications/push.service';
import { pushSubscriptionSchema } from '@/lib/validations/notification.schema';

/**
 * POST /api/notifications/push/subscribe
 * 
 * Enregistre une subscription push pour l'utilisateur (Story 6.3)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const validation = pushSubscriptionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', issues: validation.error.issues },
        { status: 400 }
      );
    }

    const subscription = await pushService.subscribe(
      session.user.id,
      validation.data
    );

    return NextResponse.json(
      {
        success: true,
        data: subscription,
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la subscription:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement de la subscription' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/push/subscribe
 * 
 * Désinscrit l'utilisateur d'une subscription push (Story 6.3)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Paramètre endpoint requis' },
        { status: 400 }
      );
    }

    await pushService.unsubscribe(session.user.id, endpoint);

    return NextResponse.json(
      {
        success: true,
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la désinscription:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la désinscription' },
      { status: 500 }
    );
  }
}
