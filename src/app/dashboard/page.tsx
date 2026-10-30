'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Laptop,
  Monitor,
  Mouse,
  KeyRound,
  Users,
  ShieldCheck,
  ArrowUpRight,
  AlertTriangle,
  History,
  TrendingUp,
  PlusCircle,
  Building2,
  CheckCircle2,
  FileSpreadsheet,
  Coffee,
} from 'lucide-react';
import { useInventory } from '@/lib/store';
import { AssignModal } from '@/components/inventaire/AssignModal';

const BLUE = '#1B4591';
const GRADIENT_START = '#1B4591';
const GRADIENT_END = '#5A87F2';

/** Styles typographiques stricts de frontend-intern */
const TITLE_PAGE_STYLE = {
  fontFamily: "'Inter', system-ui, sans-serif",
  color: '#1B4591',
  fontSize: '31px',
  lineHeight: '37.2px',
  fontWeight: 600,
  letterSpacing: 0,
};

const TITLE_WIDGET_STYLE = {
  color: '#2B313B',
  fontSize: '18px',
  lineHeight: '24px',
  fontWeight: 500,
  letterSpacing: 0,
};

// ─── StatCard avec le double ellipse design exact de frontend-intern ──────────
function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  outerColor,
  innerColor,
  iconColor = '#1B4591',
}: {
  label: string;
  value: number;
  sublabel?: string;
  icon: any;
  outerColor: string;
  innerColor: string;
  iconColor?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white dark:bg-card dark:border-border p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        {/* Double ellipse container */}
        <div
          className="relative flex-shrink-0 flex items-center justify-center"
          style={{ width: 64, height: 64 }}
        >
          {/* Outer circle */}
          <div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: outerColor }}
          />
          {/* Inner circle */}
          <div
            className="absolute rounded-full flex items-center justify-center"
            style={{ width: 46, height: 46, backgroundColor: innerColor }}
          >
            <Icon className="w-5 h-5" style={{ color: iconColor }} />
          </div>
        </div>

        <div>
          <p className="text-3xl font-bold tabular-nums text-[#263248] dark:text-foreground">
            {value.toLocaleString('fr-FR')}
          </p>
          <p className="mt-0.5 text-sm font-medium text-[#6D7A91] dark:text-muted-foreground">
            {label}
          </p>
          {sublabel && (
            <p className="text-[11px] font-semibold text-[#1B4591] dark:text-primary mt-0.5">
              {sublabel}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { computers, screens, accessories, licenses, employees, auditLogs, generalEquipments, user } = useInventory();
  const [assignModalData, setAssignModalData] = useState<{
    isOpen: boolean;
    itemType: 'PC' | 'ECRAN';
    itemId: string;
    itemLabel: string;
    serialNumber?: string;
  }>({
    isOpen: false,
    itemType: 'PC',
    itemId: '',
    itemLabel: '',
  });

  // Calculate statistics
  const assignedComputers = computers.filter((c) => c.status === 'AFFECTE').length;
  const inStockComputers = computers.filter((c) => c.status === 'DISPONIBLE').length;
  const inRepairComputers = computers.filter((c) => c.status === 'EN_REPARATION').length;

  const assignedScreens = screens.filter((s) => s.status === 'AFFECTE').length;
  const availableScreens = screens.filter((s) => s.status === 'DISPONIBLE').length;

  const lowStockAccessories = accessories.filter((a) => a.inStockQuantity <= a.alertThreshold);
  const totalAccessoriesUnits = accessories.reduce((acc, a) => acc + a.totalQuantity, 0);

  const totalSeats = licenses.reduce((acc, l) => acc + l.totalSeats, 0);
  const usedSeats = licenses.reduce((acc, l) => acc + l.usedSeats, 0);

  const coffeeCount = generalEquipments.filter((e) => e.category === 'ELECTROMENAGER').length;

  const firstAvailablePc = computers.find((c) => c.status === 'DISPONIBLE');

  return (
    <div className="space-y-6 text-[#263248] dark:text-foreground">
      {/* ── 1. Bannière Bienvenue Corporate (Exact frontend-intern AdminHome) ── */}
      <div className="relative z-0 overflow-visible">
        <div
          className="relative z-0 overflow-hidden rounded-2xl px-6 py-9 sm:px-10 sm:py-10 shadow-md text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6"
          style={{ background: `linear-gradient(to right, ${GRADIENT_START}, ${GRADIENT_END})` }}
        >
          <div className="relative z-10 max-w-xl space-y-2">
            <h1 className="text-3xl font-bold tracking-tight drop-shadow-sm sm:text-4xl">
              Bonjour, {user ? user.name.split(' ')[0] : 'Karim'}
            </h1>
            <p className="text-base font-medium leading-snug text-white/95 sm:text-lg">
              Bienvenue sur votre espace de gestion d'inventaire IT & traçabilité ECOPILOT 1.0 !
            </p>
            <p className="text-xs text-white/80 pt-1">
              Surveillance continue de {computers.length} ordinateurs, {screens.length} moniteurs,{' '}
              {generalEquipments.length} équipements & locaux et {licenses.length} contrats de licences.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            {firstAvailablePc && (
              <button
                onClick={() =>
                  setAssignModalData({
                    isOpen: true,
                    itemType: 'PC',
                    itemId: firstAvailablePc.id,
                    itemLabel: `${firstAvailablePc.brand} ${firstAvailablePc.model} (${firstAvailablePc.tag})`,
                    serialNumber: firstAvailablePc.serialNumber,
                  })
                }
                className="px-5 py-2.5 rounded-xl bg-white text-[#1B4591] font-bold text-xs shadow-md hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4 text-[#1B4591]" />
                <span>Affecter un PC libre</span>
              </button>
            )}
            <Link
              href="/dashboard/equipements"
              className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs border border-white/25 flex items-center gap-1.5 transition-all"
            >
              <Coffee className="w-4 h-4 text-white" />
              <span>Machines & Mobilier</span>
            </Link>
            <Link
              href="/dashboard/excel"
              className="px-4 py-2.5 rounded-xl bg-[#107C41] hover:bg-[#0E6B37] text-white font-bold text-xs shadow-md shadow-[#107C41]/30 flex items-center gap-1.5 transition-all"
              title="Ouvrir le Tableur Excel interactif"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span>Tableur Excel</span>
            </Link>
            <Link
              href="/dashboard/tracabilite"
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs border border-white/20 flex items-center gap-1.5 transition-all"
            >
              <History className="w-4 h-4 text-white" />
              <span>Registre d'audit</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. Titre Accueil (Exact style TITLE_PAGE_STYLE) ── */}
      <div>
        <h1 className="font-semibold" style={TITLE_PAGE_STYLE}>
          Accueil Inventaire
        </h1>
        <p className="text-[#6D7A91] text-sm mt-1">
          Indicateurs de performance et synthèse du parc matériel informatique
        </p>
      </div>

      {/* ── 3. KPI Cards (Exact double ellipse frontend-intern style) ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="PC & Laptops en service"
          value={assignedComputers}
          sublabel={`${inStockComputers} disponibles en stock`}
          icon={Laptop}
          outerColor="#CDD6FB"
          innerColor="#98AEF7"
          iconColor="#1B4591"
        />

        <StatCard
          label="Écrans & Moniteurs"
          value={screens.length}
          sublabel={`${assignedScreens} installés`}
          icon={Monitor}
          outerColor="#D4F5DA"
          innerColor="#B3EDBA"
          iconColor="#10B981"
        />

        <StatCard
          label="Équipements & Café"
          value={generalEquipments.length}
          sublabel={`${coffeeCount} café & électroménager`}
          icon={Coffee}
          outerColor="#FEF3C7"
          innerColor="#FDE68A"
          iconColor="#D97706"
        />

        <StatCard
          label="Accessoires en réserve"
          value={totalAccessoriesUnits}
          sublabel={`${lowStockAccessories.length} seuil(s) bas`}
          icon={Mouse}
          outerColor="#D8EAFF"
          innerColor="#A7D3FF"
          iconColor="#0284C7"
        />

        <StatCard
          label="Sièges de Licences"
          value={usedSeats}
          sublabel={`sur ${totalSeats} sièges au total`}
          icon={KeyRound}
          outerColor="#FBDBDB"
          innerColor="#F68989"
          iconColor="#E11D48"
        />
      </div>

      {/* ── 4. Grille Widgets & Répartition (Exact frontend-intern look) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche 2/3 : Statut Parc & Tableau des machines */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Vue globale d'exploitation */}
          <div className="rounded-2xl border border-slate-200/80 bg-white dark:bg-card dark:border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-medium" style={TITLE_WIDGET_STYLE}>
                  Statut Opérationnel du Parc Informatique
                </h2>
                <p className="text-xs text-[#6D7A91] mt-0.5">
                  Répartition des machines par disponibilité et état technique
                </p>
              </div>

              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: '#E6F7F1', color: '#10B981', border: '1px solid #A7F3D0' }}
              >
                {Math.round((assignedComputers / computers.length) * 100)}% Affecté
              </span>
            </div>

            {/* Gauge bar */}
            <div className="h-4 w-full bg-[#EFF1F8] dark:bg-muted rounded-full overflow-hidden flex mb-5">
              <div
                style={{ width: `${(assignedComputers / computers.length) * 100}%` }}
                className="bg-[#1B4591] hover:opacity-90 transition-all"
                title={`En service : ${assignedComputers}`}
              />
              <div
                style={{ width: `${(inStockComputers / computers.length) * 100}%` }}
                className="bg-[#10B981] hover:opacity-90 transition-all"
                title={`En réserve : ${inStockComputers}`}
              />
              <div
                style={{ width: `${(inRepairComputers / computers.length) * 100}%` }}
                className="bg-[#F59E0B] hover:opacity-90 transition-all"
                title={`En maintenance SAV : ${inRepairComputers}`}
              />
            </div>

            {/* Pills status details */}
            <div className="grid grid-cols-3 gap-4 pt-1">
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-muted/30 border border-[#E2E8F0] dark:border-border">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1B4591]" />
                  <span className="text-xs font-semibold text-[#263248] dark:text-foreground">
                    En service
                  </span>
                </div>
                <p className="text-2xl font-bold text-[#1B4591] dark:text-primary mt-1">
                  {assignedComputers}
                </p>
                <p className="text-[11px] text-[#6D7A91]">Dotation collaborateurs</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-muted/30 border border-[#E2E8F0] dark:border-border">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  <span className="text-xs font-semibold text-[#263248] dark:text-foreground">
                    En réserve
                  </span>
                </div>
                <p className="text-2xl font-bold text-[#10B981] mt-1">{inStockComputers}</p>
                <p className="text-[11px] text-[#6D7A91]">Prêts pour attribution</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-muted/30 border border-[#E2E8F0] dark:border-border">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  <span className="text-xs font-semibold text-[#263248] dark:text-foreground">
                    Maintenance SAV
                  </span>
                </div>
                <p className="text-2xl font-bold text-[#F59E0B] mt-1">{inRepairComputers}</p>
                <p className="text-[11px] text-[#6D7A91]">Atelier technique</p>
              </div>
            </div>
          </div>

          {/* Table: Derniers Ordinateurs Enregistrés */}
          <div className="rounded-2xl border border-slate-200/80 bg-white dark:bg-card dark:border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-medium" style={TITLE_WIDGET_STYLE}>
                  Derniers Postes Informatiques
                </h2>
                <p className="text-xs text-[#6D7A91] mt-0.5">Parc matériel et machines récentes</p>
              </div>
              <Link
                href="/dashboard/pc"
                className="text-xs font-semibold text-[#1B4591] dark:text-primary hover:underline flex items-center gap-1"
              >
                <span>Voir le parc complet</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-border text-[#6D7A91] font-semibold">
                    <th className="pb-3">Tag</th>
                    <th className="pb-3">Désignation</th>
                    <th className="pb-3">Configuration</th>
                    <th className="pb-3">Statut</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-border">
                  {computers.slice(0, 4).map((comp) => (
                    <tr key={comp.id} className="hover:bg-[#F8FAFC] dark:hover:bg-muted/40 transition-colors">
                      <td className="py-3 font-mono font-bold text-[#1B4591] dark:text-primary">
                        {comp.tag}
                      </td>
                      <td className="py-3">
                        <span className="font-semibold text-[#2B313B] dark:text-foreground">
                          {comp.brand} {comp.model}
                        </span>
                        <p className="text-[11px] font-mono text-[#6D7A91]">{comp.serialNumber}</p>
                      </td>
                      <td className="py-3 text-[#6D7A91]">
                        {comp.processor} · {comp.ram}
                      </td>
                      <td className="py-3">
                        {comp.status === 'AFFECTE' ? (
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                            style={{ background: '#EFF6FF', color: '#1B4591', border: '1px solid #BFDBFE' }}
                          >
                            En service
                          </span>
                        ) : comp.status === 'DISPONIBLE' ? (
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                            style={{ background: '#E6F7F1', color: '#10B981', border: '1px solid #A7F3D0' }}
                          >
                            En stock
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                            style={{ background: '#FFF3E0', color: '#F59E0B', border: '1px solid #FDD68A' }}
                          >
                            SAV
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {comp.status === 'DISPONIBLE' ? (
                          <button
                            onClick={() =>
                              setAssignModalData({
                                isOpen: true,
                                itemType: 'PC',
                                itemId: comp.id,
                                itemLabel: `${comp.brand} ${comp.model} (${comp.tag})`,
                                serialNumber: comp.serialNumber,
                              })
                            }
                            className="px-3 py-1 rounded-xl bg-[#1B4591] text-white hover:bg-[#153875] font-semibold text-[11px]"
                          >
                            Affecter
                          </button>
                        ) : (
                          <Link
                            href="/dashboard/pc"
                            className="text-[11px] font-semibold text-[#1B4591] hover:underline"
                          >
                            Consulter
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Colonne droite 1/3 : Journal d'Activité Récente (Activity Feed) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white dark:bg-card dark:border-border p-6 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-border mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#1B4591]" />
                <h2 className="font-medium" style={TITLE_WIDGET_STYLE}>
                  Activité Récente
                </h2>
              </div>
              <span className="text-[11px] font-mono text-[#6D7A91]">Temps réel</span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[460px] pr-1">
              {auditLogs.slice(0, 6).map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-muted/30 border border-[#E2E8F0] dark:border-border text-xs space-y-1.5 hover:border-[#1B4591]/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={
                        log.action === 'ATTRIBUTION'
                          ? { background: '#EFF6FF', color: '#1B4591', border: '1px solid #BFDBFE' }
                          : log.action === 'RESTITUTION'
                          ? { background: '#E6F7F1', color: '#10B981', border: '1px solid #A7F3D0' }
                          : { background: '#FFF3E0', color: '#F59E0B', border: '1px solid #FDD68A' }
                      }
                    >
                      {log.action}
                    </span>
                    <span className="text-[10px] text-[#6D7A91] font-mono">{log.timestamp}</span>
                  </div>

                  <p className="font-semibold text-[#2B313B] dark:text-foreground">{log.itemLabel}</p>

                  {log.employeeName && (
                    <p className="text-[11px] text-[#6D7A91]">
                      Bénéficiaire :{' '}
                      <strong className="text-[#2B313B] dark:text-foreground">
                        {log.employeeName}
                      </strong>
                    </p>
                  )}

                  {log.dischargeNumber && (
                    <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-[#1B4591] dark:text-sky-400">
                      <span>Réf : {log.dischargeNumber}</span>
                      <span className="text-[#10B981] font-semibold">Décharge signée</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-border mt-4 text-center">
              <Link
                href="/dashboard/tracabilite"
                className="text-xs font-semibold text-[#1B4591] dark:text-primary hover:underline flex items-center justify-center gap-1"
              >
                <span>Accéder au journal complet d'audit</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      <AssignModal
        isOpen={assignModalData.isOpen}
        onClose={() => setAssignModalData((prev) => ({ ...prev, isOpen: false }))}
        itemType={assignModalData.itemType}
        itemId={assignModalData.itemId}
        itemLabel={assignModalData.itemLabel}
        serialNumber={assignModalData.serialNumber}
      />
    </div>
  );
}
