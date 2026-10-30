'use client';

import React, { useState } from 'react';
import { X, UserCheck, ShieldCheck } from 'lucide-react';
import { useInventory } from '@/lib/store';
import { EquipmentCondition } from '@/lib/types';

interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemType: 'PC' | 'ECRAN';
  itemId: string;
  itemLabel: string;
  serialNumber?: string;
}

export const AssignModal: React.FC<AssignModalProps> = ({
  isOpen,
  onClose,
  itemType,
  itemId,
  itemLabel,
  serialNumber,
}) => {
  const { employees, assignComputer, assignScreen } = useInventory();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employees[0]?.id || '');
  const [condition, setCondition] = useState<EquipmentCondition>('BON_ETAT');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) return;

    if (itemType === 'PC') {
      assignComputer(itemId, selectedEmployeeId, condition, notes);
    } else {
      assignScreen(itemId, selectedEmployeeId, condition, notes);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-card rounded-2xl border border-border shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-[#263248] dark:text-foreground">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-border flex items-center justify-between bg-[#F8FAFC] dark:bg-muted/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#1B4591] flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#1B4591] dark:text-primary text-sm">
                Affecter un équipement
              </h3>
              <p className="text-xs text-[#6D7A91]">Création de la décharge d'attribution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6D7A91] hover:text-[#263248] hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Item details */}
          <div className="p-3.5 bg-[#EFF6FF] dark:bg-muted/40 rounded-xl border border-[#BFDBFE] dark:border-border text-xs space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-[#1B4591] dark:text-primary font-bold">
              Équipement sélectionné
            </span>
            <p className="font-bold text-[#1B4591] dark:text-foreground text-sm">{itemLabel}</p>
            {serialNumber && (
              <p className="font-mono text-[#6D7A91] text-[11px]">N° Série : {serialNumber}</p>
            )}
          </div>

          {/* Employee selector */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-[#263248] dark:text-foreground">
              Sélectionner le collaborateur *
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4591]/40"
              required
            >
              <option value="" disabled>
                -- Choisir un employé --
              </option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.matricule} - {emp.department})
                </option>
              ))}
            </select>
          </div>

          {/* Condition selector */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-[#263248] dark:text-foreground">
              État de l'équipement lors de la remise *
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as EquipmentCondition)}
              className="w-full px-3 py-2.5 text-xs bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4591]/40"
            >
              <option value="NEUF">Neuf (Sortie de carton)</option>
              <option value="EXCELLENT">Excellent état (Sans trace)</option>
              <option value="BON_ETAT">Bon état d'usage</option>
              <option value="USAGE">Usagé (Traces normales)</option>
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-[#263248] dark:text-foreground">
              Observations / Motif d'attribution
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Prêt de poste pour intégration CDI, chargeur fourni..."
              className="w-full px-3 py-2.5 text-xs bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4591]/40 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-[#6D7A91] hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#1B4591] text-white hover:bg-[#153875] transition-all shadow-md shadow-[#1B4591]/20 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Valider l'affectation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
