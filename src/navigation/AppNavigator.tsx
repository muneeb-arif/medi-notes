import { AccountInfoScreen } from '@features/auth/screens/AccountInfoScreen';
import { AppointmentsNavigator } from '@features/appointments/AppointmentsNavigator';
import { MedicationsNavigator } from '@features/medications/MedicationsNavigator';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { MainTabsNavigator } from './MainTabsNavigator';

const Stack = createNativeStackNavigator();
 
export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabsNavigator} />
      <Stack.Screen
        name="Medications"
        component={MedicationsNavigator}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="Appointments"
        component={AppointmentsNavigator}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="AccountInfo"
        component={AccountInfoScreen}
        options={{ presentation: 'card' }}
      />
    </Stack.Navigator>
  );
};

