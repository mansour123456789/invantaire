'use client';

import React, { useState } from 'react';
import {
  Monitor,
  Search,
  Plus,
  Filter,
  UserCheck,
  RotateCcw,
  Trash2,
  FileSpreadsheet,
  Upload,
  Download,
} from 'lucide-react';
import { useInventory } from '@/lib/store';
import { Screen, EquipmentStatus } from '@/lib/types';
import { AssignModal } from '@/components/inventaire/AssignModal';
import { ExcelTableModal } from '@/components/inventaire/ExcelTableModal';

const TITLE_PAGE_STYLE = {
  fontFamily: "'Inter', system-ui, sans-serif",
  color: '#1B4591',
  fontSize: '31px',
  lineHeight: '37.2px',
  fontWeight: 600,
  letterSpacing: 0,
};

export default function ScreensPage() {
  const {
    screens,
    employees,
    returnScreen,
    addScreen,
    deleteScreen,
    getEmployeeById,
  } = useInventory();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // Modal for new screen
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newScreenData, setNewScreenData] = useState({
    tag: `EC-${screens.length + 1}`,
    brand: 'DELL',
    model: '23.8" Full HD',
    characteristics: '23.8" Full HD 1920x1080p, 75Hz, HDMI, VGA',
    year: new Date().getFullYear(),
    sizeInch: 24,
    price: 180,
    serialNumber: `DL-238-${new Date().getFullYear()}-00${screens.length + 1}`,
    status: 'DISPONIBLE' as EquipmentStatus,
    deskLocation: 'Armoire Réserve IT',
  });

  // Modal for assignment
  const [assignModal, setAssignModal] = useState<{
    isOpen: boolean;
    screenId: string;
    label: string;
    sn: string;
  }>({
    isOpen: false,
    screenId: '',
    label: '',
    sn: '',
  });

  const filteredScreens = screens.filter((s) => {
    const matchesSearch =
      s.tag.toLowerCase().includes(search.toLowerCase()) ||
      s.model.toLowerCase().includes(search.toLowerCase()) ||
      s.brand.toLowerCase().includes(search.toLowerCase()) ||
      (s.characteristics && s.characteristics.toLowerCase().includes(search.toLowerCase())) ||
      (s.assignedEmployeeName && s.assignedEmployeeName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addScreen(newScreenData);
    setIsAddModalOpen(false);
    setNewScreenData({
      tag: `EC-${screens.length + 2}`,
      brand: 'DELL',
      model: '',
      characteristics: '',
      year: new Date().getFullYear(),
      sizeInch: 24,
      price: 180,
      serialNumber: '',
      status: 'DISPONIBLE',
      deskLocation: 'Armoire Réserve IT',
    });
  };

  const handleExportCsv = () => {
    const headers = ['ID_Ecran', 'Marque / Modèle', 'Caractéristiques', 'Année', 'Prix_EUR', 'État', 'Affecté à'];
    const rows = screens.map((s) => [
      `"${s.tag}"`,
      `"${s.brand}"`,
      `"${(s.characteristics || s.model).replace(/"/g, '""')}"`,
      `"${s.year || 2024}"`,
      `"${s.price || 0} €"`,
      `"${s.status === 'DISPONIBLE' ? 'Disponible' : 'Non disponible'}"`,
      `"${s.assignedEmployeeName || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Inventaire_Informatique_EcoPilot(Écrans)_Export_${new Date().toISOString().split('T')[0]}.csv`
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
            Écrans & Moniteurs ({screens.length} unités)
          </h1>
          <p className="text-sm text-[#6D7A91] mt-1">
            Catalogue d'affichage synchronisé avec le fichier officiel EcoPilot (Écrans).csv
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          {/* Mode Excel / Import CSV Button */}
          <button
            onClick={() => setIsExcelModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#107C41] text-white hover:bg-[#0E6B37] font-semibold text-xs shadow-md shadow-[#107C41]/20 flex items-center gap-2 transition-all"
            title="Ouvrir la grille Excel interactive ou importer un CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-white" />
            <span>Mode Tableur Excel / Import CSV</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-white dark:bg-card border border-slate-200 dark:border-border hover:bg-slate-50 text-[#107C41] flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-[#1B4591] text-white hover:bg-[#153875] transition-all shadow-md shadow-[#1B4591]/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter</span>
          </button>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6D7A91]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par ID (EC-1), marque, caractéristique, collaborateur..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#F8FAFC] dark:bg-muted/50 border border-slate-200/80 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4591]/40 text-[#263248] dark:text-foreground"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#6D7A91]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-muted border border-slate-200 dark:border-border rounded-xl text-[#263248] dark:text-foreground focus:outline-none"
          >
            <option value="ALL">Tous les écrans ({screens.length})</option>
            <option value="DISPONIBLE">
              Disponibles en réserve ({screens.filter((s) => s.status === 'DISPONIBLE').length})
            </option>
            <option value="AFFECTE">
              En service / Affectés ({screens.filter((s) => s.status === 'AFFECTE').length})
            </option>
          </select>
        </div>
      </div>

      {/* ── Table view matching the exact CSV structure ── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white dark:bg-card dark:border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] dark:bg-muted/40 border-b border-slate-100 dark:border-border text-[#6D7A91] font-semibold">
                <th className="p-4 w-24">ID_Ecran</th>
                <th className="p-4 w-32">Marque / Modèle</th>
                <th className="p-4">Caractéristiques</th>
                <th className="p-4 w-20 text-center">Année</th>
                <th className="p-4 w-24 text-right">Prix</th>
                <th className="p-4 w-28 text-center">État</th>
                <th className="p-4 w-44">Affecté à</th>
                <th className="p-4 text-right w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-border">
              {filteredScreens.map((screen) => {
                const isDispo = screen.status === 'DISPONIBLE';
                const assignedEmp = getEmployeeById(screen.assignedToEmployeeId);
                const empName = screen.assignedEmployeeName || (assignedEmp ? `${assignedEmp.firstName} ${assignedEmp.lastName}` : '');

                return (
                  <tr key={screen.id} className="hover:bg-[#F8FAFC] dark:hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-[#1B4591] dark:text-primary text-sm">
                      {screen.tag}
                    </td>

                    <td className="p-4 font-semibold text-[#2B313B] dark:text-foreground">
                      {screen.brand}
                    </td>

                    <td className="p-4 text-[#263248] dark:text-foreground/90 max-w-md">
                      <p className="line-clamp-2 leading-relaxed">
                        {screen.characteristics || screen.model}
                      </p>
                    </td>

                    <td className="p-4 text-center font-mono font-medium text-[#6D7A91]">
                      {screen.year || '2024'}
                    </td>

                    <td className="p-4 text-right font-semibold text-[#1B4591] dark:text-primary">
                      {screen.price ? `${screen.price.toLocaleString('fr-FR')} €` : '-'}
                    </td>

                    <td className="p-4 text-center">
                      {isDispo ? (
                        <span
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ background: '#E6F7F1', color: '#10B981', border: '1px solid #A7F3D0' }}
                        >
                          Disponible
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ background: '#FEE2E2', color: '#EF4444', border: '1px solid #FCA5A5' }}
                        >
                          Non disponible
                        </span>
                      )}
                    </td>

                    <td className="p-4 font-semibold">
                      {empName ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#1B4591]/10 text-[#1B4591] font-bold flex items-center justify-center text-[10px]">
                            {empName.slice(0, 1)}
                          </div>
                          <span className="text-[#1B4591] dark:text-primary">{empName}</span>
                        </div>
                      ) : (
                        <span className="text-[#6D7A91] italic font-normal text-[11px]">—</span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isDispo ? (
                          <button
                            onClick={() =>
                              setAssignModal({
                                isOpen: true,
                                screenId: screen.id,
                                label: `${screen.brand} (${screen.tag})`,
                                sn: screen.serialNumber,
                              })
                            }
                            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#1B4591] text-white hover:bg-[#153875] flex items-center gap-1 shadow-sm"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Affecter</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => returnScreen(screen.id, 'BON_ETAT', 'Retour écran en stock')}
                            className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-muted border border-slate-200 dark:border-border hover:bg-slate-50 text-[#263248] flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-[#1B4591]" />
                            <span>Restituer</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (confirm(`Supprimer l'écran ${screen.tag} ?`)) {
                              deleteScreen(screen.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-[#6D7A91] hover:text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Add Screen ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-2xl border border-border shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-[#1B4591] dark:text-primary text-lg mb-1">
              Enregistrer un nouvel écran
            </h3>
            <p className="text-xs text-[#6D7A91] mb-4">
              Ajout au catalogue des moniteurs
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">ID_Ecran (Tag) *</label>
                  <input
                    type="text"
                    required
                    value={newScreenData.tag}
                    onChange={(e) => setNewScreenData({ ...newScreenData, tag: e.target.value })}
                    className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl font-mono text-[#1B4591]"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Année *</label>
                  <input
                    type="number"
                    required
                    value={newScreenData.year}
                    onChange={(e) =>
                      setNewScreenData({ ...newScreenData, year: parseInt(e.target.value) || 2024 })
                    }
                    className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Prix unitaire (€)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Ex: 180"
                  value={newScreenData.price}
                  onChange={(e) =>
                    setNewScreenData({ ...newScreenData, price: Number(e.target.value) || 0 })
                  }
                  className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl font-mono text-[#1B4591]"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Marque *</label>
                <input
                  type="text"
                  required
                  value={newScreenData.brand}
                  onChange={(e) => setNewScreenData({ ...newScreenData, brand: e.target.value })}
                  className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Caractéristiques techniques *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ex: Ecran Gamer - REDRAGON AMBER II 27 180Hz, 1Ms..."
                  value={newScreenData.characteristics}
                  onChange={(e) =>
                    setNewScreenData({ ...newScreenData, characteristics: e.target.value })
                  }
                  className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-border mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-[#6D7A91] hover:bg-slate-50 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1B4591] text-white font-semibold rounded-xl hover:bg-[#153875] shadow-sm"
                >
                  Enregistrer l'écran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Assignment ── */}
      <AssignModal
        isOpen={assignModal.isOpen}
        onClose={() => setAssignModal((prev) => ({ ...prev, isOpen: false }))}
        itemType="ECRAN"
        itemId={assignModal.screenId}
        itemLabel={assignModal.label}
        serialNumber={assignModal.sn}
      />

      {/* ── Interactive Excel Spreadsheet Modal ── */}
      <ExcelTableModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
      />
    </div>
  );
}
