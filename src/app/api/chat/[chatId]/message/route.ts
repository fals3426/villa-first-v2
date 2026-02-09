import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { chatService } from '@/server/services/chat/chat.service';
import { sendMessageSchema } from '@/lib/validations/chat.schema';

/**
 * POST /api/chat/[chatId]/message
 * 
 * Envoie un message dans un chat (Story 6.1)
 * Note: En production, ceci sera géré via Socket.IO pour le temps réel
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { chatId } = await context.params;
    const body = await request.json();

    // Valider les données
    const validation = sendMessageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', issues: validation.error.issues },
        { status: 400 }
      );
    }

    // Sauvegarder le message
    const message = await chatService.saveMessage(
      chatId,
      session.user.id,
      validation.data.content
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          senderType: message.sender.userType,
          createdAt: message.createdAt,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);

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
      if (error.message === 'MESSAGE_EMPTY') {
        return NextResponse.json(
          { error: 'Le message ne peut pas être vide' },
          { status: 400 }
        );
      }
      if (error.message === 'MESSAGE_TOO_LONG') {
        return NextResponse.json(
          { error: 'Le message est trop long (maximum 5000 caractères)' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}
