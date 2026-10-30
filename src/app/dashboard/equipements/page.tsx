'use client';

import React, { useState } from 'react';
import {
  Coffee,
  Printer,
  Tv,
  Sparkles,
  Plus,
  Search,
  Download,
  Wrench,
  RotateCcw,
  Trash2,
  Filter,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  User,
  Calendar,
  X,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
} from 'lucide-react';
import { useInventory } from '@/lib/store';
import { GeneralEquipment, GeneralEquipmentCategory, EquipmentStatus } from '@/lib/types';

const TITLE_PAGE_STYLE = {
  fontFamily: "'Inter', system-ui, sans-serif",
  color: '#1B4591',
  fontSize: '31px',
  lineHeight: '37.2px',
  fontWeight: 600,
  letterSpacing: 0,
};

const CATEGORY_META: Record<
  GeneralEquipmentCategory,
  { label: string; icon: any; color: string; bg: string; border: string }
> = {
  ELECTROMENAGER: {
    label: 'Électroménager & Pause',
    icon: Coffee,
    color: '#D97706',
    bg: '#FEF3C7',
    border: '#FDE68A',
  },
  BUREAUTIQUE: {
    label: 'Bureautique & Impression',
    icon: Printer,
    color: '#1B4591',
    bg: '#EFF6FF',
    border: '#BFDBFE',
  },
  AUDIOVISUEL: {
    label: 'Audiovisuel & Visio',
    icon: Tv,
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
  },
  CONFORT: {
    label: 'Confort & Sanitaire',
    icon: Sparkles,
    color: '#0D9488',
    bg: '#F0FDFA',
    border: '#99F6E4',
  },
  MOBILIER: {
    label: 'Mobilier & Agencement',
    icon: Building2,
    color: '#059669',
    bg: '#ECFDF5',
    border: '#A7F3D0',
  },
  AUTRE: {
    label: 'Autre équipement',
    icon: Sparkles,
    color: '#475569',
    bg: '#F1F5F9',
    border: '#CBD5E1',
  },
};

