import { prisma } from '@/lib/prisma';
import { PhotoCategory } from '@prisma/client';
import type { Listing, ListingPhoto, AvailabilitySlot } from '@prisma/client';

/**
 * Interface pour les données nécessaires au calcul de complétude
 */
interface ListingCompletenessData {
  title: string;
  description: string;
  address: string;
  pricePerPlace: number | null;
  rules: any; // JSON field
  charter: string | null;
  photos: ListingPhoto[];
  availability: AvailabilitySlot[];
}

/**
 * Service pour calculer le score de complétude d'une annonce (Story 3.4)
 */
export const completenessService = {
  /**
   * Calcule le score de complétude d'une annonce (fonction pure)
   * 
   * Pondération :
   * - Informations de base (titre, description, adresse) : 30%
   * - Photos par catégorie (cuisine, chambres, SDB, extérieurs) : 40% (10% par catégorie)
   * - Règles et charte : 15%
   * - Calendrier de disponibilité : 10%
   * - Prix défini : 5%
   */
  computeListingCompleteness(data: ListingCompletenessData): number {
    let score = 0;

    // 1. Informations de base : 30%
    const hasTitle = data.title && data.title.trim().length >= 10;
    const hasDescription = data.description && data.description.trim().length >= 50;
    const hasAddress = data.address && data.address.trim().length >= 5;

    const baseInfoScore = (hasTitle ? 1 : 0) + (hasDescription ? 1 : 0) + (hasAddress ? 1 : 0);
    score += (baseInfoScore / 3) * 30;

    // 2. Photos par catégorie : 40% (10% par catégorie)
    const requiredCategories: PhotoCategory[] = [
      PhotoCategory.KITCHEN,
      PhotoCategory.BEDROOM,
      PhotoCategory.BATHROOM,
      PhotoCategory.OUTDOOR,
    ];

    const photosByCategory = data.photos.reduce((acc, photo) => {
      if (!acc[photo.category]) {
        acc[photo.category] = [];
      }
      acc[photo.category].push(photo);
      return acc;
    }, {} as Record<PhotoCategory, ListingPhoto[]>);

    let photosScore = 0;
    for (const category of requiredCategories) {
      const categoryPhotos = photosByCategory[category] || [];
      if (categoryPhotos.length > 0) {
        photosScore += 10; // 10% par catégorie avec au moins 1 photo
      }
    }
    score += photosScore;

    // 3. Règles et charte : 15%
    const hasRules = data.rules && typeof data.rules === 'object' && Object.keys(data.rules).length > 0;
    const hasCharter = data.charter && data.charter.trim().length > 0;
    
    // Si au moins l'un des deux est présent, on donne 15%
    if (hasRules || hasCharter) {
      score += 15;
    }

    // 4. Calendrier de disponibilité : 10%
    const hasAvailability = data.availability && data.availability.length > 0;
    if (hasAvailability) {
      score += 10;
    }

    // 5. Prix défini : 5%
    if (data.pricePerPlace !== null && data.pricePerPlace > 0) {
      score += 5;
    }

    return Math.round(score);
  },

  /**
   * Identifie les sections manquantes pour compléter l'annonce (Story 3.5)
   */
  getMissingSections(data: ListingCompletenessData): string[] {
    const missing: string[] = [];

    // 1. Informations de base
    if (!data.title || data.title.trim().length < 10) {
      missing.push('basic_info_title');
    }
    if (!data.description || data.description.trim().length < 50) {
      missing.push('basic_info_description');
    }
    if (!data.address || data.address.trim().length < 5) {
      missing.push('basic_info_address');
    }

    // 2. Photos par catégorie
    const requiredCategories: PhotoCategory[] = [
      PhotoCategory.KITCHEN,
      PhotoCategory.BEDROOM,
      PhotoCategory.BATHROOM,
      PhotoCategory.OUTDOOR,
    ];

    const photosByCategory = data.photos.reduce((acc, photo) => {
      if (!acc[photo.category]) {
        acc[photo.category] = [];
      }
      acc[photo.category].push(photo);
      return acc;
    }, {} as Record<PhotoCategory, ListingPhoto[]>);

    const categoryLabels: Record<PhotoCategory, string> = {
      [PhotoCategory.KITCHEN]: 'cuisine',
      [PhotoCategory.BEDROOM]: 'chambres',
      [PhotoCategory.BATHROOM]: 'salles de bain',
      [PhotoCategory.OUTDOOR]: 'extérieurs',
      [PhotoCategory.OTHER]: 'autres',
    };

    for (const category of requiredCategories) {
      const categoryPhotos = photosByCategory[category] || [];
      if (categoryPhotos.length === 0) {
        missing.push(`photos_${categoryLabels[category]}`);
      }
    }

    // 3. Règles et charte
    const hasRules = data.rules && typeof data.rules === 'object' && Object.keys(data.rules).length > 0;
    const hasCharter = data.charter && data.charter.trim().length > 0;
    if (!hasRules && !hasCharter) {
      missing.push('rules_charter');
    }

    // 4. Calendrier
    if (!data.availability || data.availability.length === 0) {
      missing.push('calendar');
    }

    // 5. Prix
    if (data.pricePerPlace === null || data.pricePerPlace <= 0) {
      missing.push('price');
    }

    return missing;
  },

  /**
   * Recalcule et persiste le score de complétude d'une annonce
   */
  async recalculateAndPersistCompleteness(listingId: string): Promise<number> {
    // Charger l'annonce avec toutes les relations nécessaires
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        photos: true,
        availability: {
          where: { isAvailable: true },
        },
      },
    });

    if (!listing) {
      throw new Error('LISTING_NOT_FOUND');
    }

    // Calculer le score
    const score = this.computeListingCompleteness({
      title: listing.title,
      description: listing.description,
      address: listing.address,
      pricePerPlace: listing.pricePerPlace,
      rules: listing.rules,
      charter: listing.charter,
      photos: listing.photos,
      availability: listing.availability,
    });

    // Mettre à jour en base
    await prisma.listing.update({
      where: { id: listingId },
      data: {
        completenessScore: score,
        updatedAt: new Date(),
      },
    });

    return score;
  },
};
