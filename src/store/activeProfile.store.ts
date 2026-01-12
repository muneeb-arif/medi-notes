import { profilesApi } from '@features/profiles/api/profiles.api';
import type { PersonProfile } from '@features/profiles/types';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';

interface ActiveProfileState {
  activeProfileId: string | null;
  setActiveProfileId: (profileId: string | null) => Promise<void>;
  clearActiveProfile: () => Promise<void>;
  hydrate: () => Promise<void>;
  ensureDefaultProfile: () => Promise<void>;
}

const ACTIVE_PROFILE_KEY = 'active_profile_id';

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

export const useActiveProfileStore = create<ActiveProfileState>((set, get) => ({
  activeProfileId: null,

  setActiveProfileId: async (profileId: string | null) => {
    if (profileId) {
      await storage.setItem(ACTIVE_PROFILE_KEY, profileId);
    } else {
      await storage.deleteItem(ACTIVE_PROFILE_KEY);
    }
    set({ activeProfileId: profileId });
  },

  clearActiveProfile: async () => {
    await storage.deleteItem(ACTIVE_PROFILE_KEY);
    set({ activeProfileId: null });
  },

  hydrate: async () => {
    try {
      const profileId = await storage.getItem(ACTIVE_PROFILE_KEY);
      set({ activeProfileId: profileId });
    } catch {
      set({ activeProfileId: null });
    }
  },

  ensureDefaultProfile: async () => {
    try {
      const profilesResponse = await profilesApi.list();
      const profiles = profilesResponse.items || [];

      if (profiles.length === 0) {
        return;
      }

      const currentActiveProfileId = get().activeProfileId;

      // Check if current active profile still exists
      const currentProfileExists = currentActiveProfileId
        ? profiles.some((p) => p.id === currentActiveProfileId)
        : false;

      // If active profile is set and exists, no need to change
      if (currentProfileExists) {
        return;
      }

      // Select profile based on priority:
      // 1. isDefault === true or is_default === true
      // 2. name === "General"
      // 3. First profile in list
      let selectedProfile: PersonProfile | null = null;

      selectedProfile =
        profiles.find(
          (p) => p.isDefault === true || p.is_default === true
        ) || null;

      if (!selectedProfile) {
        selectedProfile =
          profiles.find((p) => p.name === 'General') || null;
      }

      if (!selectedProfile && profiles.length > 0) {
        selectedProfile = profiles[0];
      }

      if (selectedProfile) {
        await get().setActiveProfileId(selectedProfile.id);
      }
    } catch {
      // Silently fail - profile selection is not critical
    }
  },
}));

