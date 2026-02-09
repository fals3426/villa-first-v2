import { z } from 'zod';

/**
 * Schéma de validation pour les règles et la charte d'une annonce (Story 3.6)
 */
export const rulesSchema = z.object({
  smoking: z.enum(['allowed', 'not_allowed', 'outside_only']).optional(),
  pets: z.enum(['allowed', 'not_allowed', 'case_by_case']).optional(),
  quietHours: z.string().max(100).optional(),
  parties: z.enum(['allowed', 'not_allowed', 'weekends_only']).optional(),
  guests: z.enum(['allowed', 'not_allowed', 'with_notice']).optional(),
  cleaning: z.enum(['shared', 'rotating', 'professional']).optional(),
  cooking: z.enum(['shared', 'individual', 'flexible']).optional(),
});

export const updateRulesAndCharterSchema = z.object({
  rules: rulesSchema.optional(),
  charter: z.string().max(2000, 'La charte ne peut pas dépasser 2000 caractères').optional(),
});
