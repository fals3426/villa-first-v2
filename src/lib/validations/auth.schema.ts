import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z
      .string()
      .email('Email invalide')
      .min(1, 'Email requis'),
    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
      .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
      .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
    confirmPassword: z.string(),
    userType: z.enum(['tenant', 'host'], {
      message: "Type d'utilisateur invalide",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .email('Email invalide')
    .min(1, 'Email requis'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
