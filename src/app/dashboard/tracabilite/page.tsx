'use client';

import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Laptop,
  Monitor,
  KeyRound,
  Mouse,
  FileCheck2,
  Coffee,
} from 'lucide-react';
import { useInventory } from '@/lib/store';
import { TraceabilityAction } from '@/lib/types';

const TITLE_PAGE_STYLE = {
  fontFamily: "'Inter', system-ui, sans-serif",
  color: '#1B4591',
  fontSize: '31px',
  lineHeight: '37.2px',
  fontWeight: 600,
  letterSpacing: 0,
};

export default function TraceabilityPage() {
  const { auditLogs } = useInventory();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [itemTypeFilter, setItemTypeFilter] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.itemLabel.toLowerCase().includes(search.toLowerCase()) ||
      (log.serialNumber && log.serialNumber.toLowerCase().includes(search.toLowerCase())) ||
      (log.employeeName && log.employeeName.toLowerCase().includes(search.toLowerCase())) ||
      (log.dischargeNumber && log.dischargeNumber.toLowerCase().includes(search.toLowerCase()));

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const matchesType = itemTypeFilter === 'ALL' || log.itemType === itemTypeFilter;

    return matchesSearch && matchesAction && matchesType;
  });

  const getActionBadge = (action: TraceabilityAction) => {
    switch (action) {
      case 'ATTRIBUTION':
        return (
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: '#EFF6FF', color: '#1B4591', border: '1px solid #BFDBFE' }}
          >
            Attribution
          </span>
        );
      case 'RESTITUTION':
        return (
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: '#E6F7F1', color: '#10B981', border: '1px solid #A7F3D0' }}
          >
            Restitution
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: '#FFF3E0', color: '#F59E0B', border: '1px solid #FDD68A' }}
          >
            Maintenance SAV
          </span>
        );
      case 'DECLASSEMENT':
        return (
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: '#FEE2E2', color: '#EF4444', border: '1px solid #FCA5A5' }}
          >
            Rebut / Déclassé
          </span>
        );
      case 'CREATION':
        return (
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: '#F3E8FF', color: '#9333EA', border: '1px solid #E9D5FF' }}
          >
            Nouvelle entrée
          </span>
        );
      default:
        return null;
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'PC':
        return <Laptop className="w-3.5 h-3.5 text-[#1B4591]" />;
      case 'ECRAN':
        return <Monitor className="w-3.5 h-3.5 text-[#10B981]" />;
      case 'EQUIPEMENT':
        return <Coffee className="w-3.5 h-3.5 text-[#D97706]" />;
      case 'LICENCE':
        return <KeyRound className="w-3.5 h-3.5 text-[#9333EA]" />;
      default:
        return <Mouse className="w-3.5 h-3.5 text-[#0284C7]" />;
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Date/Heure',
      'Action',
      'Type',
      'Equipement',
      'Numero Serie',
      'Employe Destinataire',
      'Gestionnaire IT',
      'Etat',
      'Ref Decharge',
      'Notes',
    ];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.action}"`,
      `"${l.itemType}"`,
      `"${l.itemLabel}"`,
      `"${l.serialNumber || ''}"`,
      `"${l.employeeName || ''}"`,
      `"${l.performedBy}"`,
      `"${l.condition}"`,
      `"${l.dischargeNumber || ''}"`,
      `"${l.notes || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `journal_tracabilite_inventaire_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-[#263248] dark:text-foreground">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-semibold" style={TITLE_PAGE_STYLE}>
            Registre d'Audit & Traçabilité
          </h1>
          <p className="text-sm text-[#6D7A91] mt-1">
            Historique infalsifiable, opposable et horodaté de chaque mouvement, attribution et retour
          </p>
        </div>

        <button
          onClick={exportToCSV}
          className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-white dark:bg-card border border-slate-200 dark:border-border text-[#1B4591] dark:text-primary hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-[#1B4591]" />
          <span>Exporter le registre (CSV)</span>
        </button>
      </div>

      {/* ── Filter Bar ── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6D7A91]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par équipement, employé, SN ou réf décharge..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#F8FAFC] dark:bg-muted/50 border border-slate-200/80 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4591]/40 text-[#263248] dark:text-foreground"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-[#6D7A91]">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtres :</span>
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-muted border border-slate-200 dark:border-border rounded-xl text-[#263248] dark:text-foreground focus:outline-none"
          >
            <option value="ALL">Toutes les actions ({auditLogs.length})</option>
            <option value="ATTRIBUTION">Attributions</option>
            <option value="RESTITUTION">Restitutions</option>
            <option value="MAINTENANCE">Maintenances SAV</option>
            <option value="CREATION">Nouvelles entrées</option>
          </select>

          <select
            value={itemTypeFilter}
            onChange={(e) => setItemTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-muted border border-slate-200 dark:border-border rounded-xl text-[#263248] dark:text-foreground focus:outline-none"
          >
            <option value="ALL">Tous types</option>
            <option value="PC">Ordinateurs / PC</option>
            <option value="ECRAN">Écrans</option>
            <option value="EQUIPEMENT">Autres Équipements & Café</option>
            <option value="LICENCE">Licences logicielles</option>
            <option value="ACCESSOIRE">Accessoires</option>
          </select>
        </div>
      </div>

      {/* ── Traceability Table ── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white dark:bg-card dark:border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] dark:bg-muted/40 border-b border-slate-100 dark:border-border text-[#6D7A91] font-semibold">
                <th className="p-4">Horodatage</th>
                <th className="p-4">Action</th>
                <th className="p-4">Équipement / Réf</th>
                <th className="p-4">Collaborateur Destinataire</th>
                <th className="p-4">État Matériel</th>
                <th className="p-4">Gestionnaire IT</th>
                <th className="p-4">Décharge / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-border">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F8FAFC] dark:hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-mono text-[#6D7A91] text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="p-4">{getActionBadge(log.action)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      {getItemIcon(log.itemType)}
                      <span className="font-semibold text-[#2B313B] dark:text-foreground">
                        {log.itemLabel}
                      </span>
                    </div>
                    {log.serialNumber && (
                      <span className="font-mono text-[10px] text-[#6D7A91] block mt-0.5">
                        SN : {log.serialNumber}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {log.employeeName ? (
                      <div className="font-semibold text-[#2B313B] dark:text-foreground">
                        {log.employeeName}
                      </div>
                    ) : (
                      <span className="text-[#6D7A91] italic text-[11px]">Non spécifié</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="text-[11px] font-semibold text-[#2B313B] dark:text-foreground">
                      {log.condition}
                    </span>
                  </td>
                  <td className="p-4 text-[#6D7A91]">{log.performedBy}</td>
                  <td className="p-4">
                    {log.dischargeNumber && (
                      <div
                        className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full mb-1"
                        style={{ background: '#EFF6FF', color: '#1B4591', border: '1px solid #BFDBFE' }}
                      >
                        <FileCheck2 className="w-3 h-3 text-[#1B4591]" />
                        <span>{log.dischargeNumber}</span>
                      </div>
                    )}
                    {log.notes && (
                      <p className="text-[11px] text-[#6D7A91] line-clamp-1">{log.notes}</p>
                    )}
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#6D7A91]">
                    Aucun enregistrement d'audit ne correspond aux filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
