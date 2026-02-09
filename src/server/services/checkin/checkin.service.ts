import { prisma } from '@/lib/prisma';
import { auditService } from '@/server/services/audit/audit.service';
import { notificationService } from '@/server/services/notifications/notification.service';
import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

/**
 * Service pour gérer les check-ins (Story 8.1, 8.2, 8.3)
 */
export const checkinService = {
  /**
   * Effectue un check-in avec photo et GPS (Story 8.1, 8.2, 8.3)
   */
  async performCheckIn(
    bookingId: string,
    tenantId: string,
    data: {
      photo: File | Buffer;
      latitude?: number;
      longitude?: number;
    }
  ) {
    // Vérifier que la réservation existe et appartient au locataire
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            hostId: true,
            latitude: true,
            longitude: true,
            address: true,
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

    if (booking.tenantId !== tenantId) {
      throw new Error('NOT_AUTHORIZED');
    }

    if (booking.status !== 'confirmed' && booking.status !== 'accepted') {
      throw new Error('BOOKING_NOT_CONFIRMED');
    }

    // Vérifier qu'on n'a pas déjà fait un check-in pour cette réservation
    const existingCheckIn = await prisma.checkIn.findFirst({
      where: { bookingId },
    });

    if (existingCheckIn) {
      throw new Error('CHECKIN_ALREADY_EXISTS');
    }

    // Traiter et sauvegarder la photo
    let photoBuffer: Buffer;
    if (data.photo instanceof File) {
      const arrayBuffer = await data.photo.arrayBuffer();
      photoBuffer = Buffer.from(arrayBuffer);
    } else {
      photoBuffer = Buffer.isBuffer(data.photo) ? data.photo : Buffer.from(data.photo);
    }
    const photoProcessed = await sharp(photoBuffer)
      .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Sauvegarder la photo (simulation S3/Cloudinary - en production utiliser un service cloud)
    const photoFilename = `checkin-${bookingId}-${Date.now()}.jpg`;
    const uploadsDir = join(process.cwd(), 'uploads', 'checkins');
    await mkdir(uploadsDir, { recursive: true });
    const photoPath = join(uploadsDir, photoFilename);
    await writeFile(photoPath, photoProcessed);
    const photoUrl = `/uploads/checkins/${photoFilename}`;

    // Calculer la distance si GPS fourni (Story 8.2)
    let distanceFromListing: number | null = null;
    if (data.latitude && data.longitude && booking.listing.latitude && booking.listing.longitude) {
      distanceFromListing = this.calculateDistance(
        data.latitude,
        data.longitude,
        booking.listing.latitude,
        booking.listing.longitude
      );
    }

    // Créer le check-in
    const checkIn = await prisma.checkIn.create({
      data: {
        bookingId,
        photoUrl,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        distanceFromListing,
      },
    });

    // Audit log (Story 8.3)
    await auditService.logAction(tenantId, 'CHECKIN_PERFORMED', 'CheckIn', checkIn.id, {
      bookingId,
      hasPhoto: true,
      hasGPS: !!(data.latitude && data.longitude),
      distanceFromListing,
    });

    // Notifier l'hôte (Story 8.1)
    await notificationService.sendNotification(booking.listing.hostId, 'new_booking', {
      title: 'Check-in effectué',
      message: `Le locataire a effectué son check-in pour "${booking.listing.title}"`,
      url: `/host/bookings`,
      listingTitle: booking.listing.title,
    }).catch((err) => {
      console.error('Erreur lors de l\'envoi de la notification:', err);
    });

    return checkIn;
  },

  /**
   * Calcule la distance entre deux points GPS (formule de Haversine) (Story 8.2)
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Rayon de la Terre en mètres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance en mètres
  },

  /**
   * Récupère les check-ins d'une réservation (Story 8.1, 8.3)
   */
  async getCheckInsForBooking(bookingId: string, userId: string) {
    // Vérifier l'accès (locataire ou hôte de l'annonce)
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: {
          select: {
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

    return prisma.checkIn.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });
  },
};
