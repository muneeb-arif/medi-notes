import { spacing, typography } from '@theme';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { PrimaryButton } from './PrimaryButton';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
  buttonStyle?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  buttonStyle,
}) => {
  return (
    <View style={styles.container}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionLabel && onAction && (
        <PrimaryButton
          label={actionLabel}
          onPress={onAction}
          style={StyleSheet.flatten([styles.button, buttonStyle])}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.sm,
    textAlign: 'center',
    width: '100%',
  },
  description: {
    ...typography.body,
    color: '#8E8E93',
    marginBottom: spacing.lg,
    textAlign: 'center',
    width: '100%',
  },
  button: {
    width: '100%',
  },
});

