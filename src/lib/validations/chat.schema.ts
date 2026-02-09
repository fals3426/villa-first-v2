import { z } from 'zod';

/**
 * Schéma de validation pour l'envoi d'un message (Story 6.1)
 */
export const sendMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Le message ne peut pas être vide')
    .max(5000, 'Le message ne peut pas dépasser 5000 caractères'),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
