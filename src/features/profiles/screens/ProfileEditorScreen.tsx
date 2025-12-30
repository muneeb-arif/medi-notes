import { PrimaryButton } from '@components/PrimaryButton';
import { Screen } from '@components/Screen';
import { SectionCard } from '@components/SectionCard';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute } from '@react-navigation/native';
import { spacing, typography } from '@theme';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { z } from 'zod';
import { useCreateProfile } from '../hooks/useCreateProfile';
import { useProfileDetail } from '../hooks/useProfileDetail';
import { useUpdateProfile } from '../hooks/useUpdateProfile';

const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Profile name must be at least 2 characters')
    .refine((val) => val.trim().toLowerCase() !== 'general', {
      message: 'Cannot create another "General" profile. It is the system default.',
    }),
  notes: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfileEditorScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as { mode?: string; profileId?: string };
  const mode = params?.mode || 'create';
  const profileId = params?.profileId;
  const { data: existingProfile, isLoading: isLoadingProfile } = useProfileDetail(
    mode === 'edit' ? profileId || null : null
  );
  const createProfile = useCreateProfile();
  const updateProfile = useUpdateProfile(profileId || '');

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      notes: '',
    },
  });

  React.useEffect(() => {
    if (existingProfile && mode === 'edit') {
      reset({
        name: existingProfile.name || '',
        notes: existingProfile.notes || '',
      });
    }
  }, [existingProfile, mode, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const payload = { name: data.name.trim(), notes: data.notes?.trim() || undefined };
      if (mode === 'create') {
        await createProfile.mutateAsync(payload);
      } else {
        await updateProfile.mutateAsync(payload);
      }
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  if (isLoadingProfile && mode === 'edit') {
    return (
      <Screen>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable padding="none">
      <View style={styles.content}>
        <SectionCard style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Profile Name / Context *</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    style={[styles.input, errors.name && styles.inputError]}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="e.g., Cardiology, Fertility, Psychology"
                    autoCapitalize="words"
                  />
                  {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
                  <Text style={styles.helperText}>Examples: Cardiology, Fertility, Psychology. Cannot create "General".</Text>
                </>
              )}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={value || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                    placeholder="Add notes or description"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              )}
            />
          </View>
        </SectionCard>

        <PrimaryButton
          label={mode === 'create' ? 'Create Profile' : 'Save Changes'}
          onPress={handleSubmit(onSubmit)}
          loading={createProfile.isPending || updateProfile.isPending}
          disabled={createProfile.isPending || updateProfile.isPending}
          style={styles.saveButton}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    paddingBottom: 120,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    fontSize: 18,
    marginBottom: spacing.md,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodyBold,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 100,
    paddingTop: spacing.md,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    ...typography.caption,
    color: '#FF3B30',
    marginTop: spacing.xs,
  },
  helperText: {
    ...typography.caption,
    color: '#8E8E93',
    marginTop: spacing.xs,
  },
  saveButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
});
