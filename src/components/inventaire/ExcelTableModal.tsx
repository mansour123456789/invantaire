'use client';

import React, { useState, useRef, useMemo } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  Search,
  Monitor,
  Laptop,
  Users,
  Layers,
  RotateCcw,
  Sparkles,
  Coffee,
} from 'lucide-react';
import { useInventory } from '@/lib/store';
import { Screen, Computer, Employee, EquipmentStatus, ComputerType, GeneralEquipment, GeneralEquipmentCategory } from '@/lib/types';
import { INITIAL_SCREENS } from '@/lib/mock-data';

interface ExcelTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'ECRANS' | 'PCS' | 'EMPLOYES' | 'EQUIPEMENTS' | 'MATRICE';
  isEmbedded?: boolean; // When rendered directly in a page rather than a modal
}

export const ExcelTableModal: React.FC<ExcelTableModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'ECRANS',
  isEmbedded = false,
}) => {
  const {
    screens,
    computers,
    employees,
    generalEquipments,
    importScreensFromCsv,
    updateScreenField,
    addScreen,
    deleteScreen,
    updateComputerField,
    addComputer,
    deleteComputer,
    updateEmployeeField,
    addEmployee,
    deleteEmployee,
    updateGeneralEquipmentField,
    addGeneralEquipment,
    deleteGeneralEquipment,
    getEquipmentForEmployee,
  } = useInventory();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'ECRANS' | 'PCS' | 'EMPLOYES' | 'EQUIPEMENTS' | 'MATRICE'>(initialTab);
  const [search, setSearch] = useState('');
  const [activeCell, setActiveCell] = useState<{ row: number; col: string; val: string } | null>({
    row: 1,
    col: 'A',
    val: 'EC-1',
  });
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Return null if modal mode and not open
  if (!isEmbedded && !isOpen) return null;

  const showNotify = (text: string, type: 'success' | 'info' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Recharger le fichier original EcoPilot (Écrans).csv
  const handleReloadEcoPilotScreens = () => {
    if (confirm('Voulez-vous recharger les 22 écrans officiels depuis "Inventaire_Informatique_EcoPilot(Écrans).csv" ?')) {
      INITIAL_SCREENS.forEach((sc) => {
        const existing = screens.find((s) => s.tag === sc.tag);
        if (existing) {
          updateScreenField(existing.id, 'brand', sc.brand);
          updateScreenField(existing.id, 'characteristics', sc.characteristics);
          updateScreenField(existing.id, 'year', sc.year);
          updateScreenField(existing.id, 'price', sc.price);
          updateScreenField(existing.id, 'status', sc.status);
          updateScreenField(existing.id, 'assignedEmployeeName', sc.assignedEmployeeName || '');
          updateScreenField(existing.id, 'assignedToEmployeeId', sc.assignedToEmployeeId);
        } else {
          addScreen(sc);
        }
      });
      showNotify('Les 22 écrans EcoPilot et leurs affectations ont été synchronisés avec succès !');
    }
  };

  // Import de fichier CSV / Excel
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      // Smart format detection
      const firstLine = text.split(/\r\n|\n/)[0]?.toLowerCase() || '';

      if (firstLine.includes('ecran') || firstLine.includes('écran') || activeTab === 'ECRANS') {
        const res = importScreensFromCsv(text);
        setActiveTab('ECRANS');
        showNotify(`Import Écrans réussi : ${res.added} écran(s) synchronisé(s) depuis le fichier !`);
      } else if (firstLine.includes('matricule') || firstLine.includes('prenom') || activeTab === 'EMPLOYES') {
        // Import simple pour employés
        const lines = text.split(/\r\n|\n/).filter((l) => l.trim());
        let count = 0;
        const sep = firstLine.includes(';') ? ';' : ',';
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(sep).map((p) => p.replace(/^"|"$/g, '').trim());
          if (parts.length >= 3 && parts[1]) {
            addEmployee({
              matricule: parts[0] || `EMP-${Date.now().toString().slice(-3)}`,
              lastName: parts[1] || 'Nom',
              firstName: parts[2] || 'Prénom',
              email: parts[3] || `${parts[2]?.toLowerCase() || 'emp'}.${parts[1]?.toLowerCase() || 'user'}@ecopilot.fr`,
              phone: parts[4] || '+33 6 00 00 00 00',
              department: parts[5] || 'Général',
              roleTitle: parts[6] || 'Collaborateur',
              arrivalDate: parts[7] || new Date().toISOString().split('T')[0],
            });
            count++;
          }
        }
        setActiveTab('EMPLOYES');
        showNotify(`Import Employés réussi : ${count} collaborateur(s) importé(s) !`);
      } else {
        // Fallback écrans
        const res = importScreensFromCsv(text);
        showNotify(`Fichier importé : ${res.added} enregistrement(s) mis à jour.`);
      }

      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file, 'UTF-8');
  };

  // Ajout de ligne selon l'onglet actif
  const handleAddRow = () => {
    if (activeTab === 'ECRANS') {
      const nextNum = screens.length + 1;
      const nextTag = `EC-${nextNum}`;
      addScreen({
        tag: nextTag,
        brand: 'DELL',
        model: 'Écran 24" Full HD',
        characteristics: '24" Full HD 1920x1080p, HDMI, VGA',
        year: new Date().getFullYear(),
        price: 180,
        serialNumber: `DL-24-${new Date().getFullYear()}-${nextNum}`,
        status: 'DISPONIBLE',
        sizeInch: 24,
      });
      showNotify(`Ligne écran ${nextTag} ajoutée à la feuille Écrans.`);
    } else if (activeTab === 'PCS') {
      const nextNum = computers.length + 1;
      const nextTag = `PC-${new Date().getFullYear()}-0${nextNum < 10 ? '0' + nextNum : nextNum}`;
      addComputer({
        tag: nextTag,
        type: 'LAPTOP',
        brand: 'Dell',
        model: 'Latitude 5540',
        serialNumber: `DL-LAT-${Date.now().toString().slice(-4)}`,
        processor: 'Intel Core i7-1365U',
        ram: '16 Go DDR5',
        storage: '512 Go NVMe SSD',
        price: 1200,
        purchaseDate: new Date().toISOString().split('T')[0],
        warrantyUntil: '2027-01-01',
        status: 'DISPONIBLE',
        location: 'Stock Réserve IT',
      });
      showNotify(`Ligne ordinateur ${nextTag} ajoutée à la feuille PC.`);
    } else if (activeTab === 'EMPLOYES') {
      const nextNum = employees.length + 1;
      const nextMatricule = `EMP-0${nextNum < 10 ? '0' + nextNum : nextNum}`;
      addEmployee({
        matricule: nextMatricule,
        firstName: 'Nouveau',
        lastName: 'Collaborateur',
        email: `collaborateur.${nextNum}@ecopilot.fr`,
        phone: '+33 6 00 00 00 00',
        department: 'Développement IT',
        roleTitle: 'Poste à définir',
        arrivalDate: new Date().toISOString().split('T')[0],
      });
      showNotify(`Ligne collaborateur ${nextMatricule} ajoutée.`);
    } else if (activeTab === 'EQUIPEMENTS') {
      const nextNum = generalEquipments.length + 1;
      const nextTag = `EQ-0${nextNum}`;
      addGeneralEquipment({
        tag: nextTag,
        name: 'Nouvel Équipement / Machine',
        category: 'ELECTROMENAGER',
        brand: 'Marque',
        model: 'Modèle',
        location: 'Cuisine / Locaux',
        status: 'DISPONIBLE',
        cost: 150,
        assignedResponsible: 'Marwa Wartateni',
        maintenanceNotes: 'Entretien régulier',
        purchaseDate: new Date().toISOString().split('T')[0],
        warrantyUntil: '2026-12-31',
      });
      showNotify(`Ligne équipement ${nextTag} ajoutée à la feuille Équipements.`);
    }
  };

  // Helper XML pour exporter au format natif Microsoft Excel (.xls)
  const escapeXml = (unsafe: any): string => {
    if (unsafe === undefined || unsafe === null) return '';
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const generateXmlExcelWorkbook = (
    sheets: Array<{ name: string; headers: string[]; rows: (string | number)[][] }>
  ): string => {
    const sanitizeSheetName = (name: string) => name.replace(/[:\\/?*\[\]]/g, ' ').slice(0, 31);

    return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>EcoPilot Gestion IT</Author>
  <Company>EcoPilot</Company>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#1E293B"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0E6B37"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0E6B37"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0E6B37"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0E6B37"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#107C41" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="TagStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Consolas" ss:Size="10" ss:Bold="1" ss:Color="#1B4591"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="CellStyle">
   <Alignment ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10"/>
  </Style>
  <Style ss:ID="NumberCell">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10"/>
  </Style>
 </Styles>
${sheets
  .map(
    (sheet) => ` <Worksheet ss:Name="${escapeXml(sanitizeSheetName(sheet.name))}">
  <Table ss:DefaultColumnWidth="130" ss:DefaultRowHeight="20">
   <Row ss:Height="24">
${sheet.headers.map((h) => `    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`).join('\n')}
   </Row>
${sheet.rows
  .map(
    (row) => `   <Row ss:Height="20">
${row
  .map((cell, idx) => {
    const isTag = idx === 0;
    const isNum = typeof cell === 'number';
    const styleId = isTag ? 'TagStyle' : isNum ? 'NumberCell' : 'CellStyle';
    const dataType = isNum ? 'Number' : 'String';
    return `    <Cell ss:StyleID="${styleId}"><Data ss:Type="${dataType}">${escapeXml(cell)}</Data></Cell>`;
  })
  .join('\n')}
   </Row>`
  )
  .join('\n')}
  </Table>
 </Worksheet>`
  )
  .join('\n')}
</Workbook>`;
  };

  // Récupérer les données pour une feuille
  const getSheetData = (tab: 'ECRANS' | 'PCS' | 'EMPLOYES' | 'EQUIPEMENTS' | 'MATRICE') => {
    if (tab === 'ECRANS') {
      return {
        name: 'Écrans et Moniteurs',
        headers: ['ID_Ecran', 'Marque / Modèle', 'Caractéristiques', 'Année', 'Prix (€)', 'État', 'Affecté à', 'N° Série'],
        rows: screens.map((s) => [
          s.tag,
          s.brand,
          s.characteristics || s.model,
          s.year || 2024,
          s.price || 0,
          s.status === 'DISPONIBLE' ? 'Disponible' : 'Non disponible',
          s.assignedEmployeeName || '',
          s.serialNumber || '',
        ]),
      };
    } else if (tab === 'PCS') {
      return {
        name: 'Ordinateurs et PC',
        headers: ['Tag PC', 'Type', 'Marque', 'Modèle', 'Processeur', 'RAM', 'Stockage', 'Prix (€)', 'N° Série', 'État', 'Affecté à'],
        rows: computers.map((c) => [
          c.tag,
          c.type,
          c.brand,
          c.model,
          c.processor,
          c.ram,
          c.storage,
          c.price || 0,
          c.serialNumber,
          c.status === 'DISPONIBLE' ? 'Disponible' : 'Non disponible',
          c.assignedEmployeeName || '',
        ]),
      };
    } else if (tab === 'EMPLOYES') {
      return {
        name: 'Collaborateurs',
        headers: ['Matricule', 'Nom', 'Prénom', 'Email', 'Téléphone', 'Département', 'Fonction', 'Date Arrivée'],
        rows: employees.map((e) => [
          e.matricule,
          e.lastName,
          e.firstName,
          e.email,
          e.phone,
          e.department,
          e.roleTitle,
          e.arrivalDate,
        ]),
      };
    } else if (tab === 'EQUIPEMENTS') {
      return {
        name: 'Autres Équipements & Café',
        headers: ['Tag', 'Nom Équipement', 'Catégorie', 'Marque', 'Modèle', 'N° Série', 'Emplacement', 'État', 'Responsable', 'Coût (€)', 'Notes Entretien'],
        rows: generalEquipments.map((eq) => [
          eq.tag,
          eq.name,
          eq.category,
          eq.brand,
          eq.model,
          eq.serialNumber || '',
          eq.location,
          eq.status === 'DISPONIBLE' ? 'En service' : eq.status === 'EN_REPARATION' ? 'Maintenance' : 'Rebut',
          eq.assignedResponsible || '',
          eq.cost || 0,
          eq.maintenanceNotes || '',
        ]),
      };
    } else {
      return {
        name: 'Matrice de Dotations',
        headers: ['Collaborateur', 'Département', 'Fonction', 'PC Affecté', 'Écran(s) Affecté(s)'],
        rows: employees.map((e) => {
          const eq = getEquipmentForEmployee(e.id);
          const pcStr = eq.computers.map((c) => `${c.brand} ${c.model} (${c.tag})`).join(' / ') || 'Aucun';
          const scrStr = eq.screens.map((s) => `${s.brand} (${s.tag})`).join(' / ') || 'Aucun';
          return [`${e.firstName} ${e.lastName}`, e.department, e.roleTitle, pcStr, scrStr];
        }),
      };
    }
  };

  // Téléchargement au format natif Microsoft Excel (.xls XML Workbook)
  const handleExportExcel = (singleSheet = true) => {
    let sheetsToExport: Array<{ name: string; headers: string[]; rows: (string | number)[][] }> = [];
    let filename = '';

    if (singleSheet) {
      const data = getSheetData(activeTab);
      sheetsToExport = [data];
      filename = `Inventaire_EcoPilot_${data.name.replace(/[^a-zA-Z0-9_]/g, '_')}_${new Date().toISOString().split('T')[0]}.xls`;
    } else {
      sheetsToExport = [
        getSheetData('ECRANS'),
        getSheetData('PCS'),
        getSheetData('EMPLOYES'),
        getSheetData('EQUIPEMENTS'),
        getSheetData('MATRICE'),
      ];
      filename = `EcoPilot_Classeur_Inventaire_Complet_${new Date().toISOString().split('T')[0]}.xls`;
    }

    const xmlContent = generateXmlExcelWorkbook(sheetsToExport);
    const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotify(`Fichier Excel téléchargé avec succès : "${filename}"`);
  };

  // Exportation CSV classique formaté pour Microsoft Excel (Point-virgule + UTF-8 BOM)
  const handleExportCsv = () => {
    const data = getSheetData(activeTab);
    const filename = `Inventaire_EcoPilot_${data.name.replace(/[^a-zA-Z0-9_]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [
        data.headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(';'),
        ...data.rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')),
      ].join('\r\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotify(`Feuille exportée en CSV sous "${filename}".`);
  };

  // Filtrage selon recherche
  const filteredScreens = useMemo(() => {
    if (!search.trim()) return screens;
    const q = search.toLowerCase();
    return screens.filter(
      (s) =>
        s.tag.toLowerCase().includes(q) ||
        s.brand.toLowerCase().includes(q) ||
        (s.characteristics && s.characteristics.toLowerCase().includes(q)) ||
        (s.assignedEmployeeName && s.assignedEmployeeName.toLowerCase().includes(q))
    );
  }, [screens, search]);

  const filteredComputers = useMemo(() => {
    if (!search.trim()) return computers;
    const q = search.toLowerCase();
    return computers.filter(
      (c) =>
        c.tag.toLowerCase().includes(q) ||
        c.brand.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q) ||
        c.serialNumber.toLowerCase().includes(q) ||
        (c.assignedEmployeeName && c.assignedEmployeeName.toLowerCase().includes(q))
    );
  }, [computers, search]);

  const filteredEmployees = useMemo(() => {
    if (!search.trim()) return employees;
    const q = search.toLowerCase();
    return employees.filter(
      (e) =>
        e.firstName.toLowerCase().includes(q) ||
        e.lastName.toLowerCase().includes(q) ||
        e.matricule.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q)
    );
  }, [employees, search]);

  const filteredEquipments = useMemo(() => {
    if (!search.trim()) return generalEquipments;
    const q = search.toLowerCase();
    return generalEquipments.filter(
      (eq) =>
        eq.tag.toLowerCase().includes(q) ||
        eq.name.toLowerCase().includes(q) ||
        eq.brand.toLowerCase().includes(q) ||
        eq.model.toLowerCase().includes(q) ||
        eq.location.toLowerCase().includes(q) ||
        (eq.assignedResponsible && eq.assignedResponsible.toLowerCase().includes(q))
    );
  }, [generalEquipments, search]);

  // Contenu principal de la grille
  const content = (
    <div className="flex flex-col h-full w-full bg-white dark:bg-card overflow-hidden">
      {/* ── Top Ribbon Toolbar (Vert Excel #107C41 + Bleu Marine EcoPilot #1B4591) ── */}
      <div className="px-5 py-3 border-b border-slate-200 dark:border-border flex flex-wrap items-center justify-between gap-3 bg-[#F8FAFC] dark:bg-muted/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#107C41] text-white flex items-center justify-center font-bold shadow-md shadow-[#107C41]/25 shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#1B4591] dark:text-primary text-sm flex items-center gap-2">
              <span>Éditeur Tableur Excel - Parc EcoPilot</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#107C41]/10 text-[#107C41] font-bold border border-[#107C41]/20">
                Mode Édition Live
              </span>
            </h3>
            <p className="text-[11px] text-[#6D7A91] dark:text-muted-foreground">
              Modifiez directement les cellules des PC, Écrans et Collaborateurs selon vos besoins
            </p>
          </div>
        </div>

        {/* Boutons d'actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv,.txt"
            className="hidden"
            onChange={handleFileUpload}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-card border border-slate-200 dark:border-border hover:bg-slate-50 text-[#1B4591] dark:text-primary font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            title="Importer un fichier CSV ou TXT"
          >
            <Upload className="w-3.5 h-3.5 text-[#1B4591] dark:text-primary" />
            <span>Importer CSV / Excel</span>
          </button>

          <button
            onClick={handleReloadEcoPilotScreens}
            className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 text-[#1B4591] dark:text-blue-300 font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            title="Recharger les 22 écrans du fichier Inventaire_Informatique_EcoPilot(Écrans).csv"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Recharger CSV</span>
          </button>

          {/* Bouton Télécharger en Excel (.xls) - Feuille Active */}
          <button
            onClick={() => handleExportExcel(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#107C41] hover:bg-[#0E6B37] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#107C41]/30 transition-all cursor-pointer"
            title="Télécharger la feuille actuelle au format natif Microsoft Excel (.xls)"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>Télécharger en Excel (.xls)</span>
          </button>

          {/* Bouton Télécharger Classeur Complet (5 Feuilles) */}
          <button
            onClick={() => handleExportExcel(false)}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 text-[#107C41] dark:text-emerald-300 font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Télécharger toutes les feuilles (Écrans, PC, Employés, Équipements, Matrice) dans un seul classeur Excel complet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#107C41] dark:text-emerald-300" />
            <span className="hidden xl:inline">Classeur Complet (5 Feuilles .xls)</span>
          </button>

          {/* Export CSV alternatif */}
          <button
            onClick={handleExportCsv}
            className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-card border border-slate-200 dark:border-border hover:bg-slate-50 text-slate-600 dark:text-slate-300 font-medium text-xs flex items-center gap-1 shadow-sm transition-all"
            title="Télécharger la feuille au format CSV"
          >
            <Download className="w-3 h-3 text-slate-500" />
            <span className="hidden md:inline">Format CSV</span>
          </button>

          <button
            onClick={handleAddRow}
            className="px-3.5 py-1.5 rounded-xl bg-[#1B4591] hover:bg-[#153875] text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-[#1B4591]/25 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Insérer une ligne</span>
          </button>

          {!isEmbedded && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#6D7A91] hover:text-[#263248] hover:bg-slate-100 dark:hover:bg-muted ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Tabs / Feuilles Excel (comme les onglets au bas ou en haut d'Excel) ── */}
      <div className="px-5 py-2 border-b border-slate-200 dark:border-border bg-[#F1F4F9] dark:bg-muted/60 flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('ECRANS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'ECRANS'
                ? 'bg-white dark:bg-card text-[#107C41] shadow-sm border border-slate-300/80 dark:border-border font-bold'
                : 'text-[#6D7A91] hover:text-[#1B4591] hover:bg-white/60'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Feuille 1 : Écrans & Moniteurs (CSV)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/80 text-slate-700 font-mono">
              {screens.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('PCS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'PCS'
                ? 'bg-white dark:bg-card text-[#1B4591] dark:text-primary shadow-sm border border-slate-300/80 dark:border-border font-bold'
                : 'text-[#6D7A91] hover:text-[#1B4591] hover:bg-white/60'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Feuille 2 : Ordinateurs & PC</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/80 text-slate-700 font-mono">
              {computers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('EMPLOYES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'EMPLOYES'
                ? 'bg-white dark:bg-card text-[#1B4591] dark:text-primary shadow-sm border border-slate-300/80 dark:border-border font-bold'
                : 'text-[#6D7A91] hover:text-[#1B4591] hover:bg-white/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Feuille 3 : Collaborateurs</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/80 text-slate-700 font-mono">
              {employees.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('EQUIPEMENTS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'EQUIPEMENTS'
                ? 'bg-white dark:bg-card text-amber-600 shadow-sm border border-slate-300/80 dark:border-border font-bold'
                : 'text-[#6D7A91] hover:text-amber-600 hover:bg-white/60'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Feuille 4 : Autres Équipements & Café</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/80 text-slate-700 font-mono">
              {generalEquipments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('MATRICE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'MATRICE'
                ? 'bg-white dark:bg-card text-[#7C3AED] shadow-sm border border-slate-300/80 dark:border-border font-bold'
                : 'text-[#6D7A91] hover:text-[#7C3AED] hover:bg-white/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Feuille 5 : Matrice d'Affectation Croisée</span>
          </button>
        </div>

        {/* Recherche instantanée */}
        <div className="relative w-64 shrink-0">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6D7A91]" />
          <input
            type="text"
            placeholder="Filtrer dans la feuille..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-xs bg-white dark:bg-card border border-slate-200 dark:border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#107C41]"
          />
        </div>
      </div>

      {/* ── Formula Bar (Barre de formule fx d'Excel) ── */}
      <div className="px-5 py-1.5 border-b border-slate-200 dark:border-border bg-white dark:bg-card flex items-center gap-3 text-xs">
        <div className="w-16 px-2 py-0.5 rounded bg-[#F1F5F9] dark:bg-muted font-mono font-bold text-center text-[#107C41] border border-slate-300 dark:border-border select-none">
          {activeCell?.col}
          {activeCell?.row}
        </div>
        <div className="font-serif italic font-bold text-[#6D7A91] select-none text-[13px]">fx</div>
        <div className="flex-1 px-2.5 py-0.5 rounded bg-slate-50 dark:bg-muted/40 border border-slate-200 dark:border-border font-mono text-xs text-[#263248] dark:text-foreground truncate">
          {activeCell?.val || '(Sélectionnez une cellule pour visualiser sa formule ou son texte)'}
        </div>
      </div>

      {/* ── Toast de notification ── */}
      {notification && (
        <div className="px-5 py-2 bg-[#E6F7F1] dark:bg-emerald-950/40 border-b border-[#A7F3D0] text-[#10B981] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification.text}</span>
        </div>
      )}

      {/* ── Grille Tableur Excel ── */}
      <div className="flex-1 overflow-auto bg-[#EFF1F8] dark:bg-background p-3.5">
        <div className="bg-white dark:bg-card rounded-xl border border-slate-300 dark:border-border shadow-sm overflow-hidden">
          {/* ========================================================= */}
          {/* FEUILLE 1 : ÉCRANS                                       */}
          {/* ========================================================= */}
          {activeTab === 'ECRANS' && (
            <table className="w-full border-collapse text-left text-xs font-sans">
              <thead>
                <tr className="bg-[#E9EEF4] dark:bg-muted border-b border-slate-300 dark:border-border text-[#2B313B] dark:text-foreground font-bold select-none">
                  <th className="w-10 p-2 text-center border-r border-slate-300 dark:border-border text-[11px] bg-[#E2E8F0] dark:bg-muted text-[#64748B]">
                    #
                  </th>
                  <th className="p-2 border-r border-slate-300 dark:border-border w-24">A | ID_Ecran</th>
                  <th className="p-2 border-r border-slate-300 dark:border-border w-36">B | Marque / Modèle</th>
                  <th className="p-2 border-r border-slate-300 dark:border-border min-w-[340px]">
                    C | Caractéristiques techniques
                  </th>
                  <th className="p-2 border-r border-slate-300 dark:border-border w-20 text-center">D | Année</th>
                  <th className="p-2 border-r border-slate-300 dark:border-border w-24 text-right">E | Prix (€)</th>
                  <th className="p-2 border-r border-slate-300 dark:border-border w-32 text-center">F | État</th>
                  <th className="p-2 border-r border-slate-300 dark:border-border min-w-[220px]">
                    G | Affecté à (Collaborateur)
                  </th>
                  <th className="w-12 p-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-border/60">
                {filteredScreens.map((screen, idx) => {
                  const isAvailable = screen.status === 'DISPONIBLE';

                  return (
                    <tr
                      key={screen.id}
                      className="hover:bg-[#F2F7FF] dark:hover:bg-muted/40 transition-colors group"
                      onClick={() =>
                        setActiveCell({
                          row: idx + 1,
                          col: 'A',
                          val: `${screen.tag} - ${screen.brand} - ${screen.assignedEmployeeName || 'Disponible'}`,
                        })
                      }
                    >
                      {/* Row Index */}
                      <td className="p-1.5 text-center border-r border-slate-200 dark:border-border bg-[#F8FAFC] dark:bg-muted/50 font-mono text-[10px] text-[#64748B] select-none">
                        {idx + 1}
                      </td>

                      {/* Tag ID_Ecran */}
                      <td className="p-1 border-r border-slate-200 dark:border-border">
                        <input
                          type="text"
                          value={screen.tag}
                          onChange={(e) => updateScreenField(screen.id, 'tag', e.target.value)}
                          onFocus={() => setActiveCell({ row: idx + 1, col: 'A', val: screen.tag })}
                          className="w-full px-2 py-1 bg-transparent font-mono font-bold text-[#1B4591] dark:text-primary rounded focus:bg-[#EFF6FF] focus:outline-none focus:ring-1 focus:ring-[#107C41]"
                        />
                      </td>

                      {/* Marque / Modèle */}
                      <td className="p-1 border-r border-slate-200 dark:border-border">
                        <input
                          type="text"
                          value={screen.brand}
                          onChange={(e) => updateScreenField(screen.id, 'brand', e.target.value)}
                          onFocus={() => setActiveCell({ row: idx + 1, col: 'B', val: screen.brand })}
                          className="w-full px-2 py-1 bg-transparent font-semibold text-[#2B313B] dark:text-foreground rounded focus:bg-[#EFF6FF] focus:outline-none focus:ring-1 focus:ring-[#107C41]"
                        />
                      </td>

                      {/* Caractéristiques */}
                      <td className="p-1 border-r border-slate-200 dark:border-border">
                        <input
                          type="text"
                          value={screen.characteristics || screen.model}
                          onChange={(e) => updateScreenField(screen.id, 'characteristics', e.target.value)}
                          onFocus={() =>
                            setActiveCell({ row: idx + 1, col: 'C', val: screen.characteristics || screen.model })
                          }
                          className="w-full px-2 py-1 bg-transparent text-[#263248] dark:text-foreground text-xs rounded focus:bg-[#EFF6FF] focus:outline-none focus:ring-1 focus:ring-[#107C41]"
                        />
                      </td>

                      {/* Année */}
                      <td className="p-1 border-r border-slate-200 dark:border-border text-center">
                        <input
                          type="number"
                          value={screen.year || 2024}
                          onChange={(e) => updateScreenField(screen.id, 'year', parseInt(e.target.value) || 2024)}
                          onFocus={() => setActiveCell({ row: idx + 1, col: 'D', val: String(screen.year || 2024) })}
                          className="w-full px-2 py-1 bg-transparent text-center font-mono font-medium rounded focus:bg-[#EFF6FF] focus:outline-none focus:ring-1 focus:ring-[#107C41]"
                        />
                      </td>

                      {/* Prix (€) */}
                      <td className="p-1 border-r border-slate-200 dark:border-border text-right">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={screen.price || 0}
                          onChange={(e) => updateScreenField(screen.id, 'price', Number(e.target.value) || 0)}
                          onFocus={() => setActiveCell({ row: idx + 1, col: 'E', val: `${screen.price || 0} €` })}
                          className="w-full px-2 py-1 bg-transparent text-right font-mono font-semibold text-[#1B4591] dark:text-primary rounded focus:bg-[#EFF6FF] focus:outline-none focus:ring-1 focus:ring-[#107C41]"
                        />
                      </td>

                      {/* État */}
                      <td className="p-1 border-r border-slate-200 dark:border-border text-center">
                        <select
                          value={screen.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as EquipmentStatus;
                            updateScreenField(screen.id, 'status', newStatus);
                            if (newStatus === 'DISPONIBLE') {
                              updateScreenField(screen.id, 'assignedEmployeeName', '');
                              updateScreenField(screen.id, 'assignedToEmployeeId', undefined);
                            }
                          }}
                          onFocus={() => setActiveCell({ row: idx + 1, col: 'F', val: screen.status })}
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold focus:outline-none cursor-pointer ${
                            isAvailable
                              ? 'bg-[#E6F7F1] text-[#10B981] border border-[#A7F3D0]'
                              : 'bg-[#FEE2E2] text-[#EF4444] border border-[#FCA5A5]'
                          }`}
                        >
                          <option value="DISPONIBLE">Disponible</option>
                          <option value="AFFECTE">Non disponible</option>
                          <option value="EN_REPARATION">En réparation</option>
                        </select>
                      </td>

                      {/* Affecté à */}
                      <td className="p-1 border-r border-slate-200 dark:border-border">
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            placeholder={isAvailable ? 'En stock IT' : 'Nom du collaborateur'}
                            value={screen.assignedEmployeeName || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateScreenField(screen.id, 'assignedEmployeeName', val);
                            }}
                            onFocus={() =>
                              setActiveCell({
                                row: idx + 1,
                                col: 'G',
                                val: screen.assignedEmployeeName || 'Non assigné',
                              })
                            }
                            list="employees-datalist"
                            className={`w-full px-2 py-1 bg-transparent font-medium rounded focus:bg-[#EFF6FF] focus:outline-none focus:ring-1 focus:ring-[#107C41] ${
                              isAvailable ? 'text-[#6D7A91] italic' : 'text-[#1B4591] dark:text-primary font-bold'
                            }`}
                          />
                        </div>
                      </td>

                      {/* Action Supprimer */}
                      <td className="p-1 text-center">
                        <button
                          onClick={() => {
                            if (confirm(`Supprimer la ligne de l'écran ${screen.tag} ?`)) {
                              deleteScreen(screen.id);
                            }
                          }}
                          className="p-1 rounded text-[#6D7A91] hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Supprimer la ligne"
                        >
                          <Trash2 className="w-3.5 h-3.5 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* ========================================================= */}
          {/* FEUILLE 2 : ORDINATEURS PC                                */}
          {/* ========================================================= */}
          {activeTab === 'PCS' && (
            <table className="w-full border-collapse text-left text-xs font-sans">
              <thead>
                <tr className="bg-[#E9EEF4] dark:bg-muted border-b border-slate-300 dark:border-border text-[#2B313B] dark:text-foreground font-bold select-none">
                  <th className="w-10 p-2 text-center border-r border-slate-300 dark:border-border text-[11px] bg-[#E2E8F0] dark:bg-muted text-[#64748B]">
                    #
                  </th>
                  <th className="p-2 border-r border-slate-300 dark:border-border w-28">A | Tag PC</th>
                  <th className="p-2 border-r border-slate-300 dark:border-border w-24">B | Type</th>
                  <th className="p-2 border-r border-slate-300 dark:border-border w-24">C | Marque</th>
                  <th className="p-2 border-r border-slate-300 dark:border-border w-36">D | Modèle</th>
                  <th className="p-2 border-r border-slate-300 dark:border-border w-32">E | Processeur</th>
                  <th className="p-2 border-r border-slate-300 dark:border-border w-24">F | RAM</th>
                  <th className="p-2 border-r border-slate-300 dark:border-border w-28">G | Stockage</th>
                  <th className="p-2 border-r border-slate-300 dark:border-border w-28 text-right">H | Prix (€)</th>
                  <th className="p-2 border-r border-slate-300 dark:border-border w-32">I | N° Série</th>
                  <th className="p-2 border-r border-slate-300 dark:border-border w-28 text-center">J | État</th>
                  <th className="p-2 border-r border-slate-300 dark:border-border min-w-[200px]">K | Affecté à</th>
                  <th className="w-12 p-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-border/60">
                {filteredComputers.map((comp, idx) => {
                  const isAvailable = comp.status === 'DISPONIBLE';

                  return (
                    <tr
                      key={comp.id}
                      className="hover:bg-[#F2F7FF] dark:hover:bg-muted/40 transition-colors group"
                      onClick={() =>
                        setActiveCell({
                          row: idx + 1,
                          col: 'A',
                          val: `${comp.tag} - ${comp.brand} ${comp.model} (${comp.assignedEmployeeName || 'Disponible'})`,
                        })
                      }
                    >
                      {/* # Index */}
                      <td className="p-1.5 text-center border-r border-slate-200 dark:border-border bg-[#F8FAFC] dark:bg-muted/50 font-mono text-[10px] text-[#64748B] select-none">
                        {idx + 1}
                      </td>

                      {/* Tag PC */}
                      <td className="p-1 border-r border-slate-200 dark:border-border">
                        <input
                          type="text"
                          value={comp.tag}
                          onChange={(e) => updateComputerField(comp.id, 'tag', e.target.value)}
                          onFocus={() => setActiveCell({ row: idx + 1, col: 'A', val: comp.tag })}
                          className="w-full px-2 py-1 bg-transparent font-mono font-bold text-[#1B4591] dark:text-primary rounded focus:bg-[#EFF6FF] focus:outline-none focus:ring-1 focus:ring-[#107C41]"
                        />
                      </td>

                      {/* Type */}
                      <td className="p-1 border-r border-slate-200 dark:border-border">
                        <select
                          value={comp.type}
                          onChange={(e) => updateComputerField(comp.id, 'type', e.target.value as ComputerType)}
                          onFocus={() => setActiveCell({ row: idx + 1, col: 'B', val: comp.type })}
                          className="w-full px-2 py-1 bg-transparent rounded focus:bg-[#EFF6FF] focus:outline-none focus:ring-1 focus:ring-[#107C41]"
                        >
                          <option value="LAPTOP">Portable</option>
                          <option value="DESKTOP">Tour Fixe</option>
                          <option value="SERVER">Serveur</option>
                        </select>
                      </td>

                      {/* Marque */}
                      <td className="p-1 border-r border-slate-200 dark:border-border">
                        <input
                          type="text"
                          value={comp.brand}
                          onChange={(e) => updateComputerField(comp.id, 'brand', e.target.value)}
                          onFocus={() => setActiveCell({ row: idx + 1, col: 'C', val: comp.brand })}
                          className="w-full px-2 py-1 bg-transparent font-medium rounded focus:bg-[#EFF6FF] focus:outline-none focus:ring-1 focus:ring-[#107C41]"
                        />
                      </td>

                      {/* Modèle */}
                      <td className="p-1 border-r border-slate-200 dark:border-border">
                        <input
                          type="text"
                          value={comp.model}
                          onChange={(e) => updateComputerField(comp.id, 'model', e.target.value)}
                          onFocus={() => setActiveCell({ row: idx + 1, col: 'D', val: comp.model })}
                          className="w-full px-2 py-1 bg-transparent font-semibold text-[#2B313B] dark:text-foreground rounded focus:bg-[#EFF6FF] focus:outline-none focus:ring-1 focus:ring-[#107C41]"
                        />
                      </td>

                      {/* Processeur */}
                      <td className="p-1 border-r border-slate-200 dark:border-border">
                        <input
                          type="text"
                          value={comp.processor}
                          onChange={(e) => updateComputerField(comp.id, 'processor', e.target.value)}
                          onFocus={() => setActiveCell({ row: idx + 1, col: 'E', val: comp.processor })}
                          className="w-full px-2 py-1 bg-transparent rounded focus:bg-[#EFF6FF] focus:outline-none focus:ring-1 focus:ring-[#107C41]"
                        />
                      </td>

                      {/* RAM */}
                      <td className="p-1 border-r border-slate-200 dark:border-border">
                        <input
                          type="text"
                          value={comp.ram}
                          onChange={(e) => updateComputerField(comp.id, 'ram', e.target.value)}
                          onFocus={() => setActiveCell({ row: idx + 1, col: 'F', val: comp.ram })}
                          className="w-full px-2 py-1 bg-transparent font-mono rounded focus:bg-[#EFF6FF] focus:outline-none focus:ring-1 focus:ring-[#107C41]"
                        />
                      </td>

                      {/* Stockage */}
                      <td className="p-1 border-r border-slate-200 dark:border-border">
                        <input
                          type="text"
                          value={comp.storage}
                          onChange={(e) => updateComputerField(comp.id, 'storage', e.target.value)}
                          onFocus={() => setActiveCell({ row: idx + 1, col: 'G', val: comp.storage })}
                          className="w-full px-2 py-1 bg-transparent font-mono rounded focus:bg-[#EFF6FF] focus:outline-none focus:ring-1 focus:ring-[#107C41]"
                        />
                      </td>

                      {/* Prix (€) */}
                      <td className="p-1 border-r border-slate-200 dark:border-border text-right">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={comp.price || 0}
                          onChange={(e) => updateComputerField(comp.id, 'price', Number(e.target.value) || 0)}
                          onFocus={() => setActiveCell({ row: idx + 1, col: 'H', val: `${comp.price || 0} €` })}
                          className="w-full px-2 py-1 bg-transparent text-right font-mono font-semibold text-[#1B4591] dark:text-primary rounded focus:bg-[#EFF6FF] focus:outline-none focus:ring-1 focus:ring-[#107C41]"
                        />
                      </td>

                      {/* N° Série */}
                      <td className="p-1 border-r border-slate-200 dark:border-border">
                        <input
                          type="text"
                          value={comp.serialNumber}
                          onChange={(e) => updateComputerField(comp.id, 'serialNumber', e.target.value)}
                          onFocus={() => setActiveCell({ row: idx + 1, col: 'I', val: comp.serialNumber })}
                          className="w-full px-2 py-1 bg-transparent font-mono text-[11px] rounded focus:bg-[#EFF6FF] focus:outline-none focus:ring-1 focus:ring-[#107C41]"
                        />
                      </td>

                      {/* État */}
                      <td className="p-1 border-r border-slate-200 dark:border-border text-center">
                        <select
                          value={comp.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as EquipmentStatus;
                            updateComputerField(comp.id, 'status', newStatus);
                            if (newStatus === 'DISPONIBLE') {
                              updateComputerField(comp.id, 'assignedEmployeeName', '');
                              updateComputerField(comp.id, 'assignedToEmployeeId', undefined);
                            }
                          }}
                          onFocus={() => setActiveCell({ row: idx + 1, col: 'J', val: comp.status })}
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold focus:outline-none cursor-pointer ${
                            isAvailable
                              ? 'bg-[#E6F7F1] text-[#10B981] border border-[#A7F3D0]'
                              : 'bg-[#FEE2E2] text-[#EF4444] border border-[#FCA5A5]'
                          }`}
                        >
                          <option value="DISPONIBLE">Disponible</option>
                          <option value="AFFECTE">Non disponible</option>
                          <option value="EN_REPARATION">En réparation</option>
                        </select>
                      </td>

                      {/* Affecté à */}
                      <td className="p-1 border-r border-slate-200 dark:border-border">
                        <input
                          type="text"
                          placeholder={isAvailable ? 'En stock IT' : 'Nom du collaborateur'}
                          value={comp.assignedEmployeeName || ''}
                          onChange={(e) => updateComputerField(comp.id, 'assignedEmployeeName', e.target.value)}
                          onFocus={() =>
                            setActiveCell({ row: idx + 1, col: 'K', val: comp.assignedEmployeeName || 'Non assigné' })
                          }
                          list="employees-datalist"
                          className={`w-full px-2 py-1 bg-transparent font-medium rounded focus:bg-[#EFF6FF] focus:outline-none focus:ring-1 focus:ring-[#107C41] ${
                            isAvailable ? 'text-[#6D7A91] italic' : 'text-[#1B4591] dark:text-primary font-bold'
                          }`}
                        />
                      </td>

                      {/* Action Supprimer */}
                      <td className="p-1 text-center">
                        <button
                          onClick={() => {
                            if (confirm(`Supprimer la ligne de l'ordinateur ${comp.tag} ?`)) {
                              deleteComputer(comp.id);
                            }
                          }}
                          className="p-1 rounded text-[#6D7A91] hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Supprimer la ligne"
                        >
                          <Trash2 className="w-3.5 h-3.5 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* ========================================================= */}
          {/* FEUILLE 3 : COLLABORATEURS                                */}
          {/* ========================================================= */}
          {activeTab === 'EMPLOYES' && (
            <table className="w-full border-collapse text-left text-xs font-sans">
              <thead>
                <tr className="bg-[#E9EEF4] dark:bg-muted border-b border-slate-300 dark:border-border text-[#2B313B] dark:text-foreground font-bold select-none">
                  <th className="w-10 p-2 text-center border-r border-slate-300 dark:border-border text-[11px] bg-[#E2E8F0] dark:bg-muted text-[#64748B]">
                    #
                  </th>
                  <th className="p-2 border-r border-slate-300 dark:border-border w-24">A | Matricule</th>
                  <th className="p-2 border-r border-slate-300 dark:border-border w-32">B | Nom</th>
                  <th className="p-2 border-r border-slate-300 dark:border-border w-32">C | Prénom</th>
                  <th className="p-2 border-r border-slate-300 dark:border-border min-w-[200px]">D | Email</th>
                  <th className="p-2 border-r border-slate-300 dark:border-border w-32">E | Téléphone</th>
                  <th className="p-2 border-r border-slate-300 dark:border-border w-40">F | Département</th>
                  <th className="p-2 border-r border-slate-300 dark:border-border min-w-[200px]">G | Poste / Fonction</th>
                  <th className="p-2 border-r border-slate-300 dark:border-border w-32">H | Matériel Doté</th>
                  <th className="w-12 p-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-border/60">
                {filteredEmployees.map((emp, idx) => {
                  const eq = getEquipmentForEmployee(emp.id);
                  const pcTag = eq.computers[0]?.tag || 'Aucun';
                  const scrTag = eq.screens.map((s) => s.tag).join(', ') || 'Aucun';

                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-[#F2F7FF] dark:hover:bg-muted/40 transition-colors group"
                      onClick={() =>
                        setActiveCell({
                          row: idx + 1,
                          col: 'A',
                          val: `${emp.matricule} - ${emp.firstName} ${emp.lastName} (${emp.roleTitle})`,
                        })
                      }
                    >
                      {/* # Index */}
                      <td className="p-1.5 text-center border-r border-slate-200 dark:border-border bg-[#F8FAFC] dark:bg-muted/50 font-mono text-[10px] text-[#64748B] select-none">
                        {idx + 1}
                      </td>

                      {/* Matricule */}
                      <td className="p-1 border-r border-slate-200 dark:border-border">
                        <input
                          type="text"
                          value={emp.matricule}
                          onChange={(e) => updateEmployeeField(emp.id, 'matricule', e.target.value)}
                          onFocus={() => setActiveCell({ row: idx + 1, col: 'A', val: emp.matricule })}
                          className="w-full px-2 py-1 bg-transparent font-mono font-bold text-[#1B4591] dark:text-primary rounded focus:bg-[#EFF6FF] focus:outline-none focus:ring-1 focus:ring-[#107C41]"
                        />
                      </td>

                      {/* Nom */}
                      <td className="p-1 border-r border-slate-200 dark:border-border">
                        <input
                          type="text"
                          value={emp.lastName}
                          onChange={(e) => updateEmployeeField(emp.id, 'lastName', e.target.value)}
                          onFocus={() => setActiveCell({ row: idx + 1, col: 'B', val: emp.lastName })}
                          className="w-full px-2 py-1 bg-transparent font-bold text-[#2B313B] dark:text-foreground rounded focus:bg-[#EFF6FF] focus:outline-none focus:ring-1 focus:ring-[#107C41]"
                        />
                      </td>

                      {/* Prénom */}
                      <td className="p-1 border-r border-slate-200 dark:border-border">
                        <input
                          type="text"
                          value={emp.firstName}
                          onChange={(e) => updateEmployeeField(emp.id, 'firstName', e.target.value)}
                          onFocus={() => setActiveCell({ row: idx + 1, col: 'C', val: emp.firstName })}
                          className="w-full px-2 py-1 bg-transparent font-medium rounded focus:bg-[#EFF6FF] focus:outline-none focus:ring-1 focus:ring-[#107C41]"
                        />
                      </td>

                      {/* Email */}
                      <td className="p-1 border-r border-slate-200 dark:border-border">
                        <input
                          type="email"
                          value={emp.email}
                          onChange={(e) => updateEmployeeField(emp.id, 'email', e.target.value)}
                          onFocus={() => setActiveCell({ row: idx + 1, col: 'D', val: emp.email })}
                          className="w-full px-2 py-1 bg-transparent text-[#263248] dark:text-foreground rounded focus:bg-[#EFF6FF] focus:outline-none focus:ring-1 focus:ring-[#107C41]"
                        />
                      </td>

                      {/* Téléphone */}
                      <td className="p-1 border-r border-slate-200 dark:border-border">
                        <input
                          type="text"
                          value={emp.phone}
                          onChange={(e) => updateEmployeeField(emp.id, 'phone', e.target.value)}
                          onFocus={() => setActiveCell({ row: idx + 1, col: 'E', val: emp.phone })}
                          className="w-full px-2 py-1 bg-transparent font-mono rounded focus:bg-[#EFF6FF] focus:outline-none focus:ring-1 focus:ring-[#107C41]"
                        />
                      </td>

                      {/* Département */}
                      <td className="p-1 border-r border-slate-200 dark:border-border">
                        <input
                          type="text"
                          value={emp.department}
                          onChange={(e) => updateEmployeeField(emp.id, 'department', e.target.value)}
                          onFocus={() => setActiveCell({ row: idx + 1, col: 'F', val: emp.department })}
                          className="w-full px-2 py-1 bg-transparent rounded focus:bg-[#EFF6FF] focus:outline-none focus:ring-1 focus:ring-[#107C41]"
                        />
                      </td>

                      {/* Poste */}
                      <td className="p-1 border-r border-slate-200 dark:border-border">
                        <input
                          type="text"
                          value={emp.roleTitle}
                          onChange={(e) => updateEmployeeField(emp.id, 'roleTitle', e.target.value)}
                          onFocus={() => setActiveCell({ row: idx + 1, col: 'G', val: emp.roleTitle })}
                          className="w-full px-2 py-1 bg-transparent rounded focus:bg-[#EFF6FF] focus:outline-none focus:ring-1 focus:ring-[#107C41]"
                        />
                      </td>

                      {/* Matériel doté */}
                      <td className="p-1 border-r border-slate-200 dark:border-border">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#EFF6FF] text-[#1B4591] font-bold border border-blue-200">
                            💻 {pcTag}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                            🖥️ {scrTag}
                          </span>
                        </div>
                      </td>

                      {/* Action Supprimer */}
                      <td className="p-1 text-center">
                        <button
                          onClick={() => {
                            if (confirm(`Supprimer le collaborateur ${emp.firstName} ${emp.lastName} ?`)) {
                              deleteEmployee(emp.id);
                            }
                          }}
                          className="p-1 rounded text-[#6D7A91] hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Supprimer la ligne"
                        >
                          <Trash2 className="w-3.5 h-3.5 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* ========================================================= */}
          {/* FEUILLE 4 : MATRICE D'AFFECTATION CROISÉE                 */}
          {/* ========================================================= */}
          {activeTab === 'MATRICE' && (
            <table className="w-full border-collapse text-left text-xs font-sans">
              <thead>
                <tr className="bg-[#E9EEF4] dark:bg-muted border-b border-slate-300 dark:border-border text-[#2B313B] dark:text-foreground font-bold select-none">
                  <th className="w-10 p-2 text-center border-r border-slate-300 dark:border-border text-[11px] bg-[#E2E8F0] dark:bg-muted text-[#64748B]">
                    #
                  </th>
                  <th className="p-2 border-r border-slate-300 dark:border-border w-44">Collaborateur</th>
                  <th className="p-2 border-r border-slate-300 dark:border-border w-40">Département</th>
                  <th className="p-2 border-r border-slate-300 dark:border-border min-w-[240px]">
                    Ordinateur PC Assigné
                  </th>
                  <th className="p-2 border-r border-slate-300 dark:border-border min-w-[260px]">
                    Écran(s) Assigné(s)
                  </th>
                  <th className="p-2 border-r border-slate-300 dark:border-border w-32 text-center">Statut Dotation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-border/60">
                {employees.map((emp, idx) => {
                  const eq = getEquipmentForEmployee(emp.id);
                  const hasPc = eq.computers.length > 0;
                  const hasScreen = eq.screens.length > 0;
                  const isFullyEquipped = hasPc && hasScreen;

                  return (
                    <tr key={emp.id} className="hover:bg-[#F2F7FF] dark:hover:bg-muted/40 transition-colors">
                      <td className="p-2 text-center border-r border-slate-200 dark:border-border bg-[#F8FAFC] dark:bg-muted/50 font-mono text-[10px] text-[#64748B]">
                        {idx + 1}
                      </td>

                      <td className="p-2 border-r border-slate-200 dark:border-border font-bold text-[#1B4591] dark:text-primary">
                        {emp.firstName} {emp.lastName}
                        <div className="text-[10px] font-normal text-[#6D7A91]">{emp.roleTitle}</div>
                      </td>

                      <td className="p-2 border-r border-slate-200 dark:border-border text-slate-600 dark:text-slate-300">
                        {emp.department}
                      </td>

                      {/* PC Select */}
                      <td className="p-1 border-r border-slate-200 dark:border-border">
                        <select
                          value={eq.computers[0]?.id || ''}
                          onChange={(e) => {
                            const newPcId = e.target.value;
                            // Retirer l'ancien PC si sélectionné
                            eq.computers.forEach((oldPc) => {
                              updateComputerField(oldPc.id, 'assignedToEmployeeId', undefined);
                              updateComputerField(oldPc.id, 'assignedEmployeeName', '');
                              updateComputerField(oldPc.id, 'status', 'DISPONIBLE');
                            });
                            // Assigner le nouveau PC
                            if (newPcId) {
                              updateComputerField(newPcId, 'assignedToEmployeeId', emp.id);
                              updateComputerField(
                                newPcId,
                                'assignedEmployeeName',
                                `${emp.firstName} ${emp.lastName}`
                              );
                              updateComputerField(newPcId, 'status', 'AFFECTE');
                            }
                          }}
                          className={`w-full px-2 py-1 text-xs rounded border ${
                            hasPc
                              ? 'bg-blue-50/70 text-[#1B4591] border-blue-200 font-semibold'
                              : 'bg-white text-slate-400 border-slate-200 italic'
                          }`}
                        >
                          <option value="">-- Aucun PC affecté --</option>
                          {computers.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.tag} - {c.brand} {c.model}{' '}
                              {c.assignedToEmployeeId === emp.id
                                ? '(Actuellement attribué)'
                                : c.status === 'DISPONIBLE'
                                ? '(En stock)'
                                : `(${c.assignedEmployeeName || 'Occupé'})`}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Écrans */}
                      <td className="p-2 border-r border-slate-200 dark:border-border">
                        {hasScreen ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {eq.screens.map((sc) => (
                              <span
                                key={sc.id}
                                className="px-2 py-0.5 rounded-md bg-[#E6F7F1] text-[#107C41] border border-[#A7F3D0] text-[11px] font-semibold"
                              >
                                🖥️ {sc.tag} ({sc.brand})
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Aucun écran attribué</span>
                        )}
                      </td>

                      {/* Statut Dotation */}
                      <td className="p-2 border-r border-slate-200 dark:border-border text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${
                            isFullyEquipped
                              ? 'bg-[#E6F7F1] text-[#10B981] border border-[#A7F3D0]'
                              : hasPc || hasScreen
                              ? 'bg-[#FFF3E0] text-[#F59E0B] border border-[#FDE68A]'
                              : 'bg-[#FEE2E2] text-[#EF4444] border border-[#FCA5A5]'
                          }`}
                        >
                          {isFullyEquipped ? 'Complet' : hasPc || hasScreen ? 'Partiel' : 'Non doté'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* ========================================================= */}
          {/* FEUILLE 4 : AUTRES ÉQUIPEMENTS & CAFÉ                     */}
          {/* ========================================================= */}
          {activeTab === 'EQUIPEMENTS' && (
            <table className="w-full border-collapse text-left text-xs font-sans">
              <thead>
                <tr className="bg-[#E9EEF4] dark:bg-muted border-b border-slate-300 dark:border-border text-[#2B313B] dark:text-foreground font-bold select-none">
                  <th className="w-10 p-2 text-center border-r border-slate-300 dark:border-border text-[11px] bg-[#E2E8F0] dark:bg-muted text-[#64748B]">
                    #
                  </th>
                  <th className="p-2 border-r border-slate-300 dark:border-border w-24">A | Tag</th>
                  <th className="p-2 border-r border-slate-300 dark:border-border min-w-[220px]">B | Nom Équipement</th>
                  <th className="p-2 border-r border-slate-300 dark:border-border w-36">C | Catégorie</th>
                  <th className="p-2 border-r border-slate-300 dark:border-border w-36">D | Marque</th>
                  <th className="p-2 border-r border-slate-300 dark:border-border min-w-[160px]">E | Emplacement</th>
                  <th className="p-2 border-r border-slate-300 dark:border-border w-32 text-center">F | État</th>
                  <th className="p-2 border-r border-slate-300 dark:border-border w-36">G | Référent</th>
                  <th className="p-2 border-r border-slate-300 dark:border-border w-24 text-right">H | Coût (€)</th>
                  <th className="w-12 p-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-border/60">
                {filteredEquipments.map((eq, idx) => (
                  <tr
                    key={eq.id}
                    className="hover:bg-[#F2F7FF] dark:hover:bg-muted/40 transition-colors group"
                    onClick={() =>
                      setActiveCell({
                        row: idx + 1,
                        col: 'A',
                        val: `${eq.tag} - ${eq.name} (${eq.location})`,
                      })
                    }
                  >
                    <td className="p-1.5 text-center border-r border-slate-200 dark:border-border bg-[#F8FAFC] dark:bg-muted/50 font-mono text-[10px] text-[#64748B] select-none">
                      {idx + 1}
                    </td>

                    {/* Tag */}
                    <td className="p-1 border-r border-slate-200 dark:border-border">
                      <input
                        type="text"
                        value={eq.tag}
                        onChange={(e) => updateGeneralEquipmentField(eq.id, 'tag', e.target.value)}
                        className="w-full px-2 py-1 bg-transparent font-mono font-bold text-[#1B4591] dark:text-primary rounded focus:bg-[#EFF6FF] focus:outline-none focus:ring-1 focus:ring-[#107C41]"
                      />
                    </td>

                    {/* Nom */}
                    <td className="p-1 border-r border-slate-200 dark:border-border font-semibold text-[#263248] dark:text-foreground">
                      <input
                        type="text"
                        value={eq.name}
                        onChange={(e) => updateGeneralEquipmentField(eq.id, 'name', e.target.value)}
                        className="w-full px-2 py-1 bg-transparent rounded focus:bg-[#EFF6FF] focus:outline-none focus:ring-1 focus:ring-[#107C41]"
                      />
                    </td>

                    {/* Catégorie */}
                    <td className="p-1 border-r border-slate-200 dark:border-border">
                      <select
                        value={eq.category}
                        onChange={(e) => updateGeneralEquipmentField(eq.id, 'category', e.target.value as GeneralEquipmentCategory)}
                        className="w-full px-1.5 py-1 bg-transparent rounded focus:bg-[#EFF6FF] focus:outline-none focus:ring-1 focus:ring-[#107C41] text-xs"
                      >
                        <option value="ELECTROMENAGER">☕ Électroménager</option>
                        <option value="BUREAUTIQUE">🖨️ Bureautique</option>
                        <option value="AUDIOVISUEL">📺 Audiovisuel</option>
                        <option value="CONFORT">✨ Confort</option>
                        <option value="MOBILIER">🪑 Mobilier</option>
                        <option value="AUTRE">📦 Autre</option>
                      </select>
                    </td>

                    {/* Marque */}
                    <td className="p-1 border-r border-slate-200 dark:border-border">
                      <input
                        type="text"
                        value={eq.brand}
                        onChange={(e) => updateGeneralEquipmentField(eq.id, 'brand', e.target.value)}
                        className="w-full px-2 py-1 bg-transparent rounded focus:bg-[#EFF6FF] focus:outline-none focus:ring-1 focus:ring-[#107C41]"
                      />
                    </td>

                    {/* Emplacement */}
                    <td className="p-1 border-r border-slate-200 dark:border-border">
                      <input
                        type="text"
                        value={eq.location}
                        onChange={(e) => updateGeneralEquipmentField(eq.id, 'location', e.target.value)}
                        className="w-full px-2 py-1 bg-transparent rounded focus:bg-[#EFF6FF] focus:outline-none focus:ring-1 focus:ring-[#107C41]"
                      />
                    </td>

                    {/* État */}
                    <td className="p-1 border-r border-slate-200 dark:border-border text-center">
                      <select
                        value={eq.status}
                        onChange={(e) => updateGeneralEquipmentField(eq.id, 'status', e.target.value as EquipmentStatus)}
                        className={`w-full px-1.5 py-1 text-xs rounded border text-center font-bold ${
                          eq.status === 'DISPONIBLE'
                            ? 'bg-[#E6F7F1] text-[#10B981] border-[#A7F3D0]'
                            : eq.status === 'EN_REPARATION'
                            ? 'bg-[#FEF3C7] text-amber-700 border-amber-300'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        <option value="DISPONIBLE">En service</option>
                        <option value="EN_REPARATION">Maintenance</option>
                        <option value="REBUT">Rebut</option>
                      </select>
                    </td>

                    {/* Référent */}
                    <td className="p-1 border-r border-slate-200 dark:border-border">
                      <input
                        type="text"
                        value={eq.assignedResponsible || ''}
                        onChange={(e) => updateGeneralEquipmentField(eq.id, 'assignedResponsible', e.target.value)}
                        className="w-full px-2 py-1 bg-transparent rounded focus:bg-[#EFF6FF] focus:outline-none focus:ring-1 focus:ring-[#107C41]"
                      />
                    </td>

                    {/* Coût */}
                    <td className="p-1 border-r border-slate-200 dark:border-border text-right font-mono">
                      <input
                        type="number"
                        value={eq.cost || 0}
                        onChange={(e) => updateGeneralEquipmentField(eq.id, 'cost', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-right bg-transparent rounded focus:bg-[#EFF6FF] focus:outline-none focus:ring-1 focus:ring-[#107C41]"
                      />
                    </td>

                    {/* Supprimer */}
                    <td className="p-1 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`Supprimer l'équipement ${eq.name} ?`)) {
                            deleteGeneralEquipment(eq.id);
                          }
                        }}
                        className="p-1 rounded text-[#6D7A91] hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Supprimer la ligne"
                      >
                        <Trash2 className="w-3.5 h-3.5 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Datalist pour saisie automatique des collaborateurs */}
      <datalist id="employees-datalist">
        {employees.map((e) => (
          <option key={e.id} value={`${e.firstName} ${e.lastName}`}>
            {e.matricule} - {e.department} ({e.roleTitle})
          </option>
        ))}
      </datalist>

      {/* ── Status Bar en bas d'Excel (avec décompte et aide) ── */}
      <div className="px-5 py-2 border-t border-slate-200 dark:border-border bg-[#F8FAFC] dark:bg-muted/40 flex flex-wrap items-center justify-between text-[11px] text-[#6D7A91] select-none">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#107C41]"></span>
            <span>Synchronisation automatique active</span>
          </span>
          <span>•</span>
          <span>
            {activeTab === 'ECRANS' && `${screens.length} écrans au total (${screens.filter((s) => s.status === 'AFFECTE').length} affectés, ${screens.filter((s) => s.status === 'DISPONIBLE').length} en stock)`}
            {activeTab === 'PCS' && `${computers.length} ordinateurs (${computers.filter((c) => c.status === 'AFFECTE').length} affectés, ${computers.filter((c) => c.status === 'DISPONIBLE').length} en stock)`}
            {activeTab === 'EMPLOYES' && `${employees.length} collaborateurs répertoriés`}
            {activeTab === 'EQUIPEMENTS' && `${generalEquipments.length} équipements généraux & locaux répertoriés`}
            {activeTab === 'MATRICE' && `${employees.length} collaborateurs analysés`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded font-bold">
            Export Microsoft Excel Natif (.xls / XMLSS) & CSV
          </span>
        </div>
      </div>
    </div>
  );

  // If embedded in a page, render directly
  if (isEmbedded) {
    return content;
  }

  // If modal mode, render in backdrop overlay
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border shadow-2xl w-full max-w-7xl h-[92vh] flex flex-col overflow-hidden text-[#263248] dark:text-foreground">
        {content}
      </div>
    </div>
  );
};
