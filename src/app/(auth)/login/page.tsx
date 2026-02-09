'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loginSchema, type LoginInput } from '@/lib/validations/auth.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';
  const registered = searchParams.get('registered') === 'true';
  const errorParam = searchParams.get('error');
  const isAdminCallback = callbackUrl.startsWith('/admin');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
    const form = e.currentTarget;
    const data: LoginInput = {
      email: (form.email as HTMLInputElement).value.trim(),
      password: (form.password as HTMLInputElement).value,
    };

    setErrors({});
    setIsLoading(true);

    try {
      const validation = loginSchema.safeParse(data);
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

      // Pour admin: redirect: true laisse NextAuth gérer la redirection (meilleure gestion cookie)
      if (isAdminCallback) {
        const adminResult = await signIn('credentials', {
          email: validation.data.email,
          password: validation.data.password,
          redirect: true,
          callbackUrl,
        });
        // Atteint uniquement en cas d'échec (identifiants invalides)
        if (adminResult?.error || !adminResult?.ok) {
          setErrors({ general: 'Email ou mot de passe incorrect' });
        }
        setIsLoading(false);
        return;
      }

      const result = await signIn('credentials', {
        email: validation.data.email,
        password: validation.data.password,
        redirect: false,
      });

      if (result?.error || !result?.ok) {
        setErrors({ general: 'Email ou mot de passe incorrect' });
        setIsLoading(false);
        return;
      }

      await new Promise((r) => setTimeout(r, 3000));
      router.refresh();
      await new Promise((r) => setTimeout(r, 500));
      window.location.href = callbackUrl;
    } catch {
      setErrors({ general: 'Une erreur est survenue. Réessaie.' });
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4 safe-area-bottom">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-zinc-900 p-6 md:p-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l&apos;accueil
        </Link>
        <div className="text-center">
          <h1 className="text-heading-2 mb-2">Connexion</h1>
          <p className="text-white/90">
            Connecte-toi à ton compte Villa first
          </p>
        </div>

        {registered && (
          <div className="rounded-lg bg-green-500/20 border border-green-500/30 p-4 text-sm text-green-300">
            Ton compte a été créé avec succès. Tu peux maintenant te connecter.
          </div>
        )}
        {isAdminCallback && (
          <div className="rounded-lg bg-zinc-700/50 border border-zinc-600 p-4 text-sm text-zinc-300 space-y-3">
            <p className="mb-2">Back-office : connecte-toi avec un compte support.</p>
            <p className="text-zinc-400 text-xs">
              Ex. <code className="text-zinc-200">admin@villafirst.com</code> / <code className="text-zinc-200">Admin123</code>
            </p>
            <p className="text-xs">
              <a
                href="#"
                onClick={async (e) => {
                  e.preventDefault();
                  try {
                    const res = await fetch('/api/debug/reset-admin', { method: 'POST' });
                    const data = await res.json();
                    if (data.success) {
                      alert(`Mot de passe réinitialisé !\n\nEmail: ${data.email}\nMot de passe: ${data.password}\n\nTu peux te connecter maintenant.`);
                    } else {
                      alert('Erreur: ' + (data.error || 'Réessaie'));
                    }
                  } catch (err) {
                    alert('Erreur de connexion au serveur');
                  }
                }}
                className="text-amber-400 hover:text-amber-300 underline"
              >
                Réinitialiser le mot de passe admin
              </a>
            </p>
          </div>
        )}

        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleLogin(e);
          }}
        >
          {errorParam === 'unauthorized' && (
            <div className="rounded-lg bg-amber-500/20 border border-amber-500/30 p-4 text-sm text-amber-300">
              Accès refusé. Seuls les comptes support peuvent accéder au back-office.
            </div>
          )}
          {errorParam !== 'unauthorized' && (errors.general || errorParam === 'CredentialsSignin') && (
            <div className="rounded-lg bg-red-500/20 border border-red-500/30 p-4 text-sm text-red-300">
              {errors.general || 'Email ou mot de passe incorrect'}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="votre@email.com"
              autoComplete="email"
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
              placeholder="Ton mot de passe"
              autoComplete="current-password"
              required
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="v1-primary"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </Button>
        </form>

        <div className="text-center space-y-2">
          <p className="text-sm text-zinc-400">
            Pas encore de compte ?{' '}
            <a href="/register" className="text-white hover:underline font-medium">
              Créer un compte
            </a>
          </p>
          <p className="text-sm">
            <a href="/login?callbackUrl=/admin/dashboard" className="text-zinc-400 hover:text-white underline">
              Accéder au back-office admin
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black">
          <p className="text-zinc-400">Chargement...</p>
        </div>
      }
    >
      <LoginFormInner />
    </Suspense>
  );
}
