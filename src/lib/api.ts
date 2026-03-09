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
  getLocations: () => request('/locations'),
  createLocation: (data: Record<string, unknown>) =>
    request('/locations', { method: 'POST', body: JSON.stringify(data) }),
  deleteLocation: (id: string) =>
    request(`/locations/${id}`, { method: 'DELETE' }),

  // People
  getPeople: () => request('/people'),
  createPerson: (data: Record<string, unknown>) =>
    request('/people', { method: 'POST', body: JSON.stringify(data) }),
  deletePerson: (id: string) =>
    request(`/people/${id}`, { method: 'DELETE' }),

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
    return request(`/devices${qs ? '?' + qs : ''}`);
  },

  getDevice: (id: string) => request(`/devices/${id}`),

  createDevice: (data: Record<string, unknown>) =>
    request('/devices', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateDevice: (id: string, data: Record<string, unknown>) =>
    request(`/devices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteDevice: (id: string) =>
    request(`/devices/${id}`, {
      method: 'DELETE',
    }),

  getDeviceAudit: (id: string) => request(`/devices/${id}/audit`),

  generateQRCode: (id: string) =>
    request(`/devices/${id}/qr-code`, {
      method: 'POST',
    }),

  // Reports
  exportDevices: (format: 'csv' | 'xlsx', params?: { locationId?: string; personId?: string }) =>
    request('/reports/devices/export', {
      method: 'POST',
      body: JSON.stringify({ format, ...params }),
    }),

  generateInventoryReport: (data: Record<string, unknown>) =>
    request('/reports/inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Health
  health: () => request('/root/health'),
};

export { ApiError };
