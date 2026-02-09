import { prisma } from '@/lib/prisma';
import { auditService } from '@/server/services/audit/audit.service';
import { notificationService } from '@/server/services/notifications/notification.service';

/**
 * Service pour gérer les chats masqués (Story 6.1, 6.2)
 */
export const chatService = {
  /**
   * Récupère ou crée un chat pour une annonce et des utilisateurs (Story 6.1)
   */
  async getOrCreateChat(listingId: string, tenantId: string, hostId: string) {
    // Vérifier que le locataire a une réservation active pour cette annonce
    const activeBooking = await prisma.booking.findFirst({
      where: {
        listingId,
        tenantId,
        status: { in: ['pending', 'confirmed'] },
      },
    });

    if (!activeBooking) {
      throw new Error('NO_ACTIVE_BOOKING');
    }

    // Vérifier que l'hôte est bien le propriétaire de l'annonce
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { hostId: true },
    });

    if (!listing || listing.hostId !== hostId) {
      throw new Error('LISTING_NOT_OWNED_BY_HOST');
    }

    // Chercher un chat existant
    let chat = await prisma.chat.findUnique({
      where: {
        listingId_tenantId_hostId: {
          listingId,
          tenantId,
          hostId,
        },
      },
    });

    // Créer le chat s'il n'existe pas
    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          listingId,
          tenantId,
          hostId,
        },
      });

      // Audit log
      await auditService.logAction(
        tenantId,
        'CHAT_CREATED',
        'Chat',
        chat.id,
        {
          listingId,
          tenantId,
          hostId,
        }
      );
    }

    return chat;
  },

  /**
   * Sauvegarde un message dans le chat (Story 6.1, 6.2)
   */
  async saveMessage(chatId: string, senderId: string, content: string) {
    // Vérifier que l'utilisateur a accès au chat
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      select: {
        id: true,
        tenantId: true,
        hostId: true,
        listingId: true,
      },
    });

    if (!chat) {
      throw new Error('CHAT_NOT_FOUND');
    }

    if (chat.tenantId !== senderId && chat.hostId !== senderId) {
      throw new Error('CHAT_ACCESS_DENIED');
    }

    // Valider le contenu (pas vide, longueur raisonnable)
    const trimmedContent = content.trim();
    if (!trimmedContent || trimmedContent.length === 0) {
      throw new Error('MESSAGE_EMPTY');
    }
    if (trimmedContent.length > 5000) {
      throw new Error('MESSAGE_TOO_LONG');
    }

    // Sauvegarder le message
    const message = await prisma.message.create({
      data: {
        chatId,
        senderId,
        content: trimmedContent,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            userType: true,
          },
        },
      },
    });

    // Mettre à jour le timestamp du chat
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    // Audit log (Story 6.2)
    await auditService.logAction(
      senderId,
      'MESSAGE_SENT',
      'Message',
      message.id,
      {
        chatId,
        listingId: chat.listingId,
        contentLength: trimmedContent.length,
      }
    );

    // Notification pour l'autre participant (Story 6.3, 6.4)
    const otherUserId = chat.tenantId === senderId ? chat.hostId : chat.tenantId;
    const listing = await prisma.listing.findUnique({
      where: { id: chat.listingId },
      select: { title: true },
    });

    await notificationService.sendNotification(otherUserId, 'new_message', {
      title: 'Nouveau message',
      message: `Vous avez reçu un nouveau message dans le chat pour "${listing?.title || 'votre réservation'}"`,
      url: `/chat/${chatId}`,
      listingTitle: listing?.title,
    }).catch((err) => {
      // Ne pas faire échouer l'envoi du message si la notification échoue
      console.error('Erreur lors de l\'envoi de la notification:', err);
    });

    return message;
  },

  /**
   * Récupère l'historique des messages d'un chat (Story 6.1)
   */
  async getChatHistory(chatId: string, userId: string) {
    // Vérifier que l'utilisateur a accès au chat
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      select: {
        id: true,
        tenantId: true,
        hostId: true,
        listingId: true,
      },
    });

    if (!chat) {
      throw new Error('CHAT_NOT_FOUND');
    }

    if (chat.tenantId !== userId && chat.hostId !== userId) {
      throw new Error('CHAT_ACCESS_DENIED');
    }

    // Récupérer les messages (masquage des coordonnées)
    const messages = await prisma.message.findMany({
      where: { chatId },
      include: {
        sender: {
          select: {
            id: true,
            userType: true,
            // Ne pas inclure email, phone, firstName, lastName pour masquage
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      chat,
      messages: messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        senderId: msg.senderId,
        senderType: msg.sender.userType, // 'tenant' ou 'host' pour masquage
        createdAt: msg.createdAt,
      })),
    };
  },

  /**
   * Récupère tous les chats d'un utilisateur (Story 6.1)
   */
  async getUserChats(userId: string) {
    const chats = await prisma.chat.findMany({
      where: {
        OR: [{ tenantId: userId }, { hostId: userId }],
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            location: true,
            photos: {
              where: { position: 0 },
              take: 1,
              select: { url: true },
            },
          },
        },
        tenant: {
          select: {
            id: true,
            userType: true,
            // Masquage : pas d'email, phone, firstName, lastName
          },
        },
        host: {
          select: {
            id: true,
            userType: true,
            // Masquage : pas d'email, phone, firstName, lastName
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Dernier message pour aperçu
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return chats;
  },
};
