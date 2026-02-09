import { z } from 'zod';

/**
 * Schéma de validation pour la comparaison d'annonces (Story 4.6)
 */
export const compareListingsSchema = z.object({
  ids: z
    .array(z.string().cuid('ID d\'annonce invalide'))
    .min(2, 'Au moins 2 annonces sont requises pour la comparaison')
    .max(5, 'Maximum 5 annonces peuvent être comparées'),
});
