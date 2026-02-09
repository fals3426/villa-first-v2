import { z } from 'zod';

/**
 * Schéma de validation pour la recherche d'annonces (Story 4.1, 4.5)
 */
export const searchListingsSchema = z.object({
  location: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  vibes: z.array(z.string()).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
}).refine((data) => {
  // Valider que minPrice <= maxPrice si les deux sont fournis
  if (data.minPrice !== undefined && data.maxPrice !== undefined) {
    return data.minPrice <= data.maxPrice;
  }
  return true;
}, {
  message: 'Le prix minimum doit être inférieur ou égal au prix maximum',
  path: ['minPrice'],
});
