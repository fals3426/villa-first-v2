import { prisma } from '@/lib/prisma';
import { auditService } from '@/server/services/audit/audit.service';

/**
 * Service pour gérer les instructions de check-in (Story 8.4)
 */
export const checkinInstructionService = {
  /**
   * Récupère ou crée les instructions de check-in pour une annonce (Story 8.4)
   */
  async getOrCreateInstructions(listingId: string, hostId: string) {
    // Vérifier l'ownership
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { hostId: true, address: true },
    });

    if (!listing) {
      throw new Error('LISTING_NOT_FOUND');
    }

    if (listing.hostId !== hostId) {
      throw new Error('NOT_AUTHORIZED');
    }

    // Chercher les instructions existantes
    let instructions = await prisma.checkInInstruction.findUnique({
      where: { listingId },
    });

    // Créer si elles n'existent pas
    if (!instructions) {
      instructions = await prisma.checkInInstruction.create({
        data: {
          listingId,
          address: listing.address,
        },
      });

      await auditService.logAction(hostId, 'CHECKIN_INSTRUCTIONS_CREATED', 'CheckInInstruction', instructions.id, {
        listingId,
      });
    }

    return instructions;
  },

  /**
   * Met à jour les instructions de check-in (Story 8.4)
   */
  async updateInstructions(
    listingId: string,
    hostId: string,
    data: {
      address?: string;
      accessCodes?: Record<string, string>;
      hostPhone?: string;
      hostEmail?: string;
      instructions?: string;
    }
  ) {
    // Vérifier l'ownership
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { hostId: true, address: true },
    });

    if (!listing) {
      throw new Error('LISTING_NOT_FOUND');
    }

    if (listing.hostId !== hostId) {
      throw new Error('NOT_AUTHORIZED');
    }

    const updated = await prisma.checkInInstruction.upsert({
      where: { listingId },
      create: {
        listingId,
        address: data.address || listing.address,
        accessCodes: data.accessCodes ? (data.accessCodes as any) : null,
        hostPhone: data.hostPhone || null,
        hostEmail: data.hostEmail || null,
        instructions: data.instructions || null,
      },
      update: {
        address: data.address,
        accessCodes: data.accessCodes ? (data.accessCodes as any) : null,
        hostPhone: data.hostPhone,
        hostEmail: data.hostEmail,
        instructions: data.instructions,
        updatedAt: new Date(),
      },
    });

    await auditService.logAction(hostId, 'CHECKIN_INSTRUCTIONS_UPDATED', 'CheckInInstruction', updated.id, {
      listingId,
    });

    return updated;
  },

  /**
   * Récupère les instructions de check-in pour une réservation (Story 8.4)
   */
  async getInstructionsForBooking(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: {
          select: {
            id: true,
            hostId: true,
          },
        },
        tenant: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!booking) {
      throw new Error('BOOKING_NOT_FOUND');
    }

    const isTenant = booking.tenantId === userId;
    const isHost = booking.listing.hostId === userId;

    if (!isTenant && !isHost) {
      throw new Error('NOT_AUTHORIZED');
    }

    const instructions = await prisma.checkInInstruction.findUnique({
      where: { listingId: booking.listingId },
    });

    // Masquer les coordonnées sensibles pour le locataire (Story 8.4)
    if (instructions && isTenant) {
      return {
        ...instructions,
        hostPhone: instructions.hostPhone ? this.maskPhone(instructions.hostPhone) : null,
        hostEmail: instructions.hostEmail ? this.maskEmail(instructions.hostEmail) : null,
      };
    }

    return instructions;
  },

  /**
   * Masque un numéro de téléphone (Story 8.4)
   */
  maskPhone(phone: string): string {
    if (phone.length <= 4) return phone;
    return `***${phone.slice(-4)}`;
  },

  /**
   * Masque un email (Story 8.4)
   */
  maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const maskedLocal = local.length > 2 ? `${local.slice(0, 2)}***` : '***';
    return `${maskedLocal}@${domain}`;
  },
};
