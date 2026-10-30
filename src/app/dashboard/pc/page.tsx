'use client';

import React, { useState } from 'react';
import {
  Laptop,
  Search,
  Plus,
  Filter,
  UserCheck,
  RotateCcw,
  Wrench,
  Trash2,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { useInventory } from '@/lib/store';
import { Computer, EquipmentStatus, ComputerType } from '@/lib/types';
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

export default function ComputersPage() {
  const {
    computers,
    employees,
    returnComputer,
    updateComputerStatus,
    addComputer,
    deleteComputer,
    getEmployeeById,
  } = useInventory();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // Modal for new computer
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCompData, setNewCompData] = useState({
    tag: `PC-${new Date().getFullYear()}-00${computers.length + 1}`,
    type: 'LAPTOP' as ComputerType,
    brand: 'Dell',
    model: 'Latitude 5540',
    serialNumber: '',
    processor: 'Intel Core i7-1365U',
    ram: '16 Go DDR5',
    storage: '512 Go NVMe SSD',
    purchaseDate: new Date().toISOString().split('T')[0],
    warrantyUntil: '2027-01-01',
    status: 'DISPONIBLE' as EquipmentStatus,
    location: 'Stock Réserve IT',
    notes: '',
    price: 1200,
  });

  // Modal for assignment
  const [assignModal, setAssignModal] = useState<{
    isOpen: boolean;
    pcId: string;
    label: string;
    sn: string;
  }>({
    isOpen: false,
    pcId: '',
    label: '',
    sn: '',
  });

  const filteredComputers = computers.filter((c) => {
    const matchesSearch =
      c.tag.toLowerCase().includes(search.toLowerCase()) ||
      c.model.toLowerCase().includes(search.toLowerCase()) ||
      c.brand.toLowerCase().includes(search.toLowerCase()) ||
      c.serialNumber.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || c.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompData.serialNumber.trim()) {
      alert('Veuillez saisir un numéro de série valide.');
      return;
    }
    addComputer(newCompData);
    setIsAddModalOpen(false);
    setNewCompData({
      tag: `PC-${new Date().getFullYear()}-00${computers.length + 2}`,
      type: 'LAPTOP',
      brand: 'Dell',
      model: '',
      serialNumber: '',
      processor: 'Intel Core i5',
      ram: '16 Go',
      storage: '512 Go SSD',
      purchaseDate: new Date().toISOString().split('T')[0],
      warrantyUntil: '2027-01-01',
      status: 'DISPONIBLE',
      location: 'Stock Réserve IT',
      notes: '',
      price: 1200,
    });
  };

  const handleExportCsv = () => {
    const headers = ['Tag', 'Type', 'Marque', 'Modele', 'Numero_Serie', 'Processeur', 'RAM', 'Stockage', 'Prix_EUR', 'Statut', 'Affecte_A'];
    const rows = computers.map((c) => {
      const emp = getEmployeeById(c.assignedToEmployeeId);
      const empName = emp ? `${emp.firstName} ${emp.lastName}` : 'En stock';
      return [
        `"${c.tag}"`,
        `"${c.type}"`,
        `"${c.brand}"`,
        `"${c.model}"`,
        `"${c.serialNumber}"`,
        `"${c.processor}"`,
        `"${c.ram}"`,
        `"${c.storage}"`,
        `"${c.price || 0} €"`,
        `"${c.status}"`,
        `"${empName}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Inventaire_PC_EcoPilot_Export_${new Date().toISOString().split('T')[0]}.csv`);
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
            Parc Ordinateurs & Laptops ({computers.length})
          </h1>
          <p className="text-sm text-[#6D7A91] mt-1">
            Gestion du matériel informatique, fiches d'attribution et suivi technique
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setIsExcelModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#107C41] text-white hover:bg-[#0E6B37] font-semibold text-xs shadow-md shadow-[#107C41]/20 flex items-center gap-2 transition-all"
            title="Ouvrir la grille Excel interactive pour modifier les PC et collaborateurs"
          >
            <FileSpreadsheet className="w-4 h-4 text-white" />
            <span>Mode Tableur Excel</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-white dark:bg-card border border-slate-200 dark:border-border hover:bg-slate-50 text-[#1B4591] flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4 text-[#1B4591]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#1B4591] text-white hover:bg-[#153875] transition-all shadow-md shadow-[#1B4591]/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un ordinateur</span>
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
            placeholder="Rechercher par tag, n° de série, modèle..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#F8FAFC] dark:bg-muted/50 border border-slate-200/80 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4591]/40 text-[#263248] dark:text-foreground"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-[#6D7A91]">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtres :</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-muted border border-slate-200 dark:border-border rounded-xl text-[#263248] dark:text-foreground focus:outline-none"
          >
            <option value="ALL">Tous les statuts ({computers.length})</option>
            <option value="DISPONIBLE">
              En réserve libre ({computers.filter((c) => c.status === 'DISPONIBLE').length})
            </option>
            <option value="AFFECTE">
              En service / Affectés ({computers.filter((c) => c.status === 'AFFECTE').length})
            </option>
            <option value="EN_REPARATION">
              En SAV ({computers.filter((c) => c.status === 'EN_REPARATION').length})
            </option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-muted border border-slate-200 dark:border-border rounded-xl text-[#263248] dark:text-foreground focus:outline-none"
          >
            <option value="ALL">Tous types</option>
            <option value="LAPTOP">PC Portables</option>
            <option value="DESKTOP">Stations Fixes</option>
            <option value="SERVER">Serveurs</option>
          </select>
        </div>
      </div>

      {/* ── Computers Table ── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white dark:bg-card dark:border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] dark:bg-muted/40 border-b border-slate-100 dark:border-border text-[#6D7A91] font-semibold">
                <th className="p-4">Tag</th>
                <th className="p-4">Marque & Modèle</th>
                <th className="p-4">N° de Série</th>
                <th className="p-4">Configuration</th>
                <th className="p-4 text-right">Prix</th>
                <th className="p-4">Statut</th>
                <th className="p-4">Affecté à</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-border">
              {filteredComputers.map((comp) => {
                const assignedEmp = getEmployeeById(comp.assignedToEmployeeId);
                return (
                  <tr key={comp.id} className="hover:bg-[#F8FAFC] dark:hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-bold text-[#1B4591] dark:text-primary text-sm">
                        {comp.tag}
                      </div>
                      <span className="text-[10px] text-[#6D7A91] uppercase">{comp.type}</span>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-[#2B313B] dark:text-foreground">
                        {comp.brand} {comp.model}
                      </div>
                      <div className="text-[11px] text-[#6D7A91]">Garantie : {comp.warrantyUntil}</div>
                    </td>
                    <td className="p-4 font-mono text-[11px] font-semibold text-[#2B313B] dark:text-foreground">
                      {comp.serialNumber}
                    </td>
                    <td className="p-4">
                      <div className="text-[#2B313B] dark:text-foreground font-medium">
                        {comp.processor}
                      </div>
                      <div className="text-[11px] text-[#6D7A91]">
                        {comp.ram} · {comp.storage}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-semibold text-[#1B4591] dark:text-primary">
                        {comp.price ? `${comp.price.toLocaleString('fr-FR')} €` : '-'}
                      </div>
                    </td>
                    <td className="p-4">
                      {comp.status === 'AFFECTE' ? (
                        <span
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ background: '#EFF6FF', color: '#1B4591', border: '1px solid #BFDBFE' }}
                        >
                          En service
                        </span>
                      ) : comp.status === 'DISPONIBLE' ? (
                        <span
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ background: '#E6F7F1', color: '#10B981', border: '1px solid #A7F3D0' }}
                        >
                          En stock
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ background: '#FFF3E0', color: '#F59E0B', border: '1px solid #FDD68A' }}
                        >
                          Atelier SAV
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {assignedEmp ? (
                        <div>
                          <p className="font-semibold text-[#2B313B] dark:text-foreground">
                            {assignedEmp.firstName} {assignedEmp.lastName}
                          </p>
                          <p className="text-[11px] text-[#6D7A91]">{assignedEmp.department}</p>
                        </div>
                      ) : (
                        <span className="text-[#6D7A91] italic text-[11px]">Non assigné</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {comp.status === 'DISPONIBLE' ? (
                          <button
                            onClick={() =>
                              setAssignModal({
                                isOpen: true,
                                pcId: comp.id,
                                label: `${comp.brand} ${comp.model} (${comp.tag})`,
                                sn: comp.serialNumber,
                              })
                            }
                            className="px-3 py-1.5 rounded-xl bg-[#1B4591] text-white hover:bg-[#153875] font-semibold text-xs flex items-center gap-1 shadow-sm"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Affecter</span>
                          </button>
                        ) : comp.status === 'AFFECTE' ? (
                          <button
                            onClick={() => returnComputer(comp.id, 'BON_ETAT', 'Restitution standard')}
                            className="px-3 py-1.5 rounded-xl bg-white dark:bg-muted border border-slate-200 dark:border-border hover:bg-slate-50 text-[#263248] font-semibold text-xs flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-[#1B4591]" />
                            <span>Restituer</span>
                          </button>
                        ) : null}

                        {comp.status !== 'EN_REPARATION' ? (
                          <button
                            onClick={() => updateComputerStatus(comp.id, 'EN_REPARATION')}
                            title="Envoyer en maintenance SAV"
                            className="p-1.5 rounded-lg text-[#6D7A91] hover:text-[#F59E0B] hover:bg-[#FFF3E0]"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => updateComputerStatus(comp.id, 'DISPONIBLE')}
                            className="px-2.5 py-1 rounded-xl bg-[#E6F7F1] text-[#10B981] text-[11px] font-bold border border-[#A7F3D0]"
                          >
                            Fin SAV
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (confirm(`Confirmer la suppression de ${comp.tag} ?`)) {
                              deleteComputer(comp.id);
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

              {filteredComputers.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#6D7A91]">
                    Aucun ordinateur ne correspond aux filtres appliqués.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Computer */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-2xl border border-border shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-[#1B4591] dark:text-primary text-lg mb-1">
              Enregistrer un nouvel équipement PC
            </h3>
            <p className="text-xs text-[#6D7A91] mb-4">
              Création d'une fiche matérielle avec traçabilité immédiate
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Tag d'inventaire *</label>
                  <input
                    type="text"
                    required
                    value={newCompData.tag}
                    onChange={(e) => setNewCompData({ ...newCompData, tag: e.target.value })}
                    className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl font-mono text-[#1B4591]"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Type de poste *</label>
                  <select
                    value={newCompData.type}
                    onChange={(e) =>
                      setNewCompData({ ...newCompData, type: e.target.value as ComputerType })
                    }
                    className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl"
                  >
                    <option value="LAPTOP">PC Portable</option>
                    <option value="DESKTOP">Station Fixe</option>
                    <option value="SERVER">Serveur</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Marque *</label>
                  <input
                    type="text"
                    required
                    value={newCompData.brand}
                    onChange={(e) => setNewCompData({ ...newCompData, brand: e.target.value })}
                    className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Modèle *</label>
                  <input
                    type="text"
                    required
                    value={newCompData.model}
                    placeholder="Ex: Latitude 5540, ThinkPad T14"
                    onChange={(e) => setNewCompData({ ...newCompData, model: e.target.value })}
                    className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Numéro de Série (SN) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: DL-5540-8812A"
                  value={newCompData.serialNumber}
                  onChange={(e) => setNewCompData({ ...newCompData, serialNumber: e.target.value })}
                  className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Processeur</label>
                  <input
                    type="text"
                    value={newCompData.processor}
                    onChange={(e) => setNewCompData({ ...newCompData, processor: e.target.value })}
                    className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">RAM</label>
                  <input
                    type="text"
                    value={newCompData.ram}
                    onChange={(e) => setNewCompData({ ...newCompData, ram: e.target.value })}
                    className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Stockage</label>
                  <input
                    type="text"
                    value={newCompData.storage}
                    onChange={(e) => setNewCompData({ ...newCompData, storage: e.target.value })}
                    className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Prix d'achat unitaire (€)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Ex: 1200"
                  value={newCompData.price}
                  onChange={(e) => setNewCompData({ ...newCompData, price: Number(e.target.value) || 0 })}
                  className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl font-mono text-[#1B4591]"
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
                  Enregistrer l'ordinateur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      <AssignModal
        isOpen={assignModal.isOpen}
        onClose={() => setAssignModal((prev) => ({ ...prev, isOpen: false }))}
        itemType="PC"
        itemId={assignModal.pcId}
        itemLabel={assignModal.label}
        serialNumber={assignModal.sn}
      />

      {/* Excel Table Modal */}
      <ExcelTableModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        initialTab="PCS"
      />
    </div>
  );
}
