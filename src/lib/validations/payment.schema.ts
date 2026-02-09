import { z } from 'zod';

/**
 * Schéma de validation pour la création d'une préautorisation (Story 5.3)
 */
export const createPreauthorizationSchema = z.object({
  paymentMethodId: z.string().min(1, 'ID de méthode de paiement requis'),
});

export type CreatePreauthorizationInput = z.infer<
  typeof createPreauthorizationSchema
>;
