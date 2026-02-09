import { prisma } from '@/lib/prisma';
import { auditService } from '@/server/services/audit/audit.service';
import { completenessService } from '@/server/services/listings/completeness.service';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';

/**
 * Service pour gérer les vidéos d'annonces (Story 3.3)
 */
export const videoService = {
  /**
   * Upload une vidéo pour une annonce
   */
  async uploadListingVideo(
    file: File,
    listingId: string
  ): Promise<string> {
    // Lire le buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Valider le format
    const validFormats = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    if (!validFormats.includes(file.type)) {
      throw new Error('INVALID_FORMAT');
    }

    // Valider la taille (max 100MB pour les vidéos)
    if (file.size > 100 * 1024 * 1024) {
      throw new Error('FILE_TOO_LARGE');
    }

    // Sauvegarder (stockage local pour MVP, à remplacer par S3/Cloudinary en production)
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'listings', listingId, 'video');
    await mkdir(uploadsDir, { recursive: true });

    // Déterminer l'extension selon le type MIME
    let extension = 'mp4';
    if (file.type === 'video/quicktime') extension = 'mov';
    if (file.type === 'video/x-msvideo') extension = 'avi';

    const filename = `video-${Date.now()}.${extension}`;
    const filepath = path.join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    // Retourner l'URL
    return `/uploads/listings/${listingId}/video/${filename}`;
  },

  /**
   * Ajoute ou met à jour la vidéo d'une annonce
   */
  async setListingVideo(
    listingId: string,
    hostId: string,
    file: File
  ) {
    // Vérifier l'ownership
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { hostId: true, videoUrl: true },
    });

    if (!listing) {
      throw new Error('LISTING_NOT_FOUND');
    }

    if (listing.hostId !== hostId) {
      throw new Error('LISTING_NOT_OWNED');
    }

    // Supprimer l'ancienne vidéo si elle existe
    if (listing.videoUrl) {
      try {
        const urlPath = listing.videoUrl.replace(/^\/uploads\//, '');
        const filepath = path.join(process.cwd(), 'public', 'uploads', urlPath);
        await unlink(filepath);
      } catch (error) {
        console.warn(`Failed to delete old video: ${listing.videoUrl}`, error);
      }
    }

    // Upload la nouvelle vidéo
    const videoUrl = await this.uploadListingVideo(file, listingId);

    // Mettre à jour l'annonce
    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: { videoUrl },
    });

    // Note: La vidéo n'entre pas dans le calcul de complétude (optionnelle)
    // Mais on peut recalculer au cas où d'autres éléments auraient changé
    await completenessService.recalculateAndPersistCompleteness(listingId);

    // Audit
    await auditService.logAction(
      hostId,
      'listing_video_uploaded',
      'listing',
      listingId,
      {
        videoUrl,
      }
    );

    return updated;
  },

  /**
   * Supprime la vidéo d'une annonce
   */
  async deleteListingVideo(listingId: string, hostId: string) {
    // Vérifier l'ownership
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { hostId: true, videoUrl: true },
    });

    if (!listing) {
      throw new Error('LISTING_NOT_FOUND');
    }

    if (listing.hostId !== hostId) {
      throw new Error('LISTING_NOT_OWNED');
    }

    if (!listing.videoUrl) {
      throw new Error('NO_VIDEO_TO_DELETE');
    }

    // Supprimer le fichier physique
    try {
      const urlPath = listing.videoUrl.replace(/^\/uploads\//, '');
      const filepath = path.join(process.cwd(), 'public', 'uploads', urlPath);
      await unlink(filepath);
    } catch (error) {
      console.warn(`Failed to delete video file: ${listing.videoUrl}`, error);
    }

    // Mettre à jour l'annonce
    await prisma.listing.update({
      where: { id: listingId },
      data: { videoUrl: null },
    });

    // Recalculer le score (la vidéo n'entre pas dans le calcul, mais on met à jour quand même)
    await completenessService.recalculateAndPersistCompleteness(listingId);

    // Audit
    await auditService.logAction(
      hostId,
      'listing_video_deleted',
      'listing',
      listingId,
      {}
    );
  },
};
