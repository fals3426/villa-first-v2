'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerSchema, type RegisterInput } from '@/lib/validations/auth.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function RegisterPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<'tenant' | 'host' | 'support' | ''>('');
  const isDev = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    if (!userType || !['tenant', 'host', 'support'].includes(userType)) {
      setErrors({ userType: 'Veuillez sélectionner un type d\'utilisateur' });
      setIsLoading(false);
      return;
    }
    
    const validatedUserType = userType as 'tenant' | 'host' | 'support';
    
    const data: RegisterInput = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
      userType: validatedUserType,
    };

    // Validation client
    const validation = registerSchema.safeParse(data);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    // Appel API
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validation.data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error?.code === 'EMAIL_ALREADY_EXISTS') {
          setErrors({ email: result.error.message });
        } else if (result.error?.code === 'VALIDATION_ERROR') {
          const fieldErrors: Record<string, string> = {};
          result.error.details?.forEach((err: { path: string[]; message: string }) => {
            if (err.path[0]) {
              fieldErrors[err.path[0].toString()] = err.message;
            }
          });
          setErrors(fieldErrors);
        } else if (result.error?.code === 'DATABASE_ERROR') {
          setErrors({ 
            general: result.error.message || 'Erreur de connexion à la base de données. Vérifiez que la base de données est démarrée.' 
          });
        } else {
          setErrors({ 
            general: result.error?.message || 'Une erreur est survenue lors de la création du compte',
            ...(result.error?.details && { details: result.error.details })
          });
        }
        setIsLoading(false);
        return;
      }

      // Succès - rediriger vers login
      router.push('/login?registered=true');
    } catch (error) {
      console.error('Registration fetch error:', error);
      setErrors({ 
        general: error instanceof Error 
          ? `Erreur réseau: ${error.message}` 
          : 'Une erreur est survenue lors de la connexion au serveur' 
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4 safe-area-bottom">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-zinc-900 p-6 md:p-8">
        <div className="text-center">
          <h1 className="text-heading-2 mb-2">Créer un compte</h1>
          <p className="text-white/90">
            Rejoins Villa first pour trouver ou proposer une coloc
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {errors.general && (
            <div className="rounded-lg bg-red-500/20 border border-red-500/30 p-4 text-sm text-red-300">
              {errors.general}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="votre@email.com"
              required
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Minimum 8 caractères"
              required
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Répète ton mot de passe"
              required
              aria-invalid={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-400">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="userType">Je suis</Label>
            <Select
              value={userType}
              onValueChange={(value) => setUserType(value as 'tenant' | 'host' | 'support')}
              required
            >
              <SelectTrigger id="userType" aria-invalid={!!errors.userType} className="w-full">
                <SelectValue placeholder="Sélectionne ton profil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tenant">Locataire</SelectItem>
                <SelectItem value="host">Hôte / Propriétaire</SelectItem>
                {isDev && (
                  <SelectItem value="support">Admin / Support (dev uniquement)</SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.userType && (
              <p className="text-sm text-red-400">{errors.userType}</p>
            )}
          </div>

          <Button type="submit" variant="v1-primary" className="w-full" disabled={isLoading}>
            {isLoading ? 'Création en cours...' : 'Créer mon compte'}
          </Button>
        </form>

        <div className="text-center text-sm text-zinc-400">
          Déjà un compte ?{' '}
          <a href="/login" className="text-white hover:underline font-medium">
            Se connecter
          </a>
        </div>
      </div>
    </div>
  );
}
