'use client';

import React, { useState } from 'react';
import {
  KeyRound,
  Plus,
  Calendar,
  DollarSign,
  UserPlus,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react';
import { useInventory } from '@/lib/store';
import { SoftwareLicense } from '@/lib/types';

const TITLE_PAGE_STYLE = {
  fontFamily: "'Inter', system-ui, sans-serif",
  color: '#1B4591',
  fontSize: '31px',
  lineHeight: '37.2px',
  fontWeight: 600,
  letterSpacing: 0,
};

export default function LicensesPage() {
  const {
    licenses,
    employees,
    assignLicenseSeat,
    revokeLicenseSeat,
    addLicense,
    deleteLicense,
    getEmployeeById,
  } = useInventory();

  const [visibleKeys, setVisibleKeys] = useState<{ [id: string]: boolean }>({});

  // Modal to assign a license to employee
  const [seatModal, setSeatModal] = useState<{
    isOpen: boolean;
    license: SoftwareLicense | null;
  }>({
    isOpen: false,
    license: null,
  });
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');

  // Modal to add a license
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLic, setNewLic] = useState({
    name: '',
    vendor: 'Microsoft',
    licenseKey: '',
    type: 'ABONNEMENT' as 'ABONNEMENT' | 'PERPETUELLE',
    totalSeats: 10,
    expirationDate: '2025-12-31',
    costPerYear: 2400,
    assignedEmployeeIds: [] as string[],
  });

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSeatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seatModal.license || !selectedEmpId) return;

    assignLicenseSeat(seatModal.license.id, selectedEmpId);
    setSeatModal({ isOpen: false, license: null });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLic.name.trim() || !newLic.licenseKey.trim()) return;

    addLicense(newLic);
    setIsAddModalOpen(false);
    setNewLic({
      name: '',
      vendor: 'Microsoft',
      licenseKey: '',
      type: 'ABONNEMENT',
      totalSeats: 10,
      expirationDate: '2025-12-31',
      costPerYear: 2400,
      assignedEmployeeIds: [],
    });
  };

  return (
    <div className="space-y-6 text-[#263248] dark:text-foreground">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-semibold" style={TITLE_PAGE_STYLE}>
            Licences & Abonnements IT
          </h1>
          <p className="text-sm text-[#6D7A91] mt-1">
            Supervision des clés d'activation logicielles, sièges alloués et échéances contractuelles
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#1B4591] text-white hover:bg-[#153875] transition-all shadow-md shadow-[#1B4591]/20 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une licence</span>
        </button>
      </div>

      {/* ── Grid of Licenses ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {licenses.map((lic) => {
          const isKeyVisible = visibleKeys[lic.id];
          const percentUsed = Math.round((lic.usedSeats / lic.totalSeats) * 100);
          const isFull = lic.usedSeats >= lic.totalSeats;

          const expDate = new Date(lic.expirationDate);
          const now = new Date();
          const daysRemaining = Math.ceil(
            (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
          const isExpiringSoon = daysRemaining <= 60;

          return (
            <div
              key={lic.id}
              className="p-5 rounded-2xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm flex flex-col justify-between hover:border-[#1B4591]/40 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-[#1B4591]/10 text-[#1B4591] border border-[#1B4591]/20">
                      {lic.vendor} · {lic.type}
                    </span>
                    <h3 className="font-bold text-[#2B313B] dark:text-foreground text-base mt-2">
                      {lic.name}
                    </h3>
                  </div>

                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                    style={
                      isExpiringSoon
                        ? { background: '#FFF3E0', color: '#F59E0B', border: '1px solid #FDD68A' }
                        : { background: '#E6F7F1', color: '#10B981', border: '1px solid #A7F3D0' }
                    }
                  >
                    {daysRemaining > 0 ? `Échéance : ${daysRemaining} j` : 'Expiré'}
                  </span>
                </div>

                {/* Key reveal bar */}
                <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-muted/60 border border-slate-200/80 dark:border-border flex items-center justify-between text-xs font-mono my-3">
                  <span className="text-[#2B313B] dark:text-foreground select-all font-semibold">
                    {isKeyVisible ? lic.licenseKey : '••••••••-••••-••••-••••'}
                  </span>
                  <button
                    onClick={() => toggleKeyVisibility(lic.id)}
                    className="p-1 rounded text-[#6D7A91] hover:text-[#1B4591]"
                    title={isKeyVisible ? 'Masquer la clé' : 'Afficher la clé'}
                  >
                    {isKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Seat usage */}
                <div className="space-y-1.5 my-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6D7A91]">Sièges attribués :</span>
                    <span className="font-bold text-[#2B313B] dark:text-foreground">
                      {lic.usedSeats} / {lic.totalSeats} ({percentUsed}%)
                    </span>
                  </div>

                  <div className="h-2.5 w-full bg-[#E2E8F0] dark:bg-muted rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, percentUsed)}%` }}
                      className={`h-full transition-all rounded-full ${
                        isFull ? 'bg-[#F59E0B]' : 'bg-[#1B4591]'
                      }`}
                    />
                  </div>
                </div>

                {/* Meta Info */}
                <div className="grid grid-cols-2 gap-2 text-xs text-[#6D7A91] pt-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#1B4591]" />
                    <span>Expire le {lic.expirationDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Coût : {lic.costPerYear.toLocaleString()} € / an</span>
                  </div>
                </div>

                {/* Assigned Users List */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-border">
                  <span className="text-[10px] uppercase font-bold text-[#6D7A91] block mb-2">
                    Collaborateurs disposant d'un compte ({lic.assignedEmployeeIds.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {lic.assignedEmployeeIds.map((empId) => {
                      const emp = getEmployeeById(empId);
                      if (!emp) return null;
                      return (
                        <div
                          key={emp.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F8FAFC] dark:bg-muted text-[11px] font-medium text-[#2B313B] dark:text-foreground border border-slate-200/80 dark:border-border"
                        >
                          <span>
                            {emp.firstName} {emp.lastName}
                          </span>
                          <button
                            onClick={() => revokeLicenseSeat(lic.id, emp.id)}
                            title="Révoquer ce siège"
                            className="text-[#6D7A91] hover:text-red-500 ml-1 font-bold"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}

                    {lic.assignedEmployeeIds.length === 0 && (
                      <span className="text-xs text-[#6D7A91] italic">
                        Aucun utilisateur assigné pour le moment.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-border flex items-center justify-between">
                <button
                  onClick={() => {
                    if (confirm(`Supprimer le contrat ${lic.name} ?`)) {
                      deleteLicense(lic.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-[#6D7A91] hover:text-red-500 hover:bg-red-50 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <button
                  disabled={isFull}
                  onClick={() => setSeatModal({ isOpen: true, license: lic })}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#1B4591] text-white hover:bg-[#153875] disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Attribuer un siège</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Seat Allocation Modal */}
      {seatModal.isOpen && seatModal.license && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-2xl border border-border shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-[#1B4591] dark:text-primary text-lg mb-1">
              Affecter une licence logicielle
            </h3>
            <p className="text-xs text-[#6D7A91] mb-4">
              Logiciel : <strong>{seatModal.license.name}</strong>
            </p>

            <form onSubmit={handleSeatSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">
                  Sélectionner le collaborateur *
                </label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl"
                  required
                >
                  {employees
                    .filter((e) => !seatModal.license?.assignedEmployeeIds.includes(e.id))
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.department})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-border">
                <button
                  type="button"
                  onClick={() => setSeatModal({ isOpen: false, license: null })}
                  className="px-4 py-2 text-[#6D7A91] hover:bg-slate-50 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1B4591] text-white font-semibold rounded-xl hover:bg-[#153875] shadow-sm"
                >
                  Valider l'affectation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add License Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-2xl border border-border shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-[#1B4591] dark:text-primary text-lg mb-1">
              Enregistrer un nouveau contrat de licence
            </h3>
            <p className="text-xs text-[#6D7A91] mb-4">
              Ajout au portefeuille de logiciels de l'entreprise
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Nom du logiciel *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Microsoft 365 E5, JetBrains..."
                  value={newLic.name}
                  onChange={(e) => setNewLic({ ...newLic, name: e.target.value })}
                  className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Éditeur *</label>
                  <input
                    type="text"
                    required
                    value={newLic.vendor}
                    onChange={(e) => setNewLic({ ...newLic, vendor: e.target.value })}
                    className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Type *</label>
                  <select
                    value={newLic.type}
                    onChange={(e) => setNewLic({ ...newLic, type: e.target.value as any })}
                    className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl"
                  >
                    <option value="ABONNEMENT">Abonnement annuel</option>
                    <option value="PERPETUELLE">Licence perpétuelle</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Clé de licence (Key) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: XXXX-YYYY-ZZZZ-WWWW"
                  value={newLic.licenseKey}
                  onChange={(e) => setNewLic({ ...newLic, licenseKey: e.target.value })}
                  className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Sièges max</label>
                  <input
                    type="number"
                    min={1}
                    value={newLic.totalSeats}
                    onChange={(e) =>
                      setNewLic({ ...newLic, totalSeats: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Coût annuel (€)</label>
                  <input
                    type="number"
                    min={0}
                    value={newLic.costPerYear}
                    onChange={(e) =>
                      setNewLic({ ...newLic, costPerYear: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Échéance</label>
                  <input
                    type="date"
                    value={newLic.expirationDate}
                    onChange={(e) =>
                      setNewLic({ ...newLic, expirationDate: e.target.value })
                    }
                    className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl"
                  />
                </div>
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
                  Enregistrer la licence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
