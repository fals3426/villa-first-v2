import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { chatService } from '@/server/services/chat/chat.service';

/**
 * GET /api/chat/[chatId]
 * 
 * Récupère l'historique des messages d'un chat (Story 6.1)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { chatId } = await context.params;
    const history = await chatService.getChatHistory(chatId, session.user.id);

    return NextResponse.json(
      {
        data: history,
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);

    if (error instanceof Error) {
      if (error.message === 'CHAT_NOT_FOUND') {
        return NextResponse.json({ error: 'Chat introuvable' }, { status: 404 });
      }
      if (error.message === 'CHAT_ACCESS_DENIED') {
        return NextResponse.json(
          { error: 'Vous n\'avez pas accès à ce chat' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'historique' },
      { status: 500 }
    );
  }
}
