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
  const [userType, setUserType] = useState<'tenant' | 'host' | ''>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    if (!userType || (userType !== 'tenant' && userType !== 'host')) {
      setErrors({ userType: 'Veuillez sélectionner un type d\'utilisateur' });
      setIsLoading(false);
      return;
    }
    
    // Type guard pour TypeScript
    const validatedUserType: 'tenant' | 'host' = userType === 'tenant' ? 'tenant' : 'host';
    
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
        } else {
          setErrors({ general: result.error?.message || 'Une erreur est survenue' });
        }
        setIsLoading(false);
        return;
      }

      // Succès - rediriger vers login
      router.push('/login?registered=true');
    } catch (error) {
      setErrors({ general: 'Une erreur est survenue' });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border p-6">
        <div>
          <h1 className="text-2xl font-bold">Créer un compte</h1>
          <p className="text-muted-foreground mt-2">
            Rejoignez Villa first pour trouver ou proposer une colocation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
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
              <p className="text-sm text-destructive">{errors.email}</p>
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
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Répétez votre mot de passe"
              required
              aria-invalid={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="userType">Je suis</Label>
            <Select
              value={userType}
              onValueChange={(value) => setUserType(value as 'tenant' | 'host')}
              required
            >
              <SelectTrigger id="userType" aria-invalid={!!errors.userType}>
                <SelectValue placeholder="Sélectionnez votre profil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tenant">Locataire</SelectItem>
                <SelectItem value="host">Hôte / Propriétaire</SelectItem>
              </SelectContent>
            </Select>
            {errors.userType && (
              <p className="text-sm text-destructive">{errors.userType}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Création en cours...' : 'Créer mon compte'}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Déjà un compte ?{' '}
          <a href="/login" className="text-primary hover:underline">
            Se connecter
          </a>
        </div>
      </div>
    </div>
  );
}
