'use client';

import React from 'react';
import { X, Printer, ShieldCheck, FileText, Building2 } from 'lucide-react';
import { useInventory } from '@/lib/store';
import { Employee } from '@/lib/types';

interface DechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
}

export const DechargeModal: React.FC<DechargeModalProps> = ({ isOpen, onClose, employee }) => {
  const { getEquipmentForEmployee, user } = useInventory();

  if (!isOpen) return null;

  const { computers, screens, licenses } = getEquipmentForEmployee(employee.id);
  const dischargeDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Bar (Hidden on print) */}
        <div className="px-6 py-3.5 border-b border-slate-100 dark:border-border flex items-center justify-between bg-[#F8FAFC] dark:bg-muted/40 no-print">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#1B4591]" />
            <span className="text-xs font-semibold text-[#263248] dark:text-foreground">
              Aperçu du Bon de Décharge Matériel IT
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#1B4591] text-white hover:bg-[#153875] flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#6D7A91] hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 bg-white text-gray-900 text-xs space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b pb-4 border-gray-200">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#1B4591] flex items-center justify-center text-white font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-base font-bold text-[#1B4591] tracking-tight">EcoPilot France</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Département des Systèmes d'Information (DSI)</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded bg-[#EFF6FF] text-[#1B4591] font-mono text-[10px] font-bold border border-[#BFDBFE]">
                REF : BON-{employee.matricule}-{new Date().getFullYear()}
              </span>
              <p className="text-[11px] text-gray-500 mt-1">Date d'émission : {dischargeDate}</p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center py-2 bg-gray-50 rounded-xl border border-gray-200">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#1B4591]">
              Bon de Remise & Décharge de Matériel Informatique
            </h2>
          </div>

          {/* Collaborator Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-500">Collaborateur Bénéficiaire :</p>
              <p className="font-bold text-gray-900 text-sm mt-0.5">
                {employee.firstName} {employee.lastName}
              </p>
              <p className="text-gray-600">Matricule : {employee.matricule}</p>
              <p className="text-gray-600">Email : {employee.email}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-500">Affectation Organisationnelle :</p>
              <p className="font-semibold text-gray-900 mt-0.5">Poste : {employee.roleTitle}</p>
              <p className="text-gray-600">Département : {employee.department}</p>
              <p className="text-gray-600">Remis par : {user?.name || 'Administrateur IT'}</p>
            </div>
          </div>

          {/* Assets Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-700">
              1. Liste des équipements confiés à ce jour :
            </h4>
            <table className="w-full border-collapse border border-gray-200 text-left">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-semibold text-[11px]">
                  <th className="border border-gray-200 p-2.5">Catégorie</th>
                  <th className="border border-gray-200 p-2.5">Désignation / Modèle</th>
                  <th className="border border-gray-200 p-2.5">N° Série / Tag</th>
                  <th className="border border-gray-200 p-2.5">État initial</th>
                </tr>
              </thead>
              <tbody>
                {computers.map((c) => (
                  <tr key={c.id} className="border-b border-gray-200">
                    <td className="p-2.5 font-medium">Poste ({c.type})</td>
                    <td className="p-2.5 font-semibold">
                      {c.brand} {c.model} ({c.processor}, {c.ram})
                    </td>
                    <td className="p-2.5 font-mono text-[11px] text-[#1B4591] font-semibold">{c.serialNumber}</td>
                    <td className="p-2.5 text-emerald-700 font-medium">Bon état</td>
                  </tr>
                ))}
                {screens.map((s) => (
                  <tr key={s.id} className="border-b border-gray-200">
                    <td className="p-2.5 font-medium">Moniteur ({s.sizeInch}")</td>
                    <td className="p-2.5 font-semibold">
                      {s.brand} {s.model}
                    </td>
                    <td className="p-2.5 font-mono text-[11px] text-[#1B4591] font-semibold">{s.serialNumber}</td>
                    <td className="p-2.5 text-emerald-700 font-medium">Bon état</td>
                  </tr>
                ))}
                {licenses.map((l) => (
                  <tr key={l.id} className="border-b border-gray-200">
                    <td className="p-2.5 font-medium">Licence Logicielle</td>
                    <td className="p-2.5 font-semibold" colSpan={2}>
                      {l.name} ({l.vendor})
                    </td>
                    <td className="p-2.5 text-[#1B4591] font-medium">Attribuée</td>
                  </tr>
                ))}
                {computers.length === 0 && screens.length === 0 && licenses.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500 italic">
                      Aucun équipement principal actuellement associé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Engagement Clause */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-[10.5px] text-gray-600 leading-relaxed">
            <p className="font-semibold text-gray-800 mb-1">Engagements du collaborateur :</p>
            Le collaborateur reconnaît avoir reçu le matériel informatique ci-dessus en parfait état de
            fonctionnement. Il s'engage à en faire un usage strictement conforme à la charte informatique de
            l'entreprise, à en assurer la garde diligente, et à le restituer immédiatement à première demande ou
            lors de la cessation de son contrat de travail.
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-gray-200">
            <div className="border border-dashed border-gray-300 rounded-xl p-4 h-24 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase">
                Pour la DSI (Remettant) :
              </span>
              <p className="text-[10px] text-gray-400">Signature & Date</p>
            </div>
            <div className="border border-dashed border-gray-300 rounded-xl p-4 h-24 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase">
                Le Bénéficiaire (Signature précédée de "Bon pour décharge") :
              </span>
              <p className="text-[10px] text-gray-400">Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
