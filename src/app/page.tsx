'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useInventory } from '@/lib/store';
import LoginPage from './login/page';

export default function HomePage() {
  const router = useRouter();
  const { user } = useInventory();

  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  // Si l'utilisateur est déjà connecté, on affiche un bref indicateur pendant la redirection
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground font-medium">Accès au tableau de bord EcoPilot...</p>
        </div>
      </div>
    );
  }

  // Premier interface par défaut : La page de connexion
  return <LoginPage />;
}
