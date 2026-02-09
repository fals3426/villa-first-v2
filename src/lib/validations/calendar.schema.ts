import { z } from 'zod';

/**
 * Schéma de validation pour les créneaux de disponibilité (Story 3.7)
 */
export const setAvailabilitySchema = z.object({
  startDate: z.string().datetime('Date de début invalide'),
  endDate: z.string().datetime('Date de fin invalide'),
  isAvailable: z.boolean(),
});
