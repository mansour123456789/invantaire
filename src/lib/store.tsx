'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Computer,
  Screen,
  Accessory,
  SoftwareLicense,
  Employee,
  AuditLog,
  UserSession,
  EquipmentStatus,
  EquipmentCondition,
  GeneralEquipment,
} from './types';
import {
  INITIAL_COMPUTERS,
  INITIAL_SCREENS,
  INITIAL_ACCESSORIES,
  INITIAL_LICENSES,
  INITIAL_EMPLOYEES,
  INITIAL_AUDIT_LOGS,
  INITIAL_GENERAL_EQUIPMENTS,
} from './mock-data';

interface InventoryContextType {
  // Session
  user: UserSession | null;
  login: (emailOrRole?: string, password?: string) => { success: boolean; message?: string };
  logout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Data
  computers: Computer[];
  screens: Screen[];
  accessories: Accessory[];
  licenses: SoftwareLicense[];
  employees: Employee[];
  auditLogs: AuditLog[];
  generalEquipments: GeneralEquipment[];

  // Actions
  assignComputer: (
    computerId: string,
    employeeId: string,
    condition: EquipmentCondition,
    notes?: string
  ) => void;
  returnComputer: (
    computerId: string,
    condition: EquipmentCondition,
    notes?: string
  ) => void;
  updateComputerStatus: (computerId: string, status: EquipmentStatus) => void;
  updateComputerField: (computerId: string, field: keyof Computer, value: any) => void;
  addComputer: (computer: Omit<Computer, 'id'>) => void;
  deleteComputer: (id: string) => void;

  assignScreen: (
    screenId: string,
    employeeId: string,
    condition: EquipmentCondition,
    notes?: string
  ) => void;
  returnScreen: (
    screenId: string,
    condition: EquipmentCondition,
    notes?: string
  ) => void;
  updateScreenField: (screenId: string, field: keyof Screen, value: any) => void;
  addScreen: (screen: Omit<Screen, 'id'>) => void;
  deleteScreen: (id: string) => void;
  importScreensFromCsv: (csvContent: string) => { added: number; updated: number };

  distributeAccessory: (
    accessoryId: string,
    employeeId: string,
    quantity: number,
    notes?: string
  ) => void;
  addAccessory: (accessory: Omit<Accessory, 'id'>) => void;
  adjustAccessoryStock: (accessoryId: string, newStock: number) => void;
  deleteAccessory: (id: string) => void;

  assignLicenseSeat: (licenseId: string, employeeId: string) => void;
  revokeLicenseSeat: (licenseId: string, employeeId: string) => void;
  addLicense: (license: Omit<SoftwareLicense, 'id' | 'usedSeats'>) => void;
  deleteLicense: (id: string) => void;

  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployeeField: (employeeId: string, field: keyof Employee, value: any) => void;
  deleteEmployee: (id: string) => void;

  // General Equipments (Machines à café, électroménager, etc.)
  addGeneralEquipment: (equipment: Omit<GeneralEquipment, 'id'>) => void;
  updateGeneralEquipmentField: (id: string, field: keyof GeneralEquipment, value: any) => void;
  updateGeneralEquipmentStatus: (id: string, status: EquipmentStatus, notes?: string) => void;
  deleteGeneralEquipment: (id: string) => void;

  resetToEcoPilotData: () => void;

