import { z } from 'zod';

/**
 * Schéma de validation pour les règles de validation (Story 5.5)
 */
export const updateValidationRulesSchema = z
  .object({
    validationRule: z.enum(['FULL_ONLY', 'PARTIAL', 'MANUAL']),
    validationThreshold: z
      .number()
      .int()
      .min(1, 'Le seuil doit être entre 1 et 100')
      .max(100, 'Le seuil doit être entre 1 et 100')
      .optional(),
  })
  .refine(
    (data) => {
      // Si PARTIAL, validationThreshold est requis
      if (data.validationRule === 'PARTIAL') {
        return data.validationThreshold !== undefined && data.validationThreshold !== null;
      }
      return true;
    },
    {
      message: 'Le seuil de validation est requis pour la validation partielle',
      path: ['validationThreshold'],
    }
  );

export type UpdateValidationRulesInput = z.infer<typeof updateValidationRulesSchema>;
