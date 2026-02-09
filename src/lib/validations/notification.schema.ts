import { z } from 'zod';

/**
 * Schéma de validation pour les préférences de notifications (Story 6.6)
 */
export const updateNotificationPreferencesSchema = z.object({
  pushEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  notifyNewBooking: z.boolean().optional(),
  notifyNewMessage: z.boolean().optional(),
  notifyValidation: z.boolean().optional(),
  notifyCheckInIssue: z.boolean().optional(),
  notifyMatchingListing: z.boolean().optional(),
  notifyPlaceAvailable: z.boolean().optional(),
});

export type UpdateNotificationPreferencesInput = z.infer<typeof updateNotificationPreferencesSchema>;

/**
 * Schéma de validation pour la subscription push (Story 6.3)
 */
export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url('Endpoint invalide'),
  keys: z.object({
    p256dh: z.string().min(1, 'Clé p256dh requise'),
    auth: z.string().min(1, 'Clé auth requise'),
  }),
});

export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>;
