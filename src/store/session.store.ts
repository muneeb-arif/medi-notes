import type { Account, Tokens } from '@features/auth/types';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';

interface SessionState {
  accessToken: string | null;
  refreshToken: string | null;
  account: Account | null;
  isHydrated: boolean;
  setTokens: (tokens: Tokens) => Promise<void>;
  setAccount: (account: Account) => void;
  clearSession: () => Promise<void>;
  hydrate: () => Promise<void>;
}

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

// Storage helpers that work on both native and web
const storage = {
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },
  deleteItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

export const useSessionStore = create<SessionState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  account: null,
  isHydrated: false,

  setTokens: async (tokens: Tokens) => {
    await storage.setItem(TOKEN_KEYS.ACCESS_TOKEN, tokens.accessToken);
    await storage.setItem(TOKEN_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  },

  setAccount: (account: Account) => {
    set({ account });
  },

  clearSession: async () => {
    await storage.deleteItem(TOKEN_KEYS.ACCESS_TOKEN);
    await storage.deleteItem(TOKEN_KEYS.REFRESH_TOKEN);
    set({
      accessToken: null,
      refreshToken: null,
      account: null,
    });
  },

  hydrate: async () => {
    try {
      const accessToken = await storage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
      const refreshToken = await storage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
      set({
        accessToken,
        refreshToken,
        isHydrated: true,
      });
    } catch (error) {
      // If secure storage fails, clear state
      set({
        accessToken: null,
        refreshToken: null,
        account: null,
        isHydrated: true,
      });
    }
  },
}));

