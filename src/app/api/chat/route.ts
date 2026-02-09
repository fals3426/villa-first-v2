import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { chatService } from '@/server/services/chat/chat.service';

/**
 * GET /api/chat
 * 
 * Récupère tous les chats de l'utilisateur connecté (Story 6.1)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const chats = await chatService.getUserChats(session.user.id);

    return NextResponse.json(
      {
        data: chats,
        meta: {
          count: chats.length,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des chats:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des chats' },
      { status: 500 }
    );
  }
}
