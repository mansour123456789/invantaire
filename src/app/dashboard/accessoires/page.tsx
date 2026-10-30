'use client';

import React, { useState } from 'react';
import {
  Mouse,
  Keyboard,
  Headphones,
  Usb,
  Camera,
  Layers,
  Plus,
  Send,
  AlertTriangle,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { useInventory } from '@/lib/store';
import { Accessory, AccessoryCategory } from '@/lib/types';

const TITLE_PAGE_STYLE = {
  fontFamily: "'Inter', system-ui, sans-serif",
  color: '#1B4591',
  fontSize: '31px',
  lineHeight: '37.2px',
  fontWeight: 600,
  letterSpacing: 0,
};

export default function AccessoriesPage() {
  const {
    accessories,
    employees,
    distributeAccessory,
    adjustAccessoryStock,
    addAccessory,
    deleteAccessory,
  } = useInventory();

  // Distribute modal
  const [distributeModal, setDistributeModal] = useState<{
    isOpen: boolean;
    accessory: Accessory | null;
  }>({
    isOpen: false,
    accessory: null,
  });
  const [targetEmployeeId, setTargetEmployeeId] = useState(employees[0]?.id || '');
  const [quantityToGive, setQuantityToGive] = useState(1);
  const [distributeNotes, setDistributeNotes] = useState('');

  // Add accessory modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAcc, setNewAcc] = useState({
    name: '',
    category: 'SOURIS' as AccessoryCategory,
    brand: 'Logitech',
    model: '',
    totalQuantity: 10,
    inStockQuantity: 10,
    alertThreshold: 3,
    unitCost: 49,
    price: 49,
  });

  const getCategoryIcon = (cat: AccessoryCategory) => {
    switch (cat) {
      case 'SOURIS':
        return <Mouse className="w-4 h-4 text-[#1B4591]" />;
      case 'CLAVIER':
        return <Keyboard className="w-4 h-4 text-[#10B981]" />;
      case 'CASQUE':
        return <Headphones className="w-4 h-4 text-[#9333EA]" />;
      case 'DOCK_USB_C':
      case 'ADAPTATEUR':
        return <Usb className="w-4 h-4 text-[#F59E0B]" />;
      case 'WEBCAM':
        return <Camera className="w-4 h-4 text-[#0284C7]" />;
      default:
        return <Layers className="w-4 h-4 text-[#6D7A91]" />;
    }
  };

  const handleDistributeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!distributeModal.accessory || !targetEmployeeId) return;

    distributeAccessory(
      distributeModal.accessory.id,
      targetEmployeeId,
      Number(quantityToGive),
      distributeNotes
    );
    setDistributeModal({ isOpen: false, accessory: null });
    setDistributeNotes('');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAcc.name.trim()) return;

    addAccessory({
      ...newAcc,
      price: newAcc.price || newAcc.unitCost,
      unitCost: newAcc.price || newAcc.unitCost,
    });
    setIsAddModalOpen(false);
    setNewAcc({
      name: '',
      category: 'SOURIS',
      brand: 'Logitech',
      model: '',
      totalQuantity: 10,
      inStockQuantity: 10,
      alertThreshold: 3,
      unitCost: 49,
      price: 49,
    });
  };

  return (
    <div className="space-y-6 text-[#263248] dark:text-foreground">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-semibold" style={TITLE_PAGE_STYLE}>
            Périphériques & Accessoires
          </h1>
          <p className="text-sm text-[#6D7A91] mt-1">
            Gestion des stocks d'accessoires (souris, claviers, docks et casques) et seuils d'alerte
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#1B4591] text-white hover:bg-[#153875] transition-all shadow-md shadow-[#1B4591]/20 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une référence</span>
        </button>
      </div>

      {/* ── Grid of Accessories ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accessories.map((item) => {
          const isCritical = item.inStockQuantity <= item.alertThreshold;
          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border shadow-sm transition-all flex flex-col justify-between ${
                isCritical
                  ? 'border-[#FDD68A] bg-[#FFFBF5] dark:bg-amber-950/10 dark:border-amber-900/50'
                  : 'border-slate-200/80 bg-white dark:bg-card dark:border-border'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-muted border border-slate-100 dark:border-border">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#6D7A91]">
                        {item.category}
                      </span>
                      <h3 className="font-bold text-[#2B313B] dark:text-foreground text-sm leading-snug">
                        {item.name}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-[#6D7A91] space-y-1 mb-4">
                  <p>
                    Marque & Modèle :{' '}
                    <strong className="text-[#2B313B] dark:text-foreground">
                      {item.brand} {item.model}
                    </strong>
                  </p>
                  <p>
                    Prix unitaire :{' '}
                    <span className="font-semibold text-[#1B4591] dark:text-primary">
                      {(item.price || item.unitCost).toLocaleString('fr-FR')} €
                    </span>
                    <span className="text-[11px] text-[#6D7A91] ml-2 font-normal">
                      (Valeur stock : {((item.inStockQuantity || 0) * (item.price || item.unitCost || 0)).toLocaleString('fr-FR')} €)
                    </span>
                  </p>
                </div>

                {/* Stock Gauge */}
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-muted/40 border border-slate-100 dark:border-border/70 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#2B313B] dark:text-foreground">
                      Stock en réserve :
                    </span>
                    <span
                      className={`font-bold ${isCritical ? 'text-[#D97706]' : 'text-[#10B981]'}`}
                    >
                      {item.inStockQuantity} / {item.totalQuantity} unités
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 w-full bg-[#E2E8F0] dark:bg-muted rounded-full overflow-hidden">
                    <div
                      style={{ width: `${(item.inStockQuantity / item.totalQuantity) * 100}%` }}
                      className={`h-full rounded-full transition-all ${
                        isCritical ? 'bg-[#F59E0B]' : 'bg-[#10B981]'
                      }`}
                    />
                  </div>

                  {isCritical ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#D97706] font-semibold pt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Stock bas (seuil fixé à {item.alertThreshold})</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#10B981] font-semibold pt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Niveau de réserve optimal</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-border flex items-center justify-between">
                <button
                  onClick={() => {
                    if (confirm(`Supprimer la référence ${item.name} ?`)) {
                      deleteAccessory(item.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-[#6D7A91] hover:text-red-500 hover:bg-red-50 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newQty = prompt(
                        `Nouveau stock en réserve pour ${item.name} :`,
                        String(item.inStockQuantity)
                      );
                      if (newQty !== null && !isNaN(Number(newQty))) {
                        adjustAccessoryStock(item.id, Number(newQty));
                      }
                    }}
                    className="px-3 py-1.5 text-xs text-[#6D7A91] hover:text-[#263248] font-semibold rounded-xl hover:bg-slate-50 border border-slate-200 dark:border-border"
                  >
                    Ajuster
                  </button>

                  <button
                    disabled={item.inStockQuantity <= 0}
                    onClick={() =>
                      setDistributeModal({
                        isOpen: true,
                        accessory: item,
                      })
                    }
                    className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-[#1B4591] text-white hover:bg-[#153875] disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3 h-3" />
                    <span>Attribuer</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Distribute Modal */}
      {distributeModal.isOpen && distributeModal.accessory && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-2xl border border-border shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-[#1B4591] dark:text-primary text-lg mb-1">
              Remise d'accessoire
            </h3>
            <p className="text-xs text-[#6D7A91] mb-4">
              Article : <strong>{distributeModal.accessory.name}</strong>
            </p>

            <form onSubmit={handleDistributeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Bénéficiaire *</label>
                <select
                  value={targetEmployeeId}
                  onChange={(e) => setTargetEmployeeId(e.target.value)}
                  className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl"
                  required
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Quantité remise *</label>
                <input
                  type="number"
                  min={1}
                  max={distributeModal.accessory.inStockQuantity}
                  value={quantityToGive}
                  onChange={(e) => setQuantityToGive(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Observations</label>
                <textarea
                  rows={2}
                  value={distributeNotes}
                  onChange={(e) => setDistributeNotes(e.target.value)}
                  placeholder="Ex: Remplacement matériel défectueux, dotation standard..."
                  className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-border mt-4">
                <button
                  type="button"
                  onClick={() => setDistributeModal({ isOpen: false, accessory: null })}
                  className="px-4 py-2 text-[#6D7A91] hover:bg-slate-50 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1B4591] text-white font-semibold rounded-xl hover:bg-[#153875] shadow-sm"
                >
                  Valider la remise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-2xl border border-border shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-[#1B4591] dark:text-primary text-lg mb-1">
              Ajouter une référence d'accessoire
            </h3>
            <p className="text-xs text-[#6D7A91] mb-4">
              Nouvel équipement au catalogue des périphériques
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Désignation *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Souris ergonomique sans fil"
                  value={newAcc.name}
                  onChange={(e) => setNewAcc({ ...newAcc, name: e.target.value })}
                  className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Catégorie *</label>
                  <select
                    value={newAcc.category}
                    onChange={(e) =>
                      setNewAcc({ ...newAcc, category: e.target.value as AccessoryCategory })
                    }
                    className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl"
                  >
                    <option value="SOURIS">Souris</option>
                    <option value="CLAVIER">Clavier</option>
                    <option value="CASQUE">Casque / Audio</option>
                    <option value="DOCK_USB_C">Station Dock</option>
                    <option value="WEBCAM">Webcam</option>
                    <option value="ADAPTATEUR">Adaptateur / Câble</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Marque *</label>
                  <input
                    type="text"
                    required
                    value={newAcc.brand}
                    onChange={(e) => setNewAcc({ ...newAcc, brand: e.target.value })}
                    className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Modèle</label>
                <input
                  type="text"
                  placeholder="Ex: MX Master 3S"
                  value={newAcc.model}
                  onChange={(e) => setNewAcc({ ...newAcc, model: e.target.value })}
                  className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Qté totale</label>
                  <input
                    type="number"
                    min={1}
                    value={newAcc.totalQuantity}
                    onChange={(e) =>
                      setNewAcc({
                        ...newAcc,
                        totalQuantity: Number(e.target.value),
                        inStockQuantity: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Seuil alerte</label>
                  <input
                    type="number"
                    min={1}
                    value={newAcc.alertThreshold}
                    onChange={(e) =>
                      setNewAcc({ ...newAcc, alertThreshold: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Prix unitaire (€)</label>
                  <input
                    type="number"
                    min={0}
                    value={newAcc.price || newAcc.unitCost}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setNewAcc({ ...newAcc, unitCost: val, price: val });
                    }}
                    className="w-full p-2.5 bg-[#F8FAFC] dark:bg-muted border border-slate-200 dark:border-border rounded-xl font-mono text-[#1B4591]"
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
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
