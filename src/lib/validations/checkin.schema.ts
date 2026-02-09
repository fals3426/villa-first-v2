import { z } from 'zod';

/**
 * Schéma de validation pour le check-in (Story 8.1, 8.2)
 */
export const performCheckInSchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  // La photo sera validée côté serveur (File/Buffer)
});

export type PerformCheckInInput = z.infer<typeof performCheckInSchema>;
