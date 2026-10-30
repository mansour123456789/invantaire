'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useInventory } from '@/lib/store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user } = useInventory();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen min-h-dvh flex-col bg-background text-foreground transition-colors">
      {/* ── Fixed Sidebar ── */}
      <Sidebar />

      {/* ── Main Layout Column (Pl-248px for sidebar width) ── */}
      <div className="flex min-h-0 flex-1 flex-col transition-all duration-300 lg:pl-[248px]">
        <Header />
        <main className="flex min-h-0 flex-1 flex-col bg-background p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
