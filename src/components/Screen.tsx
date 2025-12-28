import { useNavigation } from '@react-navigation/native';
import { spacing } from '@theme';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  padding?: keyof typeof spacing | 'none';
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  padding = 'md',
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  
  // Check if we're inside a tab navigator
  const isInTabNavigator = useMemo(() => {
    try {
      const parent = navigation.getParent();
      return parent?.getState()?.type === 'tab';
    } catch {
      return false;
    }
  }, [navigation]);

  // Use estimated tab bar height when in tab navigator
  // Typical tab bar height is around 49-60px on iOS, 56-64px on Android
  // We'll use a safe default that works for both
  const tabBarHeight = useMemo(() => {
    return isInTabNavigator ? 30 : 0;
  }, [isInTabNavigator]);
  
  const paddingValue = padding === 'none' ? 0 : spacing[padding as keyof typeof spacing];

  const containerStyle = {
    paddingTop: insets.top,
    paddingBottom: insets.bottom + tabBarHeight - 100,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };

  if (scrollable) {
    return (
      <View style={[styles.container, containerStyle]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            padding !== 'none' && { padding: paddingValue },
          ]}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle, padding !== 'none' && { padding: paddingValue }]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    // Removed flexGrow: 1 to allow content to scroll properly when it exceeds viewport height
    // Added paddingBottom to ensure last element (e.g., Create button) is accessible
    // Increased padding to account for keyboard and ensure button is always reachable
    paddingBottom: 100,
  },
});

