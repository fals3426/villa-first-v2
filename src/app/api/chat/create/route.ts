import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { chatService } from '@/server/services/chat/chat.service';
import { z } from 'zod';

const createChatSchema = z.object({
  listingId: z.string().cuid('ID d\'annonce invalide'),
});

/**
 * POST /api/chat/create
 * 
 * Crée ou récupère un chat pour une annonce (Story 6.1)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createChatSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', issues: validation.error.issues },
        { status: 400 }
      );
    }

    const { listingId } = validation.data;

    // Récupérer l'annonce pour obtenir l'hostId
    const { prisma } = await import('@/lib/prisma');
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { hostId: true },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 });
    }

    // Déterminer tenantId et hostId selon le rôle de l'utilisateur
    let tenantId: string;
    let hostId: string;

    if (session.user.userType === 'tenant') {
      tenantId = session.user.id;
      hostId = listing.hostId;
    } else if (session.user.userType === 'host') {
      // Si c'est l'hôte, il faut trouver un locataire avec réservation active
      const booking = await prisma.booking.findFirst({
        where: {
          listingId,
          status: { in: ['pending', 'confirmed'] },
        },
        select: { tenantId: true },
        orderBy: { createdAt: 'desc' },
      });

      if (!booking) {
        return NextResponse.json(
          { error: 'Aucune réservation active pour cette annonce' },
          { status: 400 }
        );
      }

      tenantId = booking.tenantId;
      hostId = session.user.id;
    } else {
      return NextResponse.json(
        { error: 'Type d\'utilisateur invalide' },
        { status: 403 }
      );
    }

    // Créer ou récupérer le chat
    const chat = await chatService.getOrCreateChat(listingId, tenantId, hostId);

    return NextResponse.json(
      {
        success: true,
        data: chat,
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la création du chat:', error);

    if (error instanceof Error) {
      if (error.message === 'NO_ACTIVE_BOOKING') {
        return NextResponse.json(
          { error: 'Vous devez avoir une réservation active pour accéder au chat' },
          { status: 403 }
        );
      }
      if (error.message === 'LISTING_NOT_OWNED_BY_HOST') {
        return NextResponse.json(
          { error: 'Annonce introuvable ou non autorisée' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création du chat' },
      { status: 500 }
    );
  }
}