  // Helpers
  getEmployeeById: (id?: string) => Employee | undefined;
  getEquipmentForEmployee: (employeeId: string) => {
    computers: Computer[];
    screens: Screen[];
    licenses: SoftwareLicense[];
  };
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isClient, setIsClient] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const [user, setUser] = useState<UserSession | null>(null);

  const [computers, setComputers] = useState<Computer[]>(INITIAL_COMPUTERS);
  const [screens, setScreens] = useState<Screen[]>(INITIAL_SCREENS);
  const [accessories, setAccessories] = useState<Accessory[]>(INITIAL_ACCESSORIES);
  const [licenses, setLicenses] = useState<SoftwareLicense[]>(INITIAL_LICENSES);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [generalEquipments, setGeneralEquipments] = useState<GeneralEquipment[]>(INITIAL_GENERAL_EQUIPMENTS);

  // Initialize from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    const savedTheme = (localStorage.getItem('ecopilot_theme') as 'light' | 'dark') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const savedUser = localStorage.getItem('ecopilot_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }

    const savedComputers = localStorage.getItem('ecopilot_computers_v2');
    if (savedComputers) {
      try {
        const parsed = JSON.parse(savedComputers);
        const merged = parsed.map((c: Computer) => {
          if (c.price === undefined) {
            const init = INITIAL_COMPUTERS.find((ic) => ic.id === c.id || ic.tag === c.tag);
            return { ...c, price: init?.price || 1200 };
          }
          return c;
        });
        setComputers(merged);
      } catch (e) {
        setComputers(INITIAL_COMPUTERS);
      }
    } else {
      setComputers(INITIAL_COMPUTERS);
    }

    const savedScreens = localStorage.getItem('ecopilot_screens_v2');
    if (savedScreens) {
      try {
        const parsed = JSON.parse(savedScreens);
        const merged = parsed.map((s: Screen) => {
          if (s.price === undefined) {
            const init = INITIAL_SCREENS.find((is) => is.id === s.id || is.tag === s.tag);
            return { ...s, price: init?.price || 180 };
          }
          return s;
        });
        setScreens(merged);
      } catch (e) {
        setScreens(INITIAL_SCREENS);
      }
    } else {
      setScreens(INITIAL_SCREENS);
    }

    const savedAccessories = localStorage.getItem('ecopilot_accessories_v2');
    if (savedAccessories) {
      try {
        const parsed = JSON.parse(savedAccessories);
        const merged = parsed.map((a: Accessory) => {
          if (a.price === undefined) {
            return { ...a, price: a.unitCost || 49 };
          }
          return a;
        });
        setAccessories(merged);
      } catch (e) {
        setAccessories(INITIAL_ACCESSORIES);
      }
    } else {
      setAccessories(INITIAL_ACCESSORIES);
    }

    const savedLicenses = localStorage.getItem('ecopilot_licenses_v2');
    if (savedLicenses) setLicenses(JSON.parse(savedLicenses));
    else setLicenses(INITIAL_LICENSES);

    const savedEmployees = localStorage.getItem('ecopilot_employees_v2');
    if (savedEmployees) setEmployees(JSON.parse(savedEmployees));
    else setEmployees(INITIAL_EMPLOYEES);

    const savedLogs = localStorage.getItem('ecopilot_audit_logs_v2');
    if (savedLogs) setAuditLogs(JSON.parse(savedLogs));
    else setAuditLogs(INITIAL_AUDIT_LOGS);

    const savedGeneral = localStorage.getItem('ecopilot_general_equipments_v2');
    if (savedGeneral) setGeneralEquipments(JSON.parse(savedGeneral));
    else setGeneralEquipments(INITIAL_GENERAL_EQUIPMENTS);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('ecopilot_computers_v2', JSON.stringify(computers));
  }, [computers, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('ecopilot_screens_v2', JSON.stringify(screens));
  }, [screens, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('ecopilot_accessories_v2', JSON.stringify(accessories));
  }, [accessories, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('ecopilot_licenses_v2', JSON.stringify(licenses));
  }, [licenses, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('ecopilot_employees_v2', JSON.stringify(employees));
  }, [employees, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('ecopilot_audit_logs_v2', JSON.stringify(auditLogs));
  }, [auditLogs, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('ecopilot_general_equipments_v2', JSON.stringify(generalEquipments));
  }, [generalEquipments, isClient]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('ecopilot_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const login = (
    emailOrRole?: string,
    password?: string
  ): { success: boolean; message?: string } => {
    const rawEmail = (emailOrRole || '').trim().toLowerCase();
    const pwd = (password || '').trim();

    // Cas utilisateur demandé : marwa@eco-pilot.com avec mot de passe 123456
    if (rawEmail === 'marwa@eco-pilot.com' || rawEmail.includes('marwa')) {
      if (pwd && pwd !== '123456') {
        return { success: false, message: 'Mot de passe incorrect (Le mot de passe attendu est 123456)' };
      }
      const session: UserSession = {
        id: 'emp-marwa',
        name: 'Marwa Wartateni',
        email: 'marwa@eco-pilot.com',
        role: 'ADMIN',
      };
      setUser(session);
      localStorage.setItem('ecopilot_user', JSON.stringify(session));
      return { success: true };
    }

    // Si mot de passe fourni mais différent de 123456
    if (pwd && pwd !== '123456' && pwd !== 'Hayder1234!') {
      return { success: false, message: 'Mot de passe incorrect (Le mot de passe attendu est 123456)' };
    }

    const session: UserSession = {
      id: `u-${Date.now()}`,
      name: rawEmail.includes('hayder')
        ? 'Hayder Laabidi (Direction)'
        : rawEmail.includes('gestionnaire')
        ? 'Makrem Laabidi (Gestionnaire Parc)'
        : rawEmail.includes('technicien')
        ? 'Yassine Torjmane (Technicien IT)'
        : 'Marwa Wartateni (EcoPilot)',
      email: rawEmail || 'marwa@eco-pilot.com',
      role: 'ADMIN',
    };
    setUser(session);
    localStorage.setItem('ecopilot_user', JSON.stringify(session));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ecopilot_user');
  };

  const resetToEcoPilotData = () => {
    setComputers(INITIAL_COMPUTERS);
    setScreens(INITIAL_SCREENS);
    setAccessories(INITIAL_ACCESSORIES);
    setLicenses(INITIAL_LICENSES);
    setEmployees(INITIAL_EMPLOYEES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setGeneralEquipments(INITIAL_GENERAL_EQUIPMENTS);
  };

  const addAuditEntry = (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const now = new Date();
    const formatted = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;
    const newLog: AuditLog = {
      ...log,
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: formatted,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const getEmployeeById = (id?: string) => {
    return employees.find((e) => e.id === id);
  };

  const assignComputer = (
    computerId: string,
    employeeId: string,
    condition: EquipmentCondition,
    notes?: string
  ) => {
    const emp = getEmployeeById(employeeId);
    const comp = computers.find((c) => c.id === computerId);
    if (!comp || !emp) return;

    setComputers((prev) =>
      prev.map((c) =>
        c.id === computerId ? { ...c, status: 'AFFECTE', assignedToEmployeeId: employeeId } : c
      )
    );

    const dischargeNum = `DCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    addAuditEntry({
      action: 'ATTRIBUTION',
      itemType: 'PC',
      itemId: comp.id,
      itemLabel: `${comp.brand} ${comp.model} (${comp.tag})`,
      serialNumber: comp.serialNumber,
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      performedBy: user?.name || 'Administrateur',
      condition,
      notes: notes || 'Attribution de poste de travail.',
      dischargeNumber: dischargeNum,
    });
  };

  const returnComputer = (
    computerId: string,
    condition: EquipmentCondition,
    notes?: string
  ) => {
    const comp = computers.find((c) => c.id === computerId);
    if (!comp) return;
    const oldEmp = getEmployeeById(comp.assignedToEmployeeId);

    setComputers((prev) =>
      prev.map((c) =>
        c.id === computerId ? { ...c, status: 'DISPONIBLE', assignedToEmployeeId: undefined } : c
      )
    );

    addAuditEntry({
      action: 'RESTITUTION',
      itemType: 'PC',
      itemId: comp.id,
      itemLabel: `${comp.brand} ${comp.model} (${comp.tag})`,
      serialNumber: comp.serialNumber,
      employeeId: oldEmp?.id,
      employeeName: oldEmp ? `${oldEmp.firstName} ${oldEmp.lastName}` : 'Non assigné',
      performedBy: user?.name || 'Administrateur',
      condition,
      notes: notes || 'Restitution en stock IT.',
    });
  };

  const updateComputerStatus = (computerId: string, status: EquipmentStatus) => {
    const comp = computers.find((c) => c.id === computerId);
    if (!comp) return;

    setComputers((prev) =>
      prev.map((c) =>
        c.id === computerId
          ? {
              ...c,
              status,
              assignedToEmployeeId: status === 'AFFECTE' ? c.assignedToEmployeeId : undefined,
            }
          : c
      )
    );

    addAuditEntry({
      action: status === 'EN_REPARATION' ? 'MAINTENANCE' : status === 'REBUT' ? 'DECLASSEMENT' : 'ATTRIBUTION',
      itemType: 'PC',
      itemId: comp.id,
      itemLabel: `${comp.brand} ${comp.model} (${comp.tag})`,
      serialNumber: comp.serialNumber,
      performedBy: user?.name || 'Administrateur',
      condition: status === 'EN_REPARATION' ? 'DEGRADE' : 'BON_ETAT',
      notes: `Changement de statut vers : ${status}`,
    });
  };

  const updateComputerField = (computerId: string, field: keyof Computer, value: any) => {
    setComputers((prev) =>
      prev.map((c) => {
        if (c.id !== computerId) return c;
        const updated = { ...c, [field]: value };
        if (field === 'assignedEmployeeName') {
          const nameStr = (typeof value === 'string' ? value : '').trim();
          if (nameStr) {
            updated.status = 'AFFECTE';
            const matchedEmp = employees.find(
              (e) =>
                `${e.firstName} ${e.lastName}`.toLowerCase() === nameStr.toLowerCase() ||
                nameStr.toLowerCase().includes(e.lastName.toLowerCase())
            );
            if (matchedEmp) {
              updated.assignedToEmployeeId = matchedEmp.id;
            }
          } else {
            updated.status = 'DISPONIBLE';
            updated.assignedToEmployeeId = undefined;
          }
        } else if (field === 'assignedToEmployeeId') {
          const emp = employees.find((e) => e.id === value);
          if (emp) {
            updated.assignedEmployeeName = `${emp.firstName} ${emp.lastName}`;
            updated.status = 'AFFECTE';
          } else {
            updated.assignedEmployeeName = '';
            updated.status = 'DISPONIBLE';
          }
        }
        return updated;
      })
    );
  };

  const addComputer = (computerData: Omit<Computer, 'id'>) => {
    const newComp: Computer = {
      ...computerData,
      id: `pc-${Date.now()}`,
    };
    setComputers((prev) => [newComp, ...prev]);

    addAuditEntry({
      action: 'CREATION',
      itemType: 'PC',
      itemId: newComp.id,
      itemLabel: `${newComp.brand} ${newComp.model} (${newComp.tag})`,
      serialNumber: newComp.serialNumber,
      performedBy: user?.name || 'Administrateur',
      condition: 'NEUF',
      notes: 'Nouvelle entrée dans le parc informatique.',
    });
  };

  const deleteComputer = (id: string) => {
    setComputers((prev) => prev.filter((c) => c.id !== id));
  };

  const assignScreen = (
    screenId: string,
    employeeId: string,
    condition: EquipmentCondition,
    notes?: string
  ) => {
    const emp = getEmployeeById(employeeId);
    const scr = screens.find((s) => s.id === screenId);
    if (!scr || !emp) return;

    setScreens((prev) =>
      prev.map((s) =>
        s.id === screenId
          ? {
              ...s,
              status: 'AFFECTE',
              assignedToEmployeeId: employeeId,
              assignedEmployeeName: `${emp.firstName} ${emp.lastName}`,
            }
          : s
      )
    );

    addAuditEntry({
      action: 'ATTRIBUTION',
      itemType: 'ECRAN',
      itemId: scr.id,
      itemLabel: `${scr.brand} ${scr.model} (${scr.tag})`,
      serialNumber: scr.serialNumber,
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      performedBy: user?.name || 'Administrateur',
      condition,
      notes: notes || 'Attribution de moniteur.',
    });
  };

  const returnScreen = (
    screenId: string,
    condition: EquipmentCondition,
    notes?: string
  ) => {
    const scr = screens.find((s) => s.id === screenId);
    if (!scr) return;
    const oldEmp = getEmployeeById(scr.assignedToEmployeeId);

    setScreens((prev) =>
      prev.map((s) =>
        s.id === screenId
          ? {
              ...s,
              status: 'DISPONIBLE',
              assignedToEmployeeId: undefined,
              assignedEmployeeName: undefined,
            }
          : s
      )
    );

    addAuditEntry({
      action: 'RESTITUTION',
      itemType: 'ECRAN',
      itemId: scr.id,
      itemLabel: `${scr.brand} ${scr.model} (${scr.tag})`,
      serialNumber: scr.serialNumber,
      employeeId: oldEmp?.id,
      employeeName: oldEmp ? `${oldEmp.firstName} ${oldEmp.lastName}` : undefined,
      performedBy: user?.name || 'Administrateur',
      condition,
      notes: notes || 'Retour de moniteur en stock.',
    });
  };

  const updateScreenField = (screenId: string, field: keyof Screen, value: any) => {
    setScreens((prev) =>
      prev.map((s) => {
        if (s.id !== screenId) return s;
        const updated = { ...s, [field]: value };
        if (field === 'assignedEmployeeName') {
          const nameStr = (typeof value === 'string' ? value : '').trim();
          if (nameStr) {
            updated.status = 'AFFECTE';
            const matchedEmp = employees.find(
              (e) =>
                `${e.firstName} ${e.lastName}`.toLowerCase() === nameStr.toLowerCase() ||
                nameStr.toLowerCase().includes(e.lastName.toLowerCase())
            );
            if (matchedEmp) {
              updated.assignedToEmployeeId = matchedEmp.id;
            }
          } else {
            updated.status = 'DISPONIBLE';
            updated.assignedToEmployeeId = undefined;
          }
        } else if (field === 'assignedToEmployeeId') {
          const emp = employees.find((e) => e.id === value);
          if (emp) {
            updated.assignedEmployeeName = `${emp.firstName} ${emp.lastName}`;
            updated.status = 'AFFECTE';
          } else {
            updated.assignedEmployeeName = '';
            updated.status = 'DISPONIBLE';
          }
        }
        return updated;
      })
    );
  };

  const addScreen = (screenData: Omit<Screen, 'id'>) => {
    const newScr: Screen = {
      ...screenData,
      id: `scr-${Date.now()}`,
    };
    setScreens((prev) => [newScr, ...prev]);
  };

  const deleteScreen = (id: string) => {
    setScreens((prev) => prev.filter((s) => s.id !== id));
  };

  /** Parseur CSV intelligent compatible avec le format exact EcoPilot (Écrans).csv */
  const importScreensFromCsv = (csvContent: string) => {
    const lines: string[] = [];
    let currentLine = '';
    let insideQuotes = false;

    // Découpage robuste gérant les retours à la ligne dans les cellules entre guillemets
    for (let i = 0; i < csvContent.length; i++) {
      const char = csvContent[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
        currentLine += char;
      } else if ((char === '\n' || char === '\r') && !insideQuotes) {
        if (currentLine.trim()) {
          lines.push(currentLine.trim());
        }
        currentLine = '';
        if (char === '\r' && csvContent[i + 1] === '\n') {
          i++; // Sauter \r\n
        }
      } else {
        currentLine += char;
      }
    }
    if (currentLine.trim()) lines.push(currentLine.trim());

    if (lines.length < 2) return { added: 0, updated: 0 };

    let addedCount = 0;
    let updatedCount = 0;
    const newScreens: Screen[] = [];

    // Détecter séparateur (; ou ,)
    const header = lines[0];
    const separator = header.includes(';') ? ';' : ',';

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line || line.startsWith(';;;;;')) continue;

      // Découper les colonnes en respectant les guillemets
      const cols: string[] = [];
      let curCol = '';
      let inQ = false;
      for (let c = 0; c < line.length; c++) {
        const ch = line[c];
        if (ch === '"') {
          inQ = !inQ;
        } else if (ch === separator && !inQ) {
          cols.push(curCol.trim().replace(/^"|"$/g, ''));
          curCol = '';
        } else {
          curCol += ch;
        }
      }
      cols.push(curCol.trim().replace(/^"|"$/g, ''));

      if (cols.length < 2) continue;

      const tag = cols[0]?.trim() || `EC-${i}`;
      const brand = cols[1]?.trim() || 'Générique';
      const characteristics = cols[2]?.trim() || '';
      const year = parseInt(cols[3]?.trim()) || new Date().getFullYear();
      const rawEtat = cols[4]?.trim().toLowerCase() || 'disponible';
      const affecteA = cols[5]?.trim() || '';

      const isDispo = rawEtat.includes('disponible') && !rawEtat.includes('non');
      const status: EquipmentStatus = isDispo ? 'DISPONIBLE' : 'AFFECTE';

      // Trouver ou créer l'employé
      let empId: string | undefined = undefined;
      if (affecteA) {
        const existingEmp = employees.find(
          (e) =>
            `${e.firstName} ${e.lastName}`.toLowerCase() === affecteA.toLowerCase() ||
            affecteA.toLowerCase().includes(e.lastName.toLowerCase())
        );
        if (existingEmp) {
          empId = existingEmp.id;
        } else {
          // Créer l'employé automatiquement
          const parts = affecteA.split(' ');
          const fn = parts[0] || 'Collaborateur';
          const ln = parts.slice(1).join(' ') || '';
          const newEmpId = `emp-${Date.now()}-${Math.floor(Math.random() * 100)}`;
          const newEmp: Employee = {
            id: newEmpId,
            matricule: `EMP-${Math.floor(100 + Math.random() * 900)}`,
            firstName: fn,
            lastName: ln,
            email: `${fn[0]?.toLowerCase() || ''}.${ln.toLowerCase()}@ecopilot.fr`,
            phone: '+33 6 00 00 00 00',
            department: 'Département Général',
            roleTitle: 'Collaborateur EcoPilot',
            arrivalDate: `${year}-01-01`,
          };
          setEmployees((prev) => [...prev, newEmp]);
          empId = newEmpId;
        }
      }

      // Diagonale approximative
      let size = 24;
      if (characteristics.includes('27')) size = 27;
      else if (characteristics.includes('23.8')) size = 23.8;
      else if (characteristics.includes('21.5')) size = 21.5;
      else if (characteristics.includes('19.5')) size = 19.5;
      else if (characteristics.includes('34')) size = 34;

      const screenObj: Screen = {
        id: `ec-${tag.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        tag,
        brand,
        model: characteristics.split('-')[0]?.trim() || `${brand} ${size}"`,
        sizeInch: size,
        characteristics,
        year,
        serialNumber: `${brand.slice(0, 2).toUpperCase()}-${tag}-${year}`,
        status,
        assignedToEmployeeId: empId,
        assignedEmployeeName: affecteA || undefined,
      };

      newScreens.push(screenObj);
      addedCount++;
    }

    if (newScreens.length > 0) {
      setScreens(newScreens);
      addAuditEntry({
        action: 'IMPORT_CSV',
        itemType: 'ECRAN',
        itemId: 'import-csv',
        itemLabel: `Import de ${newScreens.length} écrans depuis fichier CSV / Excel`,
        performedBy: user?.name || 'Administrateur IT',
        condition: 'EXCELLENT',
        notes: `Importation réussie : ${newScreens.length} fiches synchronisées.`,
      });
    }

    return { added: addedCount, updated: updatedCount };
  };

  const distributeAccessory = (
    accessoryId: string,
    employeeId: string,
    quantity: number,
    notes?: string
  ) => {
    const acc = accessories.find((a) => a.id === accessoryId);
    const emp = getEmployeeById(employeeId);
    if (!acc || !emp || acc.inStockQuantity < quantity) return;

    setAccessories((prev) =>
      prev.map((a) =>
        a.id === accessoryId
          ? { ...a, inStockQuantity: a.inStockQuantity - quantity }
          : a
      )
    );

    addAuditEntry({
      action: 'ATTRIBUTION',
      itemType: 'ACCESSOIRE',
      itemId: acc.id,
      itemLabel: `${quantity}x ${acc.name} (${acc.brand})`,
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      performedBy: user?.name || 'Administrateur',
      condition: 'NEUF',
      notes: notes || `Remise de ${quantity} exemplaire(s).`,
    });
  };

  const addAccessory = (accData: Omit<Accessory, 'id'>) => {
    const newAcc: Accessory = {
      ...accData,
      id: `acc-${Date.now()}`,
    };
    setAccessories((prev) => [newAcc, ...prev]);
  };

  const adjustAccessoryStock = (accessoryId: string, newStock: number) => {
    setAccessories((prev) =>
      prev.map((a) => (a.id === accessoryId ? { ...a, inStockQuantity: newStock } : a))
    );
  };

  const deleteAccessory = (id: string) => {
    setAccessories((prev) => prev.filter((a) => a.id !== id));
  };

  const assignLicenseSeat = (licenseId: string, employeeId: string) => {
    const lic = licenses.find((l) => l.id === licenseId);
    const emp = getEmployeeById(employeeId);
    if (!lic || !emp || lic.assignedEmployeeIds.includes(employeeId)) return;
    if (lic.usedSeats >= lic.totalSeats) return;

    setLicenses((prev) =>
      prev.map((l) =>
        l.id === licenseId
          ? {
              ...l,
              usedSeats: l.usedSeats + 1,
              assignedEmployeeIds: [...l.assignedEmployeeIds, employeeId],
            }
          : l
      )
    );

    addAuditEntry({
      action: 'ATTRIBUTION',
      itemType: 'LICENCE',
      itemId: lic.id,
      itemLabel: `${lic.name} (${lic.vendor})`,
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      performedBy: user?.name || 'Administrateur',
      condition: 'NEUF',
      notes: 'Affectation d’un siège de licence logicielle.',
    });
  };

  const revokeLicenseSeat = (licenseId: string, employeeId: string) => {
    const lic = licenses.find((l) => l.id === licenseId);
    const emp = getEmployeeById(employeeId);
    if (!lic) return;

    setLicenses((prev) =>
      prev.map((l) =>
        l.id === licenseId
          ? {
              ...l,
              usedSeats: Math.max(0, l.usedSeats - 1),
              assignedEmployeeIds: l.assignedEmployeeIds.filter((id) => id !== employeeId),
            }
          : l
      )
    );

    addAuditEntry({
      action: 'RESTITUTION',
      itemType: 'LICENCE',
      itemId: lic.id,
      itemLabel: `${lic.name} (${lic.vendor})`,
      employeeId: emp?.id,
      employeeName: emp ? `${emp.firstName} ${emp.lastName}` : undefined,
      performedBy: user?.name || 'Administrateur',
      condition: 'NEUF',
      notes: 'Libération d’un siège de licence logicielle.',
    });
  };

  const addLicense = (licenseData: Omit<SoftwareLicense, 'id' | 'usedSeats'>) => {
    const newLic: SoftwareLicense = {
      ...licenseData,
      id: `lic-${Date.now()}`,
      usedSeats: licenseData.assignedEmployeeIds?.length || 0,
    };
    setLicenses((prev) => [newLic, ...prev]);
  };

  const deleteLicense = (id: string) => {
    setLicenses((prev) => prev.filter((l) => l.id !== id));
  };

  const addEmployee = (employeeData: Omit<Employee, 'id'>) => {
    const newEmp: Employee = {
      ...employeeData,
      id: `emp-${Date.now()}`,
    };
    setEmployees((prev) => [newEmp, ...prev]);
  };

  const updateEmployeeField = (employeeId: string, field: keyof Employee, value: any) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === employeeId ? { ...e, [field]: value } : e))
    );
  };

  const deleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  const addGeneralEquipment = (equipmentData: Omit<GeneralEquipment, 'id'>) => {
    const newEq: GeneralEquipment = {
      ...equipmentData,
      id: `eq-${Date.now()}`,
    };
    setGeneralEquipments((prev) => [newEq, ...prev]);

    addAuditEntry({
      action: 'CREATION',
      itemType: 'EQUIPEMENT',
      itemId: newEq.id,
      itemLabel: `${newEq.name} (${newEq.tag})`,
      serialNumber: newEq.serialNumber,
      performedBy: user?.name || 'Administrateur',
      condition: 'NEUF',
      notes: `Ajout au parc : ${newEq.location}`,
    });
  };

  const updateGeneralEquipmentField = (
    id: string,
    field: keyof GeneralEquipment,
    value: any
  ) => {
    setGeneralEquipments((prev) =>
      prev.map((eq) => (eq.id === id ? { ...eq, [field]: value } : eq))
    );
  };

  const updateGeneralEquipmentStatus = (
    id: string,
    status: EquipmentStatus,
    notes?: string
  ) => {
    const eq = generalEquipments.find((e) => e.id === id);
    if (!eq) return;

    setGeneralEquipments((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status } : e))
    );

    addAuditEntry({
      action:
        status === 'EN_REPARATION'
          ? 'MAINTENANCE'
          : status === 'REBUT'
          ? 'DECLASSEMENT'
          : 'ATTRIBUTION',
      itemType: 'EQUIPEMENT',
      itemId: eq.id,
      itemLabel: `${eq.name} (${eq.tag})`,
      serialNumber: eq.serialNumber,
      performedBy: user?.name || 'Administrateur',
      condition:
        status === 'REBUT'
          ? 'DEGRADE'
          : status === 'EN_REPARATION'
          ? 'USAGE'
          : 'BON_ETAT',
      notes: notes || `Mise à jour statut équipement vers ${status}`,
    });
  };

  const deleteGeneralEquipment = (id: string) => {
    setGeneralEquipments((prev) => prev.filter((eq) => eq.id !== id));
  };

  const getEquipmentForEmployee = (employeeId: string) => {
    return {
      computers: computers.filter((c) => c.assignedToEmployeeId === employeeId),
      screens: screens.filter(
        (s) =>
          s.assignedToEmployeeId === employeeId ||
          (s.assignedEmployeeName &&
            employees.find((e) => e.id === employeeId)?.firstName &&
            s.assignedEmployeeName.includes(employees.find((e) => e.id === employeeId)!.firstName))
      ),
      licenses: licenses.filter((l) => l.assignedEmployeeIds.includes(employeeId)),
    };
  };

  return (
    <InventoryContext.Provider
      value={{
        user,
        login,
        logout,
        theme,
        toggleTheme,
        computers,
        screens,
        accessories,
        licenses,
        employees,
        auditLogs,
        generalEquipments,
        assignComputer,
        returnComputer,
        updateComputerStatus,
        updateComputerField,
        addComputer,
        deleteComputer,
        assignScreen,
        returnScreen,
        updateScreenField,
        addScreen,
        deleteScreen,
        importScreensFromCsv,
        distributeAccessory,
        addAccessory,
        adjustAccessoryStock,
        deleteAccessory,
        assignLicenseSeat,
        revokeLicenseSeat,
        addLicense,
        deleteLicense,
        addEmployee,
        updateEmployeeField,
        deleteEmployee,
        addGeneralEquipment,
        updateGeneralEquipmentField,
        updateGeneralEquipmentStatus,
        deleteGeneralEquipment,
        resetToEcoPilotData,
        getEmployeeById,
        getEquipmentForEmployee,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
