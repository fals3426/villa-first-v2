import { z } from 'zod';

/**
 * Schéma de validation pour le signalement d'incident (Story 8.5)
 */
export const reportIncidentSchema = z.object({
  type: z.enum(['CODE_NOT_WORKING', 'PLACE_DIFFERENT', 'ACCESS_ISSUE', 'OTHER']),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères').max(2000),
  photos: z.array(z.string().url()).optional(),
});

export type ReportIncidentInput = z.infer<typeof reportIncidentSchema>;
