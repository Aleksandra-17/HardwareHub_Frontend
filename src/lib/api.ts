import type { Component, Device, License, Location, Workstation } from '@/lib/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const accessToken = localStorage.getItem('access_token');
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new ApiError(response.status, errorData.detail || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/** POST-запрос с бинарным ответом (экспорт отчётов). */
async function downloadReportFile(
  endpoint: string,
  body: Record<string, unknown>,
): Promise<{ blob: Blob; filename: string }> {
  const url = `${API_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const accessToken = localStorage.getItem('access_token');
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new ApiError(response.status, errorData.detail || `HTTP ${response.status}`);
  }
  const dispo = response.headers.get('Content-Disposition');
  let filename = 'export';
  if (dispo) {
    const m = /filename="([^"]+)"/.exec(dispo) ?? /filename=([^;\s]+)/.exec(dispo);
    if (m) filename = m[1].replace(/"/g, '');
  }
  const blob = await response.blob();
  return { blob, filename };
}

export function saveReportBlob(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(objectUrl);
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    request<{ access_token: string; refresh_token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  refresh: (refreshToken: string) =>
    request<{ access_token: string; refresh_token: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  logout: (refreshToken?: string) =>
    request('/auth/logout', {
      method: 'POST',
      body: refreshToken ? JSON.stringify({ refresh_token: refreshToken }) : undefined,
    }),

  getMe: () => request('/auth/me'),

  // Device Types
  getDeviceTypes: () => request('/device-types'),
  createDeviceType: (data: Record<string, unknown>) =>
    request('/device-types', { method: 'POST', body: JSON.stringify(data) }),

  // Locations
  getLocations: () => request('/locations') as Promise<Location[]>,
  createLocation: (data: Record<string, unknown>) =>
    request('/locations', { method: 'POST', body: JSON.stringify(data) }),
  updateLocation: (id: string, data: Record<string, unknown>) =>
    request(`/locations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteLocation: (id: string) =>
    request(`/locations/${id}`, { method: 'DELETE' }),

  getWorkstations: (locationId: string) =>
    request(`/workstations?locationId=${encodeURIComponent(locationId)}`) as Promise<Workstation[]>,
  createWorkstation: (data: Record<string, unknown>) =>
    request('/workstations', { method: 'POST', body: JSON.stringify(data) }),
  updateWorkstation: (id: string, data: Record<string, unknown>) =>
    request(`/workstations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteWorkstation: (id: string) =>
    request(`/workstations/${id}`, { method: 'DELETE' }),

  // People
  getPeople: () => request('/people'),
  createPerson: (data: Record<string, unknown>) =>
    request('/people', { method: 'POST', body: JSON.stringify(data) }),
  deletePerson: (id: string) =>
    request(`/people/${id}`, { method: 'DELETE' }),

  // Licenses
  getLicenses: () => request('/licenses') as Promise<License[]>,
  createLicense: (data: Record<string, unknown>) =>
    request('/licenses', { method: 'POST', body: JSON.stringify(data) }),
  updateLicense: (id: string, data: Record<string, unknown>) =>
    request(`/licenses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteLicense: (id: string) =>
    request(`/licenses/${id}`, { method: 'DELETE' }),

  // Devices
  getDevices: (params?: {
    search?: string;
    status?: string;
    type?: string;
    location?: string;
    person?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }) => {
    const queryString = new URLSearchParams();
    if (params?.search) queryString.append('search', params.search);
    if (params?.status) queryString.append('status', params.status);
    if (params?.type) queryString.append('type', params.type);
    if (params?.location) queryString.append('location', params.location);
    if (params?.person) queryString.append('person', params.person);
    if (params?.sort) queryString.append('sort', params.sort);
    if (params?.order) queryString.append('order', params.order);
    const qs = queryString.toString();
    return request<Device[]>(`/devices${qs ? '?' + qs : ''}`);
  },

  getDevice: (id: string) => request<Device>(`/devices/${id}`),

  createDevice: (data: Record<string, unknown>) =>
    request('/devices', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateDevice: (id: string, data: Record<string, unknown>) =>
    request<Device>(`/devices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  rebuildDevice: (id: string, items: Array<{ componentId: string; componentType: string }>) =>
    request(`/devices/${id}/rebuild`, {
      method: 'POST',
      body: JSON.stringify({ items }),
    }),

  deleteDevice: (id: string) =>
    request(`/devices/${id}`, {
      method: 'DELETE',
    }),

  getDeviceAudit: (id: string) => request(`/devices/${id}/audit`),

  generateQRCode: (id: string) =>
    request<{ qrCode: string }>(`/devices/${id}/qr-code`, {
      method: 'POST',
    }),

  // Reports
  downloadDevicesExport: (format: 'csv' | 'xlsx', params?: { locationId?: string; personId?: string }) =>
    downloadReportFile('/reports/devices/export', { format, ...params }),

  downloadLicensesExport: (format: 'csv' | 'xlsx') =>
    downloadReportFile('/reports/licenses/export', { format }),

  downloadComponentsExport: (format: 'csv' | 'xlsx', params?: { locationId?: string }) =>
    downloadReportFile('/reports/components/export', { format, ...params }),

  generateInventoryReport: (data: Record<string, unknown>) =>
    request('/reports/inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Components
  getComponents: (params?: { computerId?: string }) => {
    const queryString = new URLSearchParams();
    if (params?.computerId) queryString.append('computerId', params.computerId);
    const qs = queryString.toString();
    return request<Component[]>(`/components${qs ? '?' + qs : ''}`);
  },
  createComponent: (data: Record<string, unknown>) =>
    request('/components', { method: 'POST', body: JSON.stringify(data) }),
  updateComponent: (id: string, data: Record<string, unknown>) =>
    request(`/components/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteComponent: (id: string) =>
    request(`/components/${id}`, { method: 'DELETE' }),
  attachComponent: (id: string, computerId: string) =>
    request(`/components/${id}/attach`, {
      method: 'POST',
      body: JSON.stringify({ computerId }),
    }),
  detachComponent: (id: string) =>
    request(`/components/${id}/detach`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  // Health
  health: () => request('/root/health'),
};

export { ApiError };
