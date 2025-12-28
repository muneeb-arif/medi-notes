import { authApi } from '@features/auth/api/auth.api';
import { profilesApi } from '@features/profiles/api/profiles.api';
import { useActiveProfileStore } from '@store/activeProfile.store';
import { useSessionStore } from '@store/session.store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Placeholder - theme implementation will be added later
  return <>{children}</>;
};

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  const { hydrate, accessToken, refreshToken, setAccount, setTokens, clearSession } = useSessionStore();
  const { hydrate: hydrateActiveProfile, setActiveProfileId, activeProfileId } = useActiveProfileStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeSession = async () => {
      await hydrate();
      await hydrateActiveProfile();

      const currentAccessToken = useSessionStore.getState().accessToken;
      const currentRefreshToken = useSessionStore.getState().refreshToken;

      if (currentAccessToken && currentRefreshToken) {
        try {
          const account = await authApi.getCurrentAccount();
          setAccount(account);
          
          // Auto-select first profile if no active profile is set
          const currentActiveProfileId = useActiveProfileStore.getState().activeProfileId;
          if (!currentActiveProfileId) {
            try {
              const profiles = await profilesApi.list();
              if (profiles.items && profiles.items.length > 0) {
                await setActiveProfileId(profiles.items[0].id);
              }
            } catch {
              // Silently fail - profile selection is not critical for app initialization
            }
          }
        } catch (error) {
          const apiError = error as { status?: number };
          if (apiError.status === 401 && currentRefreshToken) {
            try {
              const newTokens = await authApi.refreshToken({ refreshToken: currentRefreshToken });
              await setTokens(newTokens);
              const account = await authApi.getCurrentAccount();
              setAccount(account);
              
              // Auto-select first profile if no active profile is set
              const currentActiveProfileId = useActiveProfileStore.getState().activeProfileId;
              if (!currentActiveProfileId) {
                try {
                  const profiles = await profilesApi.list();
                  if (profiles.items && profiles.items.length > 0) {
                    await setActiveProfileId(profiles.items[0].id);
                  }
                } catch {
                  // Silently fail - profile selection is not critical for app initialization
                }
              }
            } catch {
              await clearSession();
            }
          } else {
            await clearSession();
          }
        }
      }

      setIsInitializing(false);
    };

    initializeSession();
  }, [hydrate, setAccount, setTokens, clearSession]);

  if (isInitializing) {
    return null;
  }

  // SafeAreaProvider automatically detects safe areas from the device
  // You can optionally provide initialMetrics to override or set minimum insets:
  //
  // Example: Set minimum top inset (e.g., for custom status bar handling)
  const customMetrics = {
    insets: {
      top: 44,      // Set minimum top spacing (e.g., iOS status bar height)
      bottom: 34,   // Set minimum bottom spacing (e.g., home indicator area)
      left: initialWindowMetrics?.insets?.left || 0,   // Keep auto-detected
      right: initialWindowMetrics?.insets?.right || 0, // Keep auto-detected
    },
    frame: initialWindowMetrics?.frame || { x: 0, y: 0, width: 0, height: 0 },
  };

  return (
    <SafeAreaProvider initialMetrics={customMetrics}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>{children}</ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};
