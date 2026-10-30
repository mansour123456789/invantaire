export type EquipmentStatus = 'DISPONIBLE' | 'AFFECTE' | 'EN_REPARATION' | 'REBUT';

export type ComputerType = 'LAPTOP' | 'DESKTOP' | 'SERVER';

export interface Computer {
  id: string;
  tag: string; // Ex: PC-001
  type: ComputerType;
  brand: string;
  model: string;
  serialNumber: string;
  processor: string;
  ram: string; // Ex: "32 Go"
  storage: string; // Ex: "1 To NVMe"
  purchaseDate: string;
  warrantyUntil: string;
  status: EquipmentStatus;
  assignedToEmployeeId?: string;
  assignedEmployeeName?: string;
  location?: string;
  notes?: string;
  price?: number; // Prix d'achat unitaire (€)
}

export interface Screen {
  id: string;
  tag: string; // Ex: EC-1, EC-2...
  brand: string;
  model: string;
  sizeInch?: number;
  resolution?: string;
  characteristics?: string;
  year?: number;
  serialNumber: string;
  hasUsbCHub?: boolean;
  status: EquipmentStatus;
  assignedToEmployeeId?: string;
  assignedEmployeeName?: string;
  deskLocation?: string;
  price?: number; // Prix d'achat unitaire (€)
}

export type AccessoryCategory = 'SOURIS' | 'CLAVIER' | 'CASQUE' | 'DOCK_USB_C' | 'ADAPTATEUR' | 'WEBCAM';

export interface Accessory {
  id: string;
  name: string;
  category: AccessoryCategory;
  brand: string;
  model: string;
  totalQuantity: number;
  inStockQuantity: number;
  alertThreshold: number;
  unitCost: number;
  price?: number; // Prix d'achat unitaire (€)
}


export interface SoftwareLicense {
  id: string;
  name: string;
  vendor: string;
  licenseKey: string;
  type: 'ABONNEMENT' | 'PERPETUELLE';
  totalSeats: number;
  usedSeats: number;
  expirationDate: string;
  costPerYear: number;
  assignedEmployeeIds: string[];
}

export interface Employee {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  roleTitle: string;
  arrivalDate: string;
}

export type GeneralEquipmentCategory =
  | 'ELECTROMENAGER'
  | 'BUREAUTIQUE'
  | 'AUDIOVISUEL'
  | 'MOBILIER'
  | 'CONFORT'
  | 'AUTRE';

export interface GeneralEquipment {
  id: string;
  tag: string; // Ex: EQ-001, MC-01
  name: string; // Ex: Machine à café De'Longhi Magnifica
  category: GeneralEquipmentCategory;
  brand: string;
  model: string;
  serialNumber?: string;
  location: string; // Ex: "Cuisine RDC", "Salle Réunion A", "Espace Détente"
  status: EquipmentStatus;
  purchaseDate?: string;
  warrantyUntil?: string;
  assignedResponsible?: string; // Responsable / référent
  maintenanceNotes?: string;
  cost?: number;
}

export type TraceabilityAction =
  | 'ATTRIBUTION'
  | 'RESTITUTION'
  | 'MAINTENANCE'
  | 'DECLASSEMENT'
  | 'CREATION'
  | 'IMPORT_CSV';

export type EquipmentCondition = 'NEUF' | 'EXCELLENT' | 'BON_ETAT' | 'USAGE' | 'DEGRADE';

export interface AuditLog {
  id: string;
  timestamp: string;
  action: TraceabilityAction;
  itemType: 'PC' | 'ECRAN' | 'ACCESSOIRE' | 'LICENCE' | 'EQUIPEMENT';
  itemId: string;
  itemLabel: string;
  serialNumber?: string;
  employeeId?: string;
  employeeName?: string;
  performedBy: string;
  condition: EquipmentCondition;
  notes?: string;
  dischargeNumber?: string;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'GESTIONNAIRE' | 'TECHNICIEN';
}

