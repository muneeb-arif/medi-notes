import { AccountInfoScreen } from '@features/auth/screens/AccountInfoScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSessionStore } from '@store/session.store';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AppNavigator } from './AppNavigator';
import { AuthNavigator } from './AuthNavigator';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const { accessToken, account, isHydrated } = useSessionStore();
  const isAuthenticated = !!accessToken;
  const requiresOnboarding = account?.requiresOnboarding ?? false;

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : requiresOnboarding ? (
          <Stack.Screen name="AccountInfo" component={AccountInfoScreen} />
        ) : (
          <Stack.Screen name="App" component={AppNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
