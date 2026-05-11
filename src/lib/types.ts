/** Совпадает с DeviceStatus в API (Alembic / Pydantic). */
export type DeviceStatus = 'in_use' | 'repair' | 'scrapped' | 'archived';

export interface DeviceType {
  id: string;
  name: string;
  code: string;
  category: 'computing' | 'office' | 'network' | 'other';
  description: string;
  deviceCount: number;
}

export interface WorkstationRequirement {
  id: string;
  deviceTypeId: string;
  deviceTypeName?: string;
  quantity: number;
}

export interface Workstation {
  id: string;
  locationId: string;
  seatCode: string;
  employeeInternalEmail: string | null;
  requirements: WorkstationRequirement[];
}

export interface Location {
  id: string;
  name: string;
  building: string | null;
  floor: string | null;
  description: string | null;
  /** Плановое число рабочих мест в кабинете */
  workstationCapacity: number;
  deviceCount: number;
  /** Устройства с типом категории computing (ПК, ноутбук и т.п.) */
  computingDeviceCount: number;
  /** Сколько не хватает до плана (если план > 0) */
  workstationDeficit: number;
  needsEquipment: boolean;
}

export interface Person {
  id: string;
  fullName: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  deviceCount: number;
}

export interface License {
  id: string;
  name: string;
  price: number | string;
  expiresAt: string;
  details?: string | null;
}

export interface Device {
  id: string;
  inventoryNumber: string;
  name: string;
  deviceTypeId: string | null;
  serialNumber: string | null;
  model: string | null;
  manufacturer: string | null;
  status: DeviceStatus;
  locationId: string | null;
  workstationId?: string | null;
  workstationSeatCode?: string | null;
  personId: string | null;
  commissionDate: string | null;
  lastCheckDate: string | null;
  notes: string | null;
  purchasePrice: number | string | null;
  purchaseDate: string | null;
  qrCode: string | null;
}

export interface AuditEntry {
  id: string;
  date: string;
  action: string;
  user: string;
}
