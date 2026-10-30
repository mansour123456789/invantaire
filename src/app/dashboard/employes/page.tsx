'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  FileText,
  Laptop,
  Monitor,
  KeyRound,
  Trash2,
  Mail,
  Phone,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { useInventory } from '@/lib/store';
import { Employee } from '@/lib/types';
import { DechargeModal } from '@/components/inventaire/DechargeModal';
import { ExcelTableModal } from '@/components/inventaire/ExcelTableModal';

const TITLE_PAGE_STYLE = {
  fontFamily: "'Inter', system-ui, sans-serif",
  color: '#1B4591',
  fontSize: '31px',
  lineHeight: '37.2px',
  fontWeight: 600,
  letterSpacing: 0,
};

export default function EmployeesPage() {
  const { employees, getEquipmentForEmployee, addEmployee, deleteEmployee } = useInventory();
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // Decharge Modal
  const [dechargeEmployee, setDechargeEmployee] = useState<Employee | null>(null);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // Add Employee Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmp, setNewEmp] = useState({
    matricule: `EMP-0${100 + employees.length + 1}`,
    firstName: '',
    lastName: '',
    email: '',
    phone: '+33 6 ',
    department: 'Développement IT',
    roleTitle: '',
    arrivalDate: new Date().toISOString().split('T')[0],
  });

  const departments = Array.from(new Set(employees.map((e) => e.department)));

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.firstName.toLowerCase().includes(search.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(search.toLowerCase()) ||
      emp.matricule.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());

    const matchesDept = departmentFilter === 'ALL' || emp.department === departmentFilter;

    return matchesSearch && matchesDept;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.firstName.trim() || !newEmp.lastName.trim() || !newEmp.email.trim()) return;

    addEmployee(newEmp);
    setIsAddModalOpen(false);
    setNewEmp({
      matricule: `EMP-0${100 + employees.length + 2}`,
      firstName: '',
      lastName: '',
      email: '',
      phone: '+33 6 ',
      department: 'Développement IT',
      roleTitle: '',
      arrivalDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleExportCsv = () => {
    const headers = ['Matricule', 'Nom', 'Prenom', 'Email', 'Departement', 'Poste', 'PC_Assigne', 'Ecrans_Assignes'];
    const rows = employees.map((emp) => {
      const eq = getEquipmentForEmployee(emp.id);
      const pcStr = eq.computers.map((c) => `${c.brand} ${c.model} (${c.tag})`).join(' / ') || 'Aucun';
      const screenStr = eq.screens.map((s) => `${s.brand} (${s.tag})`).join(' / ') || 'Aucun';
      return [
        `"${emp.matricule}"`,
        `"${emp.lastName}"`,
        `"${emp.firstName}"`,
        `"${emp.email}"`,
        `"${emp.department}"`,
        `"${emp.roleTitle}"`,
        `"${pcStr}"`,
        `"${screenStr}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Collaborateurs_EcoPilot_Export_${new Date().toISOString().split('T')[0]}.csv`);
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
            Collaborateurs & Affectations ({employees.length})
          </h1>
          <p className="text-sm text-[#6D7A91] mt-1">
            Dotation matérielle individuelle, annuaire d'entreprise et génération de bons de décharge
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setIsExcelModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#107C41] text-white hover:bg-[#0E6B37] font-semibold text-xs shadow-md shadow-[#107C41]/20 flex items-center gap-2 transition-all"
            title="Ouvrir la grille Excel interactive pour modifier les collaborateurs et matériels"
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
            <span>Nouveau collaborateur</span>
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
            placeholder="Rechercher par nom, matricule, email..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#F8FAFC] dark:bg-muted/50 border border-slate-200/80 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4591]/40 text-[#263248] dark:text-foreground"
          />
        </div>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-white dark:bg-muted border border-slate-200 dark:border-border rounded-xl text-[#263248] dark:text-foreground focus:outline-none"
        >
          <option value="ALL">Tous les départements ({employees.length})</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* ── Grid of Employees Cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredEmployees.map((emp) => {
          const { computers, screens, licenses } = getEquipmentForEmployee(emp.id);

          return (
            <div
              key={emp.id}
              className="p-5 rounded-2xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm flex flex-col justify-between hover:border-[#1B4591]/40 transition-all"
            >
              <div>
                {/* Employee Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#1B4591] text-white font-bold flex items-center justify-center text-sm shadow-md shadow-[#1B4591]/25">
                      {emp.firstName.slice(0, 1)}
                      {emp.lastName.slice(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-[#2B313B] dark:text-foreground text-base">
                          {emp.firstName} {emp.lastName}
                        </h3>
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1B4591] border border-[#BFDBFE]">
                          {emp.matricule}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#1B4591] dark:text-primary mt-0.5">
                        {emp.roleTitle}
                      </p>
                      <p className="text-[11px] text-[#6D7A91]">{emp.department}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setDechargeEmployee(emp)}
                    className="px-3 py-1.5 rounded-xl bg-[#EFF6FF] text-[#1B4591] hover:bg-[#DBEAFE] font-semibold text-xs border border-[#BFDBFE] flex items-center gap-1.5 transition-colors shadow-sm"
                    title="Générer la décharge signée"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Décharge signée</span>
                  </button>
                </div>

                {/* Contact info pills */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#6D7A91] p-3 rounded-xl bg-[#F8FAFC] dark:bg-muted/40 border border-slate-100 dark:border-border/60 mb-4">
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-[#1B4591] flex-shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Phone className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" />
                    <span>{emp.phone}</span>
                  </div>
                </div>

                {/* Assets Bundle Overview */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#6D7A91] tracking-wider block">
                    Équipements actuellement confiés :
                  </span>

                  {/* PC */}
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-muted/30 border border-slate-100 dark:border-border/50 text-xs">
                    <Laptop className="w-4 h-4 text-[#1B4591] flex-shrink-0" />
                    {computers.length > 0 ? (
                      <div className="truncate">
                        <strong className="text-[#2B313B] dark:text-foreground">
                          {computers[0].brand} {computers[0].model}
                        </strong>{' '}
                        <span className="font-mono text-[11px] text-[#1B4591] font-semibold">
                          ({computers[0].tag})
                        </span>
                      </div>
                    ) : (
                      <span className="text-[#6D7A91] italic text-[11px]">
                        Aucun ordinateur actuellement affecté
                      </span>
                    )}
                  </div>

                  {/* Screens */}
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-muted/30 border border-slate-100 dark:border-border/50 text-xs">
                    <Monitor className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                    {screens.length > 0 ? (
                      <div className="truncate">
                        <strong className="text-[#2B313B] dark:text-foreground">
                          {screens.map((s) => `${s.brand} (${s.tag})`).join(', ')}
                        </strong>
                      </div>
                    ) : (
                      <span className="text-[#6D7A91] italic text-[11px]">
                        Aucun moniteur externe
                      </span>
                    )}
                  </div>

                  {/* Licenses */}
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-muted/30 border border-slate-100 dark:border-border/50 text-xs">
                    <KeyRound className="w-4 h-4 text-[#9333EA] flex-shrink-0" />
                    {licenses.length > 0 ? (
                      <div className="truncate text-[#2B313B] dark:text-foreground font-medium">
                        {licenses.map((l) => l.name).join(' · ')}
                      </div>
                    ) : (
                      <span className="text-[#6D7A91] italic text-[11px]">
                        Aucune licence nominative
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 mt-4 border-t border-slate-100 dark:border-border flex items-center justify-between text-xs text-[#6D7A91]">
                <span>Date d'arrivée : {emp.arrivalDate}</span>
                <button
                  onClick={() => {
                    if (confirm(`Supprimer la fiche de ${emp.firstName} ${emp.lastName} ?`)) {
                      deleteEmployee(emp.id);
                    }
                  }}
                  className="p-1 rounded text-[#6D7A91] hover:text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-2xl border border-border shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-[#1B4591] dark:text-primary text-lg mb-1">
              Créer une fiche collaborateur
            </h3>
            <p className="text-xs text-[#6D7A91] mb-4">
              Nouveau collaborateur habilité à recevoir des équipements
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Matricule RH *</label>
                  <input
                    type="text"
                    required
                    value={newEmp.matricule}
                    onChange={(e) => setNewEmp({ ...newEmp, matricule: e.target.value })}
                    className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl font-mono text-[#1B4591]"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Date d'arrivée</label>
                  <input
                    type="date"
                    value={newEmp.arrivalDate}
                    onChange={(e) => setNewEmp({ ...newEmp, arrivalDate: e.target.value })}
                    className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={newEmp.firstName}
                    onChange={(e) => setNewEmp({ ...newEmp, firstName: e.target.value })}
                    className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    value={newEmp.lastName}
                    onChange={(e) => setNewEmp({ ...newEmp, lastName: e.target.value })}
                    className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Email d'entreprise *</label>
                <input
                  type="email"
                  required
                  placeholder="nom@ecopilot.fr"
                  value={newEmp.email}
                  onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                  className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Département *</label>
                  <input
                    type="text"
                    required
                    value={newEmp.department}
                    onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                    className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Intitulé du poste *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Chef de Projet"
                    value={newEmp.roleTitle}
                    onChange={(e) => setNewEmp({ ...newEmp, roleTitle: e.target.value })}
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
                  Créer le collaborateur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Decharge Modal */}
      {dechargeEmployee && (
        <DechargeModal
          isOpen={!!dechargeEmployee}
          onClose={() => setDechargeEmployee(null)}
          employee={dechargeEmployee}
        />
      )}

      {/* Excel Table Modal */}
      <ExcelTableModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        initialTab="EMPLOYES"
      />
    </div>
  );
}
