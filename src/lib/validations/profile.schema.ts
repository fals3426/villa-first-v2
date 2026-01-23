import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Le prénom est requis')
    .max(50, 'Le prénom est trop long')
    .optional()
    .or(z.literal('')),
  lastName: z
    .string()
    .min(1, 'Le nom est requis')
    .max(50, 'Le nom est trop long')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .regex(
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
      'Numéro de téléphone invalide'
    )
    .optional()
    .or(z.literal('')),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
