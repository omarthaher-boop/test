import { create } from 'zustand';
import { User } from '../types';
import { storageService } from '../services/storage.service';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  biometricEnabled: boolean;
  gdprConsented: boolean;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  setAuth: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
  setBiometricEnabled: (enabled: boolean) => void;
  setGdprConsented: (consented: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  biometricEnabled: false,
  gdprConsented: false,
  isInitialized: false,

  initialize: async () => {
    const [accessToken, refreshToken, biometricEnabled, gdprConsented] = await Promise.all([
      storageService.getAccessToken(),
      storageService.getRefreshToken(),
      storageService.get('biometric_enabled'),
      storageService.get('gdpr_consented'),
    ]);

    // Fetch user if we have tokens
    if (accessToken && refreshToken) {
      try {
        const { userApi } = await import('../api/user');
        const res = await userApi.getMe();
        set({
          user: res.data.data,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          biometricEnabled: biometricEnabled === 'true',
          gdprConsented: gdprConsented === 'true',
          isInitialized: true,
        });
      } catch {
        // Token invalid — clear and start fresh
        await storageService.clearTokens();
        set({ isInitialized: true });
      }
    } else {
      set({
        biometricEnabled: biometricEnabled === 'true',
        gdprConsented: gdprConsented === 'true',
        isInitialized: true,
      });
    }
  },

  setAuth: async (user, accessToken, refreshToken) => {
    await storageService.setTokens(accessToken, refreshToken);
    set({ user, accessToken, refreshToken, isAuthenticated: true });
  },

  setUser: (user) => set({ user }),

  logout: async () => {
    const { refreshToken } = get();
    try {
      if (refreshToken) {
        const { authApi } = await import('../api/auth');
        await authApi.logout(refreshToken);
      }
    } catch {
      // Best-effort logout
    }
    await storageService.clearTokens();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  setBiometricEnabled: (enabled) => {
    storageService.set('biometric_enabled', String(enabled));
    set({ biometricEnabled: enabled });
  },

  setGdprConsented: (consented) => {
    storageService.set('gdpr_consented', String(consented));
    set({ gdprConsented: consented });
  },
}));
