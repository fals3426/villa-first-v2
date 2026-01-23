import { z } from 'zod';

export const vibesPreferencesSchema = z
  .object({
    work: z.array(z.enum(['remote', 'office', 'hybrid'])).optional(),
    lifestyle: z.array(z.enum(['calm', 'festive', 'balanced'])).optional(),
    activities: z
      .array(z.enum(['yoga', 'sport', 'music', 'art', 'reading']))
      .optional(),
    social: z.array(z.enum(['introvert', 'extrovert', 'mixed'])).optional(),
    wellness: z
      .array(z.enum(['meditation', 'fitness', 'spa', 'nature']))
      .optional(),
  })
  .refine(
    (data) => {
      // Au moins une catégorie doit être sélectionnée
      return Object.values(data).some((arr) => arr && arr.length > 0);
    },
    { message: 'Sélectionnez au moins une préférence' }
  );

export type VibesPreferencesInput = z.infer<typeof vibesPreferencesSchema>;
