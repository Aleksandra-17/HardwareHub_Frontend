import { describe, it, expect, beforeEach, vi } from 'vitest';
import { auth } from './auth';

const storage: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => storage[key] ?? null,
  setItem: (key: string, val: string) => { storage[key] = val; },
  removeItem: (key: string) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); },
  length: 0,
  key: () => null,
};

describe('auth', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', localStorageMock);
    delete storage.access_token;
    delete storage.refresh_token;
  });

  it('setTokens stores tokens', () => {
    auth.setTokens('at', 'rt');
    expect(auth.getAccessToken()).toBe('at');
    expect(auth.getRefreshToken()).toBe('rt');
  });

  it('clearTokens removes tokens', () => {
    auth.setTokens('at', 'rt');
    auth.clearTokens();
    expect(auth.getAccessToken()).toBeNull();
    expect(auth.getRefreshToken()).toBeNull();
  });

  it('isAuthenticated returns true when access_token exists', () => {
    auth.setTokens('at', 'rt');
    expect(auth.isAuthenticated()).toBe(true);
  });

  it('isAuthenticated returns false when no token', () => {
    auth.clearTokens();
    expect(auth.isAuthenticated()).toBe(false);
  });
});
