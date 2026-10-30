import type { Metadata } from 'next';
import './globals.css';
import { InventoryProvider } from '@/lib/store';

export const metadata: Metadata = {
  title: 'EcoPilot - Gestion d\'Inventaire Parc IT & Licences',
  description: 'Application d\'inventaire informatique : PC, Écrans, Accessoires, Licences et Traçabilité Complète des Affectations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground transition-colors">
        <InventoryProvider>
          {children}
        </InventoryProvider>
      </body>
    </html>
  );
}
