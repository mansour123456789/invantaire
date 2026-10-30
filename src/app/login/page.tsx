'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useInventory } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useInventory();

  // Identifiants préconfigurés demandés par l'utilisateur
  const [email, setEmail] = useState('marwa@eco-pilot.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Veuillez renseigner votre email.');
      return;
    }

    if (!password.trim()) {
      setError('Veuillez saisir votre mot de passe.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = login(email, password);
      if (result.success) {
        router.push('/dashboard');
      } else {
        setIsLoading(false);
        setError(result.message || 'Identifiants invalides.');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center p-4 md:p-10 text-[#263248] dark:text-foreground">
      <div className="w-full max-w-6xl overflow-hidden rounded-2xl border border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-2xl">
        <div className="grid min-h-[620px] grid-cols-1 lg:grid-cols-2">
          {/* ── Left image panel (Exactement comme frontend-intern) ── */}
          <div className="relative hidden lg:block bg-slate-100 dark:bg-slate-900 overflow-hidden">
            <img
              src="/login.png.png"
              alt="EcoPilot login"
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Fallback overlay dégradé corporate si l'image charge */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-10 text-white">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md w-fit mb-3 border border-white/30">
                EcoPilot 1.0 • Gestion de Parc IT
              </span>
              <h2 className="text-2xl font-bold text-white drop-shadow-md">
                Inventaire Informatique & Traçabilité
              </h2>
              <p className="text-xs text-white/80 mt-1">
                Contrôle des ordinateurs, écrans, licences et dotations collaborateurs
              </p>
            </div>
          </div>

          {/* ── Right form panel (Exactement comme frontend-intern Auth.tsx) ── */}
          <div className="flex flex-col justify-center bg-white dark:bg-card p-8 sm:p-12 md:p-16">
            <div className="mx-auto w-full max-w-md">
              {/* Header section avec bouton retour et bienvenue */}
              <div className="mb-8 flex flex-col gap-1 text-left">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="h-5 w-5 shrink-0 cursor-pointer bg-[#0394D7]"
                    style={{
                      WebkitMaskImage: 'url(/arrow-left.png)',
                      maskImage: 'url(/arrow-left.png)',
                      WebkitMaskRepeat: 'no-repeat',
                      maskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      maskPosition: 'center',
                      WebkitMaskSize: 'contain',
                      maskSize: 'contain',
                    }}
                    title="Retour"
                  />
                  <div className="text-[28px] font-semibold leading-none tracking-tight text-[#1B4591] dark:text-primary">
                    Bienvenue !
                  </div>
                </div>

                <div className="text-sm text-[#6D7A91] dark:text-muted-foreground">
                  Connectez-vous à votre outil{' '}
                  <span className="font-semibold text-[#1B4591] dark:text-primary">ECOPILOT 1.0</span>
                </div>
              </div>

              {/* Message d'erreur */}
              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Formulaire de connexion */}
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Champ Email */}
                <div className="space-y-1.5 text-left">
                  <label htmlFor="login-email" className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="Entrer votre email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    autoComplete="email"
                    className="h-11 w-full rounded-xl border border-transparent bg-[#ECF4FF] dark:bg-muted/80 px-4 text-sm text-[#263248] dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#93C5FD] transition-all"
                  />
                </div>

                {/* Champ Mot de passe */}
                <div className="space-y-1.5 text-left">
                  <label htmlFor="login-password" className="text-sm font-medium text-foreground">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Entrer votre mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      autoComplete="current-password"
                      className="h-11 w-full rounded-xl border border-transparent bg-[#ECF4FF] dark:bg-muted/80 pr-11 pl-4 text-sm text-[#263248] dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#93C5FD] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 text-[#6D7A91]" /> : <Eye className="w-4 h-4 text-[#6D7A91]" />}
                    </button>
                  </div>
                </div>

                {/* Bouton de soumission */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="h-11 w-full rounded-full bg-[#1B4591] hover:bg-[#163A79] font-medium text-white shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Connexion en cours...</span>
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </button>

                {/* Mot de passe oublié */}
                <button
                  type="button"
                  className="w-full text-center text-sm text-[#0394D7] hover:underline underline-offset-4 font-normal pt-1"
                  onClick={() => alert('Veuillez utiliser le mot de passe configuré : 123456')}
                >
                  Mot de passe oublié ?
                </button>
              </form>

              {/* ── Bloc d'information compte préconfiguré ── */}
              <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-border text-left">
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-muted/50 border border-slate-200/60 dark:border-border text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-[#1B4591] dark:text-primary">
                    <ShieldCheck className="w-4 h-4 text-[#107C41]" />
                    <span>Compte administrateur configuré</span>
                  </div>
                  <div className="font-mono text-[11px] text-[#6D7A91] dark:text-muted-foreground flex flex-col gap-0.5">
                    <span>
                      Email : <strong className="text-[#263248] dark:text-foreground">marwa@eco-pilot.com</strong>
                    </span>
                    <span>
                      Mot de passe : <strong className="text-[#263248] dark:text-foreground">123456</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
