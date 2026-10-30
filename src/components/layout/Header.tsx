'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Sun,
  Moon,
  Search,
  AlertTriangle,
  CheckCircle2,
  User as UserIcon,
  ChevronDown,
  FileSpreadsheet,
  Wrench,
  Coffee,
} from 'lucide-react';
import { useInventory } from '@/lib/store';

export const Header: React.FC<{ title?: string; subtitle?: string }> = ({
  title = "Accueil",
  subtitle = "Espace d'inventaire informatique et gestion des dotations",
}) => {
  const { theme, toggleTheme, user, accessories, licenses, generalEquipments } = useInventory();
  const [showNotifications, setShowNotifications] = useState(false);

  // Compute alerts
  const lowStockAccessories = accessories.filter((a) => a.inStockQuantity <= a.alertThreshold);
  const expiringLicenses = licenses.filter((l) => {
    const exp = new Date(l.expirationDate);
    const now = new Date();
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 90;
  });
  const repairingEquipments = generalEquipments.filter((e) => e.status === 'EN_REPARATION');

  const totalAlerts = lowStockAccessories.length + expiringLicenses.length + repairingEquipments.length;

  return (
    <header className="sticky top-0 z-30 h-[4.25rem] bg-transparent dark:bg-background transition-colors">
      <div className="mx-auto flex h-full max-w-[1920px] items-center justify-between px-6 lg:px-8">
        {/* ── Left: Search or Context ── */}
        <div className="relative min-w-0 flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6D7A91]" />
            <input
              type="text"
              placeholder="Rechercher équipement, N° de série, collaborateur..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-white/90 dark:bg-card border border-slate-200/80 dark:border-border rounded-full focus:outline-none focus:ring-2 focus:ring-[#1B4591]/40 text-[#263248] dark:text-foreground shadow-sm transition-all"
            />
          </div>
        </div>

        {/* ── Right: Exact frontend-intern Actions Toolbar ── */}
        <div className="flex shrink-0 items-center gap-3 sm:gap-4 ml-auto">
          {/* Pill shortcuts container */}
          <div
            className="flex items-center gap-2.5 rounded-[22px] border border-slate-200/70 bg-[#eef1f8]/95 px-2.5 py-1.5 dark:border-border dark:bg-slate-900/50"
            role="toolbar"
          >
            {/* Quick Excel Tableur shortcut */}
            <Link
              href="/dashboard/excel"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 text-[#107C41] font-semibold text-xs shadow-sm border border-slate-200/50 hover:bg-slate-50 transition-colors"
              title="Ouvrir le Tableur Excel interactif & Import CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden md:inline font-bold">Tableur Excel</span>
            </Link>

            {/* Theme switcher pill (Lune | Soleil) */}
            <div className="flex items-center gap-0.5 rounded-full bg-white p-1 shadow-sm dark:bg-slate-800/95">
              <button
                type="button"
                onClick={() => {
                  if (theme !== 'dark') toggleTheme();
                }}
                aria-label="Mode sombre"
                className={`flex h-8 w-9 items-center justify-center rounded-full transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-[#1a3a5c] text-white shadow-sm dark:bg-[#2563eb]'
                    : 'text-[#1a3a5c] hover:bg-slate-50 dark:text-slate-300'
                }`}
              >
                <Moon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (theme !== 'light') toggleTheme();
                }}
                aria-label="Mode clair"
                className={`flex h-8 w-9 items-center justify-center rounded-full transition-all duration-200 ${
                  theme === 'light'
                    ? 'bg-[#1a3a5c] text-white shadow-sm dark:bg-[#2563eb]'
                    : 'text-[#1a3a5c] hover:bg-slate-50 dark:text-slate-300'
                }`}
              >
                <Sun className="w-4 h-4" />
              </button>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-slate-800 text-[#1a3a5c] dark:text-slate-200 shadow-sm border border-slate-200/50 hover:bg-slate-50 transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {totalAlerts > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
                )}
              </button>

              {/* Notification Popup */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-card rounded-2xl border border-border shadow-xl z-50 p-3.5">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
                    <span className="text-xs font-semibold text-[#263248] dark:text-foreground">
                      Alertes du Parc IT
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1B4591]/10 text-[#1B4591] font-bold">
                      {totalAlerts} alerte(s)
                    </span>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {lowStockAccessories.map((acc) => (
                      <div
                        key={acc.id}
                        className="flex items-start gap-2 p-2.5 rounded-xl bg-[#FFF3E0] border border-[#FDD68A] text-xs text-[#92400E]"
                      >
                        <AlertTriangle className="w-4 h-4 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">{acc.name}</p>
                          <p className="text-[11px]">
                            Stock faible : {acc.inStockQuantity} restant(s) (seuil : {acc.alertThreshold})
                          </p>
                        </div>
                      </div>
                    ))}

                    {expiringLicenses.map((lic) => (
                      <div
                        key={lic.id}
                        className="flex items-start gap-2 p-2.5 rounded-xl bg-[#FEE2E2] border border-[#FCA5A5] text-xs text-[#991B1B]"
                      >
                        <AlertTriangle className="w-4 h-4 text-[#EF4444] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">{lic.name}</p>
                          <p className="text-[11px]">Échéance : {lic.expirationDate}</p>
                        </div>
                      </div>
                    ))}

                    {repairingEquipments.map((eq) => (
                      <div
                        key={eq.id}
                        className="flex items-start gap-2 p-2.5 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-xs text-[#92400E]"
                      >
                        <Wrench className="w-4 h-4 text-[#D97706] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">{eq.name} ({eq.tag})</p>
                          <p className="text-[11px]">En maintenance ({eq.location})</p>
                        </div>
                      </div>
                    ))}

                    {totalAlerts === 0 && (
                      <div className="text-center py-4 text-xs text-[#6D7A91] flex flex-col items-center gap-1">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span>Tous les stocks et licences sont conformes</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Menu Trigger (Exact frontend-intern style) */}
          <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white/90 py-1.5 pl-2 pr-3 shadow-sm hover:border-[#C5D9F5] hover:bg-[#ECF4FF]/70 transition-all dark:border-border dark:bg-card/90">
            <div className="h-9 w-9 rounded-full bg-[#1B4591] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {user ? user.name.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-[#263248] dark:text-foreground leading-tight">
                {user?.name || 'Administrateur'}
              </p>
              <p className="text-[10px] text-[#6D7A91] dark:text-muted-foreground">
                {user?.role || 'ADMIN'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#6D7A91] ml-0.5" />
          </div>
        </div>
      </div>
    </header>
  );
};