export default function EquipementsPage() {
  const {
    generalEquipments,
    employees,
    addGeneralEquipment,
    updateGeneralEquipmentStatus,
    updateGeneralEquipmentField,
    deleteGeneralEquipment,
  } = useInventory();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modal Add Equipment
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEqData, setNewEqData] = useState<Omit<GeneralEquipment, 'id'>>({
    tag: `EQ-0${generalEquipments.length + 1}`,
    name: '',
    category: 'ELECTROMENAGER',
    brand: '',
    model: '',
    serialNumber: '',
    location: 'Cuisine / Espace Pause',
    status: 'DISPONIBLE',
    purchaseDate: new Date().toISOString().split('T')[0],
    warrantyUntil: '2026-12-31',
    assignedResponsible: employees[0] ? `${employees[0].firstName} ${employees[0].lastName}` : 'Marwa Wartateni',
    maintenanceNotes: '',
    cost: 250,
  });

  // Modal Maintenance Note
  const [maintenanceModal, setMaintenanceModal] = useState<{
    isOpen: boolean;
    equipment: GeneralEquipment | null;
    notes: string;
  }>({
    isOpen: false,
    equipment: null,
    notes: '',
  });

  // Quick Preset Templates for adding common office objects
  const applyPreset = (preset: {
    name: string;
    category: GeneralEquipmentCategory;
    brand: string;
    model: string;
    location: string;
    cost: number;
    notes: string;
  }) => {
    setNewEqData((prev) => ({
      ...prev,
      name: preset.name,
      category: preset.category,
      brand: preset.brand,
      model: preset.model,
      location: preset.location,
      cost: preset.cost,
      maintenanceNotes: preset.notes,
    }));
  };

  const filteredEquipments = generalEquipments.filter((eq) => {
    const query = search.toLowerCase();
    const matchesSearch =
      eq.name.toLowerCase().includes(query) ||
      eq.tag.toLowerCase().includes(query) ||
      eq.brand.toLowerCase().includes(query) ||
      eq.model.toLowerCase().includes(query) ||
      eq.location.toLowerCase().includes(query) ||
      (eq.assignedResponsible && eq.assignedResponsible.toLowerCase().includes(query)) ||
      (eq.serialNumber && eq.serialNumber.toLowerCase().includes(query));

    const matchesCategory = selectedCategory === 'ALL' || eq.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || eq.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Stats calculation
  const totalEquipments = generalEquipments.length;
  const inServiceCount = generalEquipments.filter((e) => e.status === 'DISPONIBLE' || e.status === 'AFFECTE').length;
  const inRepairCount = generalEquipments.filter((e) => e.status === 'EN_REPARATION').length;
  const coffeeAndFoodCount = generalEquipments.filter((e) => e.category === 'ELECTROMENAGER').length;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEqData.name.trim()) {
      alert('Veuillez renseigner le nom de l\'équipement.');
      return;
    }

    addGeneralEquipment(newEqData);
    setIsAddModalOpen(false);
    setNewEqData({
      tag: `EQ-0${generalEquipments.length + 2}`,
      name: '',
      category: 'ELECTROMENAGER',
      brand: '',
      model: '',
      serialNumber: '',
      location: 'Cuisine / Espace Pause',
      status: 'DISPONIBLE',
      purchaseDate: new Date().toISOString().split('T')[0],
      warrantyUntil: '2026-12-31',
      assignedResponsible: employees[0] ? `${employees[0].firstName} ${employees[0].lastName}` : 'Marwa Wartateni',
      maintenanceNotes: '',
      cost: 250,
    });
  };

  const handleExportCsv = () => {
    const headers = [
      'Tag',
      'Nom',
      'Categorie',
      'Marque',
      'Modele',
      'Numero_Serie',
      'Emplacement',
      'Statut',
      'Responsable',
      'Cout_EUR',
      'Notes_Maintenance',
    ];

    const rows = generalEquipments.map((eq) => [
      `"${eq.tag}"`,
      `"${eq.name}"`,
      `"${eq.category}"`,
      `"${eq.brand}"`,
      `"${eq.model}"`,
      `"${eq.serialNumber || 'N/A'}"`,
      `"${eq.location}"`,
      `"${eq.status}"`,
      `"${eq.assignedResponsible || 'Non désigné'}"`,
      `"${eq.cost || 0}"`,
      `"${(eq.maintenanceNotes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Inventaire_Autres_Equipements_EcoPilot_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header Section ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 style={TITLE_PAGE_STYLE}>Autres Équipements & Locaux</h1>
          <p className="text-sm text-[#6D7A91] dark:text-muted-foreground mt-0.5">
            Suivi des machines à café, électroménager, imprimantes, vidéoprojecteurs et confort des espaces de travail
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-border bg-white dark:bg-card text-xs font-semibold text-[#263248] dark:text-foreground hover:bg-slate-50 flex items-center gap-2 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-[#1B4591]" />
            <span>Exporter CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#1B4591] hover:bg-[#153875] text-xs font-semibold text-white flex items-center gap-2 shadow-sm transition-all shadow-[#1B4591]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un équipement</span>
          </button>
        </div>
      </div>

      {/* ── Corporate Double Ellipse Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 dark:border-border bg-white dark:bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#6D7A91]">Total Équipements</p>
              <h3 className="text-2xl font-bold text-[#1B4591] dark:text-foreground mt-1">
                {totalEquipments}
              </h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">Parc étendu répertorié</p>
            </div>
            <div className="relative flex h-14 w-14 items-center justify-center">
              <div className="absolute inset-0 rounded-full" style={{ background: '#EBF3FE' }} />
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full" style={{ background: '#D2E3FC' }}>
                <Coffee className="h-5 w-5 text-[#1B4591]" />
              </div>
            </div>
          </div>
        </div>

        {/* En Service */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 dark:border-border bg-white dark:bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#6D7A91]">Opérationnels / En place</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{inServiceCount}</h3>
              <p className="text-[11px] text-[#6D7A91] mt-1">100% fonctionnels</p>
            </div>
            <div className="relative flex h-14 w-14 items-center justify-center">
              <div className="absolute inset-0 rounded-full" style={{ background: '#E6F8EF' }} />
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full" style={{ background: '#C2EED7' }}>
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Électroménager & Pause */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 dark:border-border bg-white dark:bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#6D7A91]">Machines Café & Cuisine</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">{coffeeAndFoodCount}</h3>
              <p className="text-[11px] text-[#6D7A91] mt-1">Grains, capsules, frigo, MO</p>
            </div>
            <div className="relative flex h-14 w-14 items-center justify-center">
              <div className="absolute inset-0 rounded-full" style={{ background: '#FEF3C7' }} />
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full" style={{ background: '#FDE68A' }}>
                <Coffee className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 dark:border-border bg-white dark:bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#6D7A91]">En Maintenance / Entretien</p>
              <h3 className="text-2xl font-bold text-rose-600 mt-1">{inRepairCount}</h3>
              <p className="text-[11px] text-[#6D7A91] mt-1">Détartrage ou révision</p>
            </div>
            <div className="relative flex h-14 w-14 items-center justify-center">
              <div className="absolute inset-0 rounded-full" style={{ background: '#FEE2E2' }} />
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full" style={{ background: '#FECACA' }}>
                <Wrench className="h-5 w-5 text-rose-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Search and Filter Bar ── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6D7A91]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher machine à café, imprimante, tag, lieu, responsable..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-muted/50 border border-slate-200 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4591]/30 text-[#263248] dark:text-foreground"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Select */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-muted/40 p-1 rounded-xl border border-slate-200/80 dark:border-border">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-white dark:bg-card text-[#1B4591] shadow-sm'
                  : 'text-[#6D7A91] hover:text-[#263248]'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setSelectedCategory('ELECTROMENAGER')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
                selectedCategory === 'ELECTROMENAGER'
                  ? 'bg-white dark:bg-card text-amber-600 shadow-sm'
                  : 'text-[#6D7A91] hover:text-[#263248]'
              }`}
            >
              <Coffee className="w-3 h-3" />
              <span>Café & Cuisine</span>
            </button>
            <button
              onClick={() => setSelectedCategory('BUREAUTIQUE')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
                selectedCategory === 'BUREAUTIQUE'
                  ? 'bg-white dark:bg-card text-[#1B4591] shadow-sm'
                  : 'text-[#6D7A91] hover:text-[#263248]'
              }`}
            >
              <Printer className="w-3 h-3" />
              <span>Impression</span>
            </button>
            <button
              onClick={() => setSelectedCategory('AUDIOVISUEL')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
                selectedCategory === 'AUDIOVISUEL'
                  ? 'bg-white dark:bg-card text-purple-600 shadow-sm'
                  : 'text-[#6D7A91] hover:text-[#263248]'
              }`}
            >
              <Tv className="w-3 h-3" />
              <span>Visio & Réunion</span>
            </button>
          </div>

          {/* Status Select */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium bg-slate-50 dark:bg-muted/40 border border-slate-200 dark:border-border rounded-xl text-[#263248] dark:text-foreground focus:outline-none"
          >
            <option value="ALL">Tous statuts</option>
            <option value="DISPONIBLE">Opérationnel / En service</option>
            <option value="EN_REPARATION">En Maintenance</option>
            <option value="REBUT">Déclassé / Rebut</option>
          </select>
        </div>
      </div>

      {/* ── Equipment Grid / Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEquipments.map((eq) => {
          const meta = CATEGORY_META[eq.category] || CATEGORY_META.AUTRE;
          const CategoryIcon = meta.icon;

          return (
            <div
              key={eq.id}
              className="rounded-2xl border border-slate-200/80 dark:border-border bg-white dark:bg-card p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header Card: Category Badge + Status Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                    style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
                  >
                    <CategoryIcon className="w-3 h-3" />
                    <span>{meta.label}</span>
                  </span>

                  {eq.status === 'EN_REPARATION' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                      <Wrench className="w-3 h-3" />
                      Maintenance
                    </span>
                  ) : eq.status === 'REBUT' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      Déclassé
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      En service
                    </span>
                  )}
                </div>

                {/* Name & Tag */}
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-bold text-sm text-[#263248] dark:text-foreground line-clamp-1">
                      {eq.name}
                    </h3>
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-muted text-[#1B4591] dark:text-primary shrink-0">
                      {eq.tag}
                    </span>
                  </div>
                  <p className="text-xs text-[#6D7A91] mt-0.5 font-medium">
                    {eq.brand} • {eq.model}
                  </p>
                </div>

                {/* Details list */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-border text-xs text-[#263248] dark:text-foreground">
                  <div className="flex items-center gap-2 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-[#1B4591] shrink-0" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Emplacement :</span>
                    <span className="text-[#6D7A91] truncate">{eq.location}</span>
                  </div>

                  {eq.assignedResponsible && (
                    <div className="flex items-center gap-2 text-xs">
                      <User className="w-3.5 h-3.5 text-[#1B4591] shrink-0" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Référent :</span>
                      <span className="text-[#6D7A91] truncate">{eq.assignedResponsible}</span>
                    </div>
                  )}

                  {eq.serialNumber && (
                    <div className="flex items-center gap-2 text-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#6D7A91] shrink-0" />
                      <span className="text-[#6D7A91]">N° Série :</span>
                      <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {eq.serialNumber}
                      </span>
                    </div>
                  )}

                  {eq.maintenanceNotes && (
                    <div className="mt-2 p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 text-[11px] text-amber-900 dark:text-amber-200">
                      <span className="font-semibold">Entretien : </span>
                      {eq.maintenanceNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions Toolbar */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-border flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {eq.status === 'EN_REPARATION' ? (
                    <button
                      onClick={() => updateGeneralEquipmentStatus(eq.id, 'DISPONIBLE', 'Remise en service après révision')}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1 transition-all"
                      title="Remettre en service"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Remettre en service</span>
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        setMaintenanceModal({
                          isOpen: true,
                          equipment: eq,
                          notes: eq.maintenanceNotes || '',
                        })
                      }
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-muted text-[#6D7A91] hover:text-[#1B4591] hover:bg-blue-50 flex items-center gap-1 transition-all"
                      title="Mettre en maintenance ou détartrage"
                    >
                      <Wrench className="w-3 h-3" />
                      <span>Maintenance</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      if (confirm(`Confirmez-vous la suppression de "${eq.name}" ?`)) {
                        deleteGeneralEquipment(eq.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                    title="Supprimer l'équipement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEquipments.length === 0 && (
        <div className="text-center py-12 rounded-2xl bg-white dark:bg-card border border-slate-200/80 dark:border-border p-8">
          <Coffee className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-[#263248] dark:text-foreground text-sm">
            Aucun équipement trouvé
          </h4>
          <p className="text-xs text-[#6D7A91] mt-1">
            Essayez de modifier votre recherche ou ajoutez un nouvel équipement.
          </p>
        </div>
      )}

      {/* ── Modal: Ajouter un équipement ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-border flex items-center justify-between bg-[#F8FAFC] dark:bg-muted/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#1B4591] flex items-center justify-center font-bold">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1B4591] dark:text-primary text-sm">
                    Nouvel Équipement / Mobilier
                  </h3>
                  <p className="text-xs text-[#6D7A91]">Machines à café, électroménager, imprimantes, visio</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-[#6D7A91] hover:text-[#263248] hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick preset buttons */}
            <div className="px-6 pt-4 pb-2 bg-slate-50/60 dark:bg-muted/20 border-b border-slate-100 dark:border-border">
              <p className="text-[11px] font-semibold text-[#6D7A91] uppercase tracking-wider mb-2">
                Modèles rapides en 1 clic :
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    applyPreset({
                      name: "Machine à café à grains De'Longhi Magnifica",
                      category: 'ELECTROMENAGER',
                      brand: "De'Longhi",
                      model: 'Magnifica S ECAM',
                      location: 'Cuisine / Pause',
                      cost: 380,
                      notes: 'Détartrage mensuel',
                    })
                  }
                  className="px-2.5 py-1 text-xs rounded-lg border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 flex items-center gap-1 font-medium transition-all"
                >
                  <Coffee className="w-3 h-3" />
                  <span>Machine Café Grains</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    applyPreset({
                      name: 'Imprimante Réseau Multifonction Canon',
                      category: 'BUREAUTIQUE',
                      brand: 'Canon',
                      model: 'imageRUNNER C3826i',
                      location: 'Couloir Étage 1',
                      cost: 2200,
                      notes: 'Contrat Canon Pro',
                    })
                  }
                  className="px-2.5 py-1 text-xs rounded-lg border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 flex items-center gap-1 font-medium transition-all"
                >
                  <Printer className="w-3 h-3" />
                  <span>Imprimante Multifonction</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    applyPreset({
                      name: 'Vidéoprojecteur Laser 4K Réunion',
                      category: 'AUDIOVISUEL',
                      brand: 'Epson',
                      model: 'EB-L730U',
                      location: 'Salle Réunion Principale',
                      cost: 1850,
                      notes: 'HDMI + AirPlay',
                    })
                  }
                  className="px-2.5 py-1 text-xs rounded-lg border border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100 flex items-center gap-1 font-medium transition-all"
                >
                  <Tv className="w-3 h-3" />
                  <span>Vidéoprojecteur</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    applyPreset({
                      name: 'Fontaine à eau filtrante & gazeuse',
                      category: 'CONFORT',
                      brand: 'Culligan',
                      model: 'PureConnect 2.0',
                      location: 'Espace Accueil',
                      cost: 1100,
                      notes: 'Remplacement filtres semestriel',
                    })
                  }
                  className="px-2.5 py-1 text-xs rounded-lg border border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100 flex items-center gap-1 font-medium transition-all"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Fontaine à Eau</span>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#263248] dark:text-foreground mb-1">
                    Tag / Identifiant *
                  </label>
                  <input
                    type="text"
                    required
                    value={newEqData.tag}
                    onChange={(e) => setNewEqData({ ...newEqData, tag: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-muted/50 border border-slate-200 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4591]/30 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#263248] dark:text-foreground mb-1">
                    Catégorie *
                  </label>
                  <select
                    value={newEqData.category}
                    onChange={(e) =>
                      setNewEqData({
                        ...newEqData,
                        category: e.target.value as GeneralEquipmentCategory,
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-muted/50 border border-slate-200 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4591]/30"
                  >
                    <option value="ELECTROMENAGER">☕ Électroménager & Café</option>
                    <option value="BUREAUTIQUE">🖨️ Bureautique & Impression</option>
                    <option value="AUDIOVISUEL">📺 Audiovisuel & Visio</option>
                    <option value="CONFORT">✨ Confort & Sanitaire</option>
                    <option value="MOBILIER">🪑 Mobilier & Agencement</option>
                    <option value="AUTRE">📦 Autre Équipement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#263248] dark:text-foreground mb-1">
                  Nom de l'équipement *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Machine à café De'Longhi Magnifica S"
                  value={newEqData.name}
                  onChange={(e) => setNewEqData({ ...newEqData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-muted/50 border border-slate-200 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4591]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#263248] dark:text-foreground mb-1">
                    Marque
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : De'Longhi, Canon, Bosch..."
                    value={newEqData.brand}
                    onChange={(e) => setNewEqData({ ...newEqData, brand: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-muted/50 border border-slate-200 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4591]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#263248] dark:text-foreground mb-1">
                    Modèle
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : Magnifica S, C3826i..."
                    value={newEqData.model}
                    onChange={(e) => setNewEqData({ ...newEqData, model: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-muted/50 border border-slate-200 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4591]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#263248] dark:text-foreground mb-1">
                    Emplacement / Salle *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : Cuisine RDC, Salle Réunion A..."
                    value={newEqData.location}
                    onChange={(e) => setNewEqData({ ...newEqData, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-muted/50 border border-slate-200 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4591]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#263248] dark:text-foreground mb-1">
                    Responsable / Référent
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : Marwa Wartateni"
                    value={newEqData.assignedResponsible || ''}
                    onChange={(e) =>
                      setNewEqData({ ...newEqData, assignedResponsible: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-muted/50 border border-slate-200 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4591]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#263248] dark:text-foreground mb-1">
                    N° de Série (Optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : SN-8849-2023"
                    value={newEqData.serialNumber || ''}
                    onChange={(e) => setNewEqData({ ...newEqData, serialNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-muted/50 border border-slate-200 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4591]/30 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#263248] dark:text-foreground mb-1">
                    Coût d'acquisition (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newEqData.cost || 0}
                    onChange={(e) =>
                      setNewEqData({ ...newEqData, cost: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-muted/50 border border-slate-200 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4591]/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#263248] dark:text-foreground mb-1">
                  Consignes d'entretien / Maintenance
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex : Détartrage tous les mois, changement filtre Culligan..."
                  value={newEqData.maintenanceNotes || ''}
                  onChange={(e) =>
                    setNewEqData({ ...newEqData, maintenanceNotes: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-muted/50 border border-slate-200 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4591]/30"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-border flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-border text-xs font-semibold text-[#6D7A91] hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1B4591] text-xs font-semibold text-white hover:bg-[#153875] shadow-sm transition-all shadow-[#1B4591]/20"
                >
                  Enregistrer l'équipement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Maintenance Note ── */}
      {maintenanceModal.isOpen && maintenanceModal.equipment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-border flex items-center justify-between bg-amber-50/50 dark:bg-amber-950/20">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-[#263248] dark:text-foreground">
                  Passer en maintenance
                </h3>
              </div>
              <button
                onClick={() => setMaintenanceModal({ isOpen: false, equipment: null, notes: '' })}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-[#6D7A91]">
                Équipement sélectionné :{' '}
                <strong className="text-[#263248] dark:text-foreground">
                  {maintenanceModal.equipment.name} ({maintenanceModal.equipment.tag})
                </strong>
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#263248] dark:text-foreground mb-1">
                  Motif de l'intervention / Notes :
                </label>
                <textarea
                  rows={3}
                  value={maintenanceModal.notes}
                  onChange={(e) =>
                    setMaintenanceModal({ ...maintenanceModal, notes: e.target.value })
                  }
                  placeholder="Ex : Voyant détartrage allumé, panne buse vapeur, révision semestrielle..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-muted/50 border border-slate-200 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setMaintenanceModal({ isOpen: false, equipment: null, notes: '' })
                  }
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#6D7A91]"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateGeneralEquipmentStatus(
                      maintenanceModal.equipment!.id,
                      'EN_REPARATION',
                      maintenanceModal.notes || 'Entretien / Réparation programmée'
                    );
                    updateGeneralEquipmentField(
                      maintenanceModal.equipment!.id,
                      'maintenanceNotes',
                      maintenanceModal.notes
                    );
                    setMaintenanceModal({ isOpen: false, equipment: null, notes: '' });
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-600 text-xs font-semibold text-white hover:bg-amber-700 shadow-sm"
                >
                  Confirmer la maintenance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
