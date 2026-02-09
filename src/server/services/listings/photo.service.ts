import { prisma } from '@/lib/prisma';
import { auditService } from '@/server/services/audit/audit.service';
import { completenessService } from '@/server/services/listings/completeness.service';
import { PhotoCategory } from '@prisma/client';
import sharp from 'sharp';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';

/**
 * Service pour gérer les photos d'annonces (Story 3.2)
 */
export const photoService = {
  /**
   * Upload et optimise une photo pour une annonce
   */
  async uploadListingPhoto(
    file: File,
    listingId: string,
    category: PhotoCategory
  ): Promise<string> {
    // Lire le buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Valider le format
    const validFormats = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validFormats.includes(file.type)) {
      throw new Error('INVALID_FORMAT');
    }

    // Valider la taille (max 10MB pour les photos d'annonces)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('FILE_TOO_LARGE');
    }

    // Optimiser et convertir en WebP si possible
    const optimized = await sharp(buffer)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true }) // Max 1920x1080, conserve ratio
      .webp({ quality: 85 })
      .toBuffer();

    // Sauvegarder (stockage local pour MVP, à remplacer par S3/Cloudinary en production)
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'listings', listingId);
    await mkdir(uploadsDir, { recursive: true });

    const filename = `${category.toLowerCase()}-${Date.now()}.webp`;
    const filepath = path.join(uploadsDir, filename);
    await writeFile(filepath, optimized);

    // Retourner l'URL
    return `/uploads/listings/${listingId}/${filename}`;
  },

  /**
   * Ajoute une ou plusieurs photos à une annonce dans une catégorie
   */
  async addListingPhotos(
    listingId: string,
    hostId: string,
    category: PhotoCategory,
    files: File[]
  ) {
    // Vérifier l'ownership
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { hostId: true },
    });

    if (!listing) {
      throw new Error('LISTING_NOT_FOUND');
    }

    if (listing.hostId !== hostId) {
      throw new Error('LISTING_NOT_OWNED');
    }

    // Récupérer le dernier position pour cette catégorie
    const lastPhoto = await prisma.listingPhoto.findFirst({
      where: {
        listingId,
        category,
      },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    let nextPosition = lastPhoto ? lastPhoto.position + 1 : 0;

    // Upload toutes les photos
    const photos = [];
    for (const file of files) {
      const url = await this.uploadListingPhoto(file, listingId, category);
      
      const photo = await prisma.listingPhoto.create({
        data: {
          listingId,
          category,
          url,
          originalUrl: null, // Pour MVP, on ne garde pas l'original
          position: nextPosition++,
        },
      });

      photos.push(photo);
    }

    // Recalculer le score de complétude
    await completenessService.recalculateAndPersistCompleteness(listingId);

    // Audit
    await auditService.logAction(
      hostId,
      'listing_photos_added',
      'listing',
      listingId,
      {
        category,
        count: photos.length,
      }
    );

    return photos;
  },

  /**
   * Réorganise les photos d'une annonce (change l'ordre)
   */
  async reorderListingPhotos(
    listingId: string,
    hostId: string,
    updates: Array<{ photoId: string; position: number }>
  ) {
    // Vérifier l'ownership
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { hostId: true },
    });

    if (!listing) {
      throw new Error('LISTING_NOT_FOUND');
    }

    if (listing.hostId !== hostId) {
      throw new Error('LISTING_NOT_OWNED');
    }

    // Mettre à jour toutes les positions
    await Promise.all(
      updates.map(({ photoId, position }) =>
        prisma.listingPhoto.update({
          where: { id: photoId },
          data: { position },
        })
      )
    );

    // Recalculer le score de complétude (même si le score ne change pas, on le met à jour)
    await completenessService.recalculateAndPersistCompleteness(listingId);

    // Audit
    await auditService.logAction(
      hostId,
      'listing_photos_reordered',
      'listing',
      listingId,
      {
        updatedCount: updates.length,
      }
    );
  },

  /**
   * Supprime une photo d'une annonce
   */
  async deleteListingPhoto(photoId: string, hostId: string) {
    // Récupérer la photo avec l'annonce pour vérifier l'ownership
    const photo = await prisma.listingPhoto.findUnique({
      where: { id: photoId },
      include: {
        listing: {
          select: { hostId: true, id: true },
        },
      },
    });

    if (!photo) {
      throw new Error('PHOTO_NOT_FOUND');
    }

    if (photo.listing.hostId !== hostId) {
      throw new Error('LISTING_NOT_OWNED');
    }

    // Supprimer le fichier physique (si stockage local)
    try {
      const urlPath = photo.url.replace(/^\/uploads\//, '');
      const filepath = path.join(process.cwd(), 'public', 'uploads', urlPath);
      await unlink(filepath);
    } catch (error) {
      // Ignorer si le fichier n'existe pas déjà
      console.warn(`Failed to delete photo file: ${photo.url}`, error);
    }

    // Supprimer de la base
    await prisma.listingPhoto.delete({
      where: { id: photoId },
    });

    // Recalculer le score de complétude
    await completenessService.recalculateAndPersistCompleteness(photo.listing.id);

    // Audit
    await auditService.logAction(
      hostId,
      'listing_photo_deleted',
      'listing',
      photo.listing.id,
      {
        photoId,
        category: photo.category,
      }
    );
  },

  /**
   * Récupère toutes les photos d'une annonce groupées par catégorie
   */
  async getListingPhotosByCategory(listingId: string) {
    const photos = await prisma.listingPhoto.findMany({
      where: { listingId },
      orderBy: [{ category: 'asc' }, { position: 'asc' }],
    });

    // Grouper par catégorie
    const grouped: Record<PhotoCategory, typeof photos> = {
      KITCHEN: [],
      BEDROOM: [],
      BATHROOM: [],
      OUTDOOR: [],
      OTHER: [],
    };

    for (const photo of photos) {
      grouped[photo.category].push(photo);
    }

    return grouped;
  },
};
