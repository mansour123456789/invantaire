'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Laptop,
  Monitor,
  Mouse,
  KeyRound,
  Users,
  History,
  ShieldCheck,
  LogOut,
  Building2,
  FileSpreadsheet,
  Coffee,
} from 'lucide-react';
import { useInventory } from '@/lib/store';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useInventory();

  const navItems = [
    {
      label: 'Accueil / Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Tableur Excel & CSV',
      href: '/dashboard/excel',
      icon: FileSpreadsheet,
      highlight: true,
    },
    {
      label: 'Parc PC & Laptops',
      href: '/dashboard/pc',
      icon: Laptop,
    },
    {
      label: 'Écrans & Moniteurs',
      href: '/dashboard/ecrans',
      icon: Monitor,
    },
    {
      label: 'Accessoires & Docks',
      href: '/dashboard/accessoires',
      icon: Mouse,
    },
    {
      label: 'Autres Équipements',
      href: '/dashboard/equipements',
      icon: Coffee,
    },
    {
      label: 'Licences & Logiciels',
      href: '/dashboard/licences',
      icon: KeyRound,
    },
    {
      label: 'Liste Employés',
      href: '/dashboard/employes',
      icon: Users,
    },
    {
      label: 'Traçabilité & Audit',
      href: '/dashboard/tracabilite',
      icon: History,
    },
  ];


  return (
    <aside
      className="fixed left-0 top-0 z-40 hidden h-dvh max-h-dvh flex-col overflow-hidden border-r lg:flex w-[248px] bg-white border-[#E6EAF2] text-[#263248] dark:bg-sidebar dark:border-sidebar-border dark:text-sidebar-foreground shadow-sm"
    >
      {/* ── Brand Logo Header (Exact frontend-intern style) ── */}
      <div className="flex shrink-0 items-center border-b border-[#F1F4F9] py-5 px-5 dark:border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B4591] text-white shadow-md shadow-[#1B4591]/20">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-[#1B4591] dark:text-white tracking-tight">
                EcoPilot
              </span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#1B4591]/10 text-[#1B4591] dark:bg-primary/20 dark:text-primary">
                1.0
              </span>
            </div>
            <p className="text-[11px] font-medium text-[#6D7A91] dark:text-muted-foreground">
              Gestion de Parc IT
            </p>
          </div>
        </Link>
      </div>

      {/* ── Navigation Links (Pill style rounded-full with #1B4591 active) ── */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3.5 py-4 space-y-1">
        <div className="px-4 pb-1 pt-2 text-xs font-semibold leading-snug tracking-wide text-[#2762C4] dark:text-primary uppercase">
          Inventaire & Parc
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[44px] items-center gap-3 rounded-full px-4 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#1B4591] text-white shadow-sm font-semibold dark:bg-primary dark:text-white'
                  : 'text-[#263248] hover:bg-[#F2F5FB] dark:text-sidebar-foreground/90 dark:hover:bg-white/[0.08]'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-transform ${
                  isActive ? 'scale-110 text-white' : 'text-[#6D7A91] dark:text-sidebar-muted'
                }`}
              />
              <span className="truncate flex-1">{item.label}</span>
              {item.highlight && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white text-[#107C41]'
                      : 'bg-[#107C41]/10 text-[#107C41] border border-[#107C41]/20'
                  }`}
                >
                  Excel
                </span>
              )}
            </Link>
          );
        })}

        <div className="px-4 pb-1 pt-6 text-xs font-semibold leading-snug tracking-wide text-[#2762C4] dark:text-primary uppercase">
          Sécurité & DSI
        </div>

        <div className="mx-2 p-3 rounded-2xl bg-[#F8FAFC] dark:bg-white/5 border border-[#E2E8F0] dark:border-white/10 text-xs">
          <div className="flex items-center gap-1.5 text-[#1B4591] dark:text-sky-400 font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Audit Trail Opposable</span>
          </div>
          <p className="text-[11px] text-[#6D7A91] dark:text-gray-400 leading-relaxed">
            Toute affectation enregistre une fiche signée et horodatée.
          </p>
        </div>
      </div>

      {/* ── Footer Profil (Exact frontend-intern style) ── */}
      <div className="mt-auto shrink-0 border-t border-[#F1F4F9] bg-white p-3 dark:border-sidebar-border dark:bg-sidebar">
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F2F5FB] dark:hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#1B4591]/10 text-[#1B4591] dark:bg-primary/20 dark:text-primary font-bold flex items-center justify-center text-xs">
              {user ? user.name.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-[#263248] dark:text-white truncate">
                {user?.name || 'Administrateur'}
              </p>
              <p className="text-[10px] text-[#6D7A91] dark:text-gray-400 truncate">
                {user?.role || 'ADMIN'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Se déconnecter"
            className="p-1.5 rounded-lg text-[#6D7A91] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
