import { z } from 'zod';

export const kycDocumentSchema = z.object({
  document: z
    .instanceof(File)
    .refine(
      (file) => {
        const validTypes = [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'image/jpg',
        ];
        return validTypes.includes(file.type);
      },
      'Format invalide (PDF, JPG, PNG uniquement)'
    )
    .refine(
      (file) => file.size <= 10 * 1024 * 1024,
      'Fichier trop volumineux (max 10MB)'
    ),
});

export type KycDocumentInput = z.infer<typeof kycDocumentSchema>;
