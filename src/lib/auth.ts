import { api } from './api';

const STORAGE_KEY_ACCESS = 'access_token';
const STORAGE_KEY_REFRESH = 'refresh_token';

export const auth = {
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(STORAGE_KEY_ACCESS, accessToken);
    localStorage.setItem(STORAGE_KEY_REFRESH, refreshToken);
  },

  getAccessToken: () => localStorage.getItem(STORAGE_KEY_ACCESS),

  getRefreshToken: () => localStorage.getItem(STORAGE_KEY_REFRESH),

  clearTokens: () => {
    localStorage.removeItem(STORAGE_KEY_ACCESS);
    localStorage.removeItem(STORAGE_KEY_REFRESH);
  },

  isAuthenticated: () => !!localStorage.getItem(STORAGE_KEY_ACCESS),

  async login(username: string, password: string) {
    const result = await api.login(username, password);
    this.setTokens(result.access_token, result.refresh_token);
    return result;
  },

  async refreshTokens() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');
    const result = await api.refresh(refreshToken);
    this.setTokens(result.access_token, result.refresh_token);
    return result;
  },

  async logout() {
    const refreshToken = this.getRefreshToken();
    try {
      await api.logout(refreshToken);
    } finally {
      this.clearTokens();
    }
  },
};
