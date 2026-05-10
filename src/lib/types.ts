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

export interface Location {
  id: string;
  name: string;
  building: string;
  floor: string;
  description: string;
  deviceCount: number;
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
