export type DeviceStatus = 'in_use' | 'reserve' | 'decommissioned' | 'repair';

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
  deviceTypeId: string;
  serialNumber: string;
  model: string;
  manufacturer: string;
  status: DeviceStatus;
  locationId: string;
  personId: string;
  commissionDate: string;
  lastCheckDate: string;
  notes: string;
  purchasePrice: number;
  purchaseDate: string;
  qrCode: string;
}

export interface AuditEntry {
  id: string;
  date: string;
  action: string;
  user: string;
}
