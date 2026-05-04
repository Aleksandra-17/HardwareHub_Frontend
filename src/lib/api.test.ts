import { describe, it, expect } from 'vitest';
import { api } from './api';

describe('api', () => {
  it('has auth methods', () => {
    expect(typeof api.login).toBe('function');
    expect(typeof api.refresh).toBe('function');
    expect(typeof api.logout).toBe('function');
    expect(typeof api.getMe).toBe('function');
  });

  it('has locations CRUD methods', () => {
    expect(typeof api.getLocations).toBe('function');
    expect(typeof api.createLocation).toBe('function');
    expect(typeof api.deleteLocation).toBe('function');
  });

  it('has people CRUD methods', () => {
    expect(typeof api.getPeople).toBe('function');
    expect(typeof api.createPerson).toBe('function');
    expect(typeof api.deletePerson).toBe('function');
  });

  it('has device methods', () => {
    expect(typeof api.getDevices).toBe('function');
    expect(typeof api.getDevice).toBe('function');
    expect(typeof api.createDevice).toBe('function');
    expect(typeof api.updateDevice).toBe('function');
    expect(typeof api.deleteDevice).toBe('function');
    expect(typeof api.getDeviceAudit).toBe('function');
  });

  it('has device types and reports', () => {
    expect(typeof api.getDeviceTypes).toBe('function');
    expect(typeof api.exportDevices).toBe('function');
    expect(typeof api.generateInventoryReport).toBe('function');
  });
});
