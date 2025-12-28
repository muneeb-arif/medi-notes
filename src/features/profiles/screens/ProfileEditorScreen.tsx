import { PrimaryButton } from '@components/PrimaryButton';
import { Screen } from '@components/Screen';
import { SectionCard } from '@components/SectionCard';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute } from '@react-navigation/native';
import { spacing, typography } from '@theme';
import React from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { z } from 'zod';
import { useCreateProfile } from '../hooks/useCreateProfile';
import { useProfileDetail } from '../hooks/useProfileDetail';
import { useUpdateProfile } from '../hooks/useUpdateProfile';

const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relation: z.string().min(1, 'Relation is required'),
  phone: z.string().min(1, 'Phone is required'),
});

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  relationToAccount: z.string().min(1, 'Relation to account is required'),
  bloodType: z.string().optional(),
  heightCm: z.union([z.number(), z.string()]).optional(),
  weightKg: z.union([z.number(), z.string()]).optional(),
  emergencyContacts: z.array(emergencyContactSchema).min(1, 'At least one emergency contact is required'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const GENDER_OPTIONS = ['male', 'female', 'other'];
const RELATION_OPTIONS = ['self', 'spouse', 'child', 'parent', 'other'];

export const ProfileEditorScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const mode = (route.params as { mode?: string; profileId?: string })?.mode || 'create';
  const profileId = (route.params as { profileId?: string })?.profileId;
  
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
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      dateOfBirth: '',
      gender: '',
      relationToAccount: '',
      bloodType: '',
      heightCm: '',
      weightKg: '',
      emergencyContacts: [{ name: '', relation: '', phone: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'emergencyContacts',
  });

  const selectedGender = watch('gender');
  const selectedRelation = watch('relationToAccount');

  React.useEffect(() => {
    if (existingProfile && mode === 'edit') {
      reset({
        fullName: existingProfile.fullName,
        dateOfBirth: existingProfile.dateOfBirth,
        gender: existingProfile.gender,
        relationToAccount: existingProfile.relationToAccount,
        bloodType: existingProfile.bloodType || '',
        heightCm: existingProfile.heightCm || '',
        weightKg: existingProfile.weightKg || '',
        emergencyContacts:
          existingProfile.emergencyContacts.length > 0
            ? existingProfile.emergencyContacts
            : [{ name: '', relation: '', phone: '' }],
      });
    }
  }, [existingProfile, mode, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    const payload = {
      ...data,
      heightCm: data.heightCm === '' ? undefined : Number(data.heightCm),
      weightKg: data.weightKg === '' ? undefined : Number(data.weightKg),
      bloodType: data.bloodType === '' ? undefined : data.bloodType,
    };

    try {
      if (mode === 'create') {
        await createProfile.mutateAsync(payload);
      } else {
        await updateProfile.mutateAsync(payload);
      }
      navigation.goBack();
    } catch (error) {
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
          {/* Personal Information */}
          <SectionCard style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.field}>
              <Text style={styles.label}>Full Name *</Text>
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      style={[styles.input, errors.fullName && styles.inputError]}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Enter full name"
                    />
                    {errors.fullName && <Text style={styles.errorText}>{errors.fullName.message}</Text>}
                  </>
                )}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Date of Birth *</Text>
              <Controller
                control={control}
                name="dateOfBirth"
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      style={[styles.input, errors.dateOfBirth && styles.inputError]}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="YYYY-MM-DD"
                    />
                    {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth.message}</Text>}
                  </>
                )}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Gender *</Text>
              <View style={styles.optionsRow}>
                {GENDER_OPTIONS.map((option) => (
                  <Controller
                    key={option}
                    control={control}
                    name="gender"
                    render={({ field: { onChange, value } }) => (
                      <TouchableOpacity
                        style={[styles.optionButton, value === option && styles.optionButtonActive]}
                        onPress={() => onChange(option)}
                      >
                        <Text style={[styles.optionText, value === option && styles.optionTextActive]}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                ))}
              </View>
              {errors.gender && <Text style={styles.errorText}>{errors.gender.message}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Relation to Account *</Text>
              <View style={styles.optionsRow}>
                {RELATION_OPTIONS.map((option) => (
                  <Controller
                    key={option}
                    control={control}
                    name="relationToAccount"
                    render={({ field: { onChange, value } }) => (
                      <TouchableOpacity
                        style={[styles.optionButton, value === option && styles.optionButtonActive]}
                        onPress={() => onChange(option)}
                      >
                        <Text style={[styles.optionText, value === option && styles.optionTextActive]}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                ))}
              </View>
              {errors.relationToAccount && <Text style={styles.errorText}>{errors.relationToAccount.message}</Text>}
            </View>
          </SectionCard>

          {/* Health Identity */}
          <SectionCard style={styles.section}>
            <Text style={styles.sectionTitle}>Health Identity</Text>
            
            <View style={styles.field}>
              <Text style={styles.label}>Blood Type</Text>
              <Controller
                control={control}
                name="bloodType"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    value={value || ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="O+, A-, etc."
                  />
                )}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Height (cm)</Text>
              <Controller
                control={control}
                name="heightCm"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    value={value?.toString() || ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="numeric"
                    placeholder="Height in centimeters"
                  />
                )}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Weight (kg)</Text>
              <Controller
                control={control}
                name="weightKg"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    value={value?.toString() || ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="numeric"
                    placeholder="Weight in kilograms"
                  />
                )}
              />
            </View>
          </SectionCard>

          {/* Emergency Contacts */}
          <SectionCard style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Contacts *</Text>
            {fields.map((field, index) => (
              <View key={field.id} style={styles.emergencyContactCard}>
                <View style={styles.emergencyHeader}>
                  <Text style={styles.emergencyTitle}>Contact {index + 1}</Text>
                  {fields.length > 1 && (
                    <TouchableOpacity onPress={() => remove(index)}>
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>Name</Text>
                  <Controller
                    control={control}
                    name={`emergencyContacts.${index}.name`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Contact name"
                      />
                    )}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>Relation</Text>
                  <Controller
                    control={control}
                    name={`emergencyContacts.${index}.relation`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Relation to profile"
                      />
                    )}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>Phone</Text>
                  <Controller
                    control={control}
                    name={`emergencyContacts.${index}.phone`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Phone number"
                        keyboardType="phone-pad"
                      />
                    )}
                  />
                </View>
              </View>
            ))}
            {errors.emergencyContacts && (
              <Text style={styles.errorText}>{errors.emergencyContacts.message}</Text>
            )}
            <TouchableOpacity
              style={styles.addContactButton}
              onPress={() => append({ name: '', relation: '', phone: '' })}
            >
              <Text style={styles.addContactButtonText}>+ Add Contact</Text>
            </TouchableOpacity>
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
    paddingBottom: 120, // Extra padding to ensure Create button is accessible
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
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    ...typography.caption,
    color: '#FF3B30',
    marginTop: spacing.xs,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: '#E5E5EA',
  },
  optionButtonActive: {
    backgroundColor: '#007AFF',
  },
  optionText: {
    ...typography.body,
    color: '#000000',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  emergencyContactCard: {
    backgroundColor: '#F5F5F5',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  emergencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emergencyTitle: {
    ...typography.bodyBold,
  },
  removeButtonText: {
    ...typography.body,
    color: '#FF3B30',
  },
  addContactButton: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  addContactButtonText: {
    ...typography.bodyBold,
    color: '#007AFF',
  },
  saveButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
});
