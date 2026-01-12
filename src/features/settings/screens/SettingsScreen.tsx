import { queryClient } from '@app/AppProviders';
import { authApi } from '@features/auth/api/auth.api';
import { useNavigation } from '@react-navigation/native';
import { useActiveProfileStore } from '@store/activeProfile.store';
import { useSessionStore } from '@store/session.store';
import Constants from 'expo-constants';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAccountMe } from '../hooks/useAccountMe';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { data: account, isLoading, error } = useAccountMe();
  const { refreshToken, clearSession } = useSessionStore();
  const { clearActiveProfile } = useActiveProfileStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const performLogout = async () => {
    setIsLoggingOut(true);
    try {
      console.log('[Logout] Starting logout process...');
      
      // 1. First, invalidate token on backend (this is important for security)
      if (refreshToken) {
        try {
          await authApi.logout({ refreshToken });
          console.log('[Logout] API logout successful');
        } catch (error) {
          // Log but continue - local logout should still proceed
          console.error('[Logout] API logout failed, continuing with local logout:', error);
        }
      }
      
      // 2. Clear React Query cache - remove all queries completely
      // Using removeQueries() with no filters removes ALL queries from cache
      queryClient.removeQueries();
      console.log('[Logout] React Query cache cleared');
      
      // 3. Clear active profile store (SecureStore/localStorage + Zustand state)
      try {
        await clearActiveProfile();
        console.log('[Logout] Active profile cleared');
      } catch (error) {
        console.error('[Logout] Error clearing active profile:', error);
      }
      
      // 4. Clear session store (tokens from SecureStore/localStorage + Zustand state)
      try {
        await clearSession();
        console.log('[Logout] Session cleared');
      } catch (error) {
        console.error('[Logout] Error clearing session:', error);
      }
      
      // 5. Reset query client to ensure no stale data remains
      queryClient.resetQueries();
      console.log('[Logout] Logout complete. Navigation should happen automatically.');
    } catch (error) {
      // If anything fails, still try to clear local storage
      console.error('[Logout] Error during logout:', error);
      try {
        await clearActiveProfile();
        await clearSession();
      } catch (clearError) {
        console.error('[Logout] Error during fallback logout clearing:', clearError);
      }
    } finally {
      setIsLoggingOut(false);
      // Navigation will be handled by RootNavigator when accessToken becomes null
      // This will automatically redirect to PhoneInputScreen via AuthNavigator
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      // Use browser's confirm dialog on web
      if (typeof window !== 'undefined' && window.confirm('Are you sure you want to logout?')) {
        performLogout();
      }
    } else {
      // Use Alert.alert on native
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: performLogout,
          },
        ]
      );
    }
  };

  const handleUpdateAccountInfo = () => {
    navigation.navigate('AccountInfo' as never);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" />
            <Text style={styles.loadingText}>Loading account...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load account information</Text>
          </View>
        ) : account ? (
          <>
            <View style={styles.accountCard}>
              {account.fullName && (
                <Text style={styles.accountName}>{account.fullName}</Text>
              )}
              <Text style={[styles.accountPhone, !account.email && styles.accountPhoneLast]}>
                {account.phone}
              </Text>
              {account.email && (
                <Text style={styles.accountEmail}>{account.email}</Text>
              )}
            </View>
            <TouchableOpacity style={styles.settingRow} onPress={handleUpdateAccountInfo}>
              <Text style={styles.settingLabel}>Update Account Info</Text>
              <Text style={styles.settingValue}>›</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <TouchableOpacity style={styles.settingRow} disabled>
          <Text style={styles.settingLabel}>Language</Text>
          <Text style={styles.settingValue}>English</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingRow} disabled>
          <Text style={styles.settingLabel}>Notifications</Text>
          <Text style={styles.settingValue}>Configure</Text>
        </TouchableOpacity>
      </View>

      {/* Privacy & Security Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Security</Text>
        <TouchableOpacity style={styles.settingRow} disabled>
          <Text style={styles.settingLabel}>Consent & Access Logs</Text>
          <Text style={styles.settingValue}>Coming in v1.0</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingRow} disabled>
          <Text style={styles.settingLabel}>Data Export</Text>
          <Text style={styles.settingValue}>Coming soon</Text>
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>App Version</Text>
          <Text style={styles.settingValue}>
            {Constants.expoConfig?.version || '1.0.0'}
          </Text>
        </View>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.logoutButtonText}>Logout</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: 20,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#8E8E93',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
  },
  accountCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  accountPhone: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 4,
  },
  accountPhoneLast: {
    marginBottom: 0,
  },
  accountEmail: {
    fontSize: 14,
    color: '#8E8E93',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
    color: '#000000',
  },
  settingValue: {
    fontSize: 14,
    color: '#8E8E93',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    width: "100%",
    textAlign: "center"
  },
});
