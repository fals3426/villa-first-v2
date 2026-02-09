import { z } from 'zod';

/**
 * Schéma de validation pour le prix d'une annonce (Story 3.9)
 */
export const updatePriceSchema = z.object({
  pricePerPlace: z.number().positive('Le prix doit être positif').max(10000, 'Le prix ne peut pas dépasser 10000€'),
});
