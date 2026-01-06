import { PrimaryButton } from '@components/PrimaryButton';
import { Screen } from '@components/Screen';
import { SectionCard } from '@components/SectionCard';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { useSessionStore } from '@store/session.store';
import { useQueryClient } from '@tanstack/react-query';
import { spacing, typography } from '@theme';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { z } from 'zod';
import { authApi } from '../api/auth.api';

const accountInfoSchema = z.object({
  fullName: z.string().min(2, 'Please enter your full name'),
  bloodGroup: z.string().min(1, 'Please select your blood group'),
  dateOfBirth: z
    .union([
      z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid date')
        .refine(
          (date) => {
            const parsedDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return parsedDate < today;
          },
          { message: 'Date of birth must be in the past' }
        ),
      z.literal(''),
    ])
    .optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  recoveryPhone: z.string().optional().or(z.literal('')),
});

type AccountInfoFormData = z.infer<typeof accountInfoSchema>;

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = [
  { label: 'Select gender', value: '' },
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateDisplay = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  // Extract only the date part (YYYY-MM-DD) from ISO string if it includes time
  const dateOnly = dateString.split('T')[0];
  const [year, month, day] = dateOnly.split('-');
  if (year && month && day) {
    // Format as "MMM DD, YYYY" for better readability
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  return dateString;
};

const parseDate = (dateString: string): Date => {
  if (!dateString) return new Date(2000, 0, 1);
  // Extract only the date part from ISO string if it includes time
  const dateOnly = dateString.split('T')[0];
  const [year, month, day] = dateOnly.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const AccountInfoScreen: React.FC = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { account, setAccount } = useSessionStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AccountInfoFormData>({
    resolver: zodResolver(accountInfoSchema),
    defaultValues: {
      fullName: account?.fullName || '',
      dateOfBirth: account?.dateOfBirth ? account.dateOfBirth.split('T')[0] : '',
      bloodGroup: account?.bloodGroup || '',
      gender: account?.gender || undefined,
      email: account?.email || '',
      recoveryPhone: account?.recoveryPhone || '',
    },
  });

  // Disable back button - this screen is mandatory
  useEffect(() => {
    // Navigation options are handled by RootNavigator
    // The screen is already non-skippable because RootNavigator only shows it when requiresOnboarding is true
  }, []);

  const dateOfBirthValue = watch('dateOfBirth');
  const initialDate = dateOfBirthValue ? parseDate(dateOfBirthValue) : new Date(2000, 0, 1);
  const selectedDate = tempSelectedDate || initialDate;

  const openAndroidDatePicker = () => {
    const currentDate = selectedDate;
    DateTimePickerAndroid.open({
      value: currentDate,
      mode: 'date',
      display: 'spinner',
      maximumDate: new Date(),
      minimumDate: new Date(1900, 0, 1),
      onChange: (event, date) => {
        if (event.type === 'set' && date) {
          // User confirmed the selection
          setValue('dateOfBirth', formatDate(date), { shouldValidate: true });
        }
        // If event.type === 'dismissed', user cancelled - do nothing
      },
    });
  };

  const onSubmit = async (data: AccountInfoFormData) => {
    setIsLoading(true);
    try {
      const updatedAccount = await authApi.updateAccount({
        fullName: data.fullName,
        bloodGroup: data.bloodGroup,
        dateOfBirth: data.dateOfBirth || null,
        gender: data.gender || null,
        email: data.email || null,
        recoveryPhone: data.recoveryPhone || null,
      });
      
      // Update Zustand store
      setAccount(updatedAccount);
      
      // Invalidate React Query cache so HomeScreen and other screens refetch updated account data
      await queryClient.invalidateQueries({ queryKey: ['account', 'me'] });
      
      // If accessed from Settings (not onboarding), navigate back
      // Otherwise, navigation will be handled automatically by RootNavigator
      // when requiresOnboarding becomes false after account update
      if (!updatedAccount.requiresOnboarding && navigation.canGoBack()) {
        navigation.goBack();
      }
    } catch (error) {
      const apiError = error as { message?: string; code?: string };
      Alert.alert(
        'Unable to Save',
        apiError.message || 'Unable to save your information. Please check your connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen scrollable>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Please provide the following information to continue
          </Text>
        </View>

        <SectionCard style={styles.card}>
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
                    placeholder="Enter your full name"
                    placeholderTextColor="#8E8E93"
                    editable={!isLoading}
                  />
                  {errors.fullName && (
                    <Text style={styles.errorText}>{errors.fullName.message}</Text>
                  )}
                </>
              )}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Blood Group *</Text>
            <Controller
              control={control}
              name="bloodGroup"
              render={({ field: { onChange, value } }) => (
                <>
                  <View style={[styles.pickerContainer, errors.bloodGroup && styles.inputError]}>
                    <Picker
                      selectedValue={value}
                      onValueChange={(itemValue) => {
                        onChange(itemValue);
                      }}
                      style={styles.picker}
                      enabled={!isLoading}
                    >
                      <Picker.Item label="Select blood group" value="" />
                      {BLOOD_GROUPS.map((group) => (
                        <Picker.Item key={group} label={group} value={group} />
                      ))}
                    </Picker>
                  </View>
                  {errors.bloodGroup && (
                    <Text style={styles.errorText}>{errors.bloodGroup.message}</Text>
                  )}
                </>
              )}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Date of Birth</Text>
            <Controller
              control={control}
              name="dateOfBirth"
              render={({ field: { value } }) => (
                <>
                  <TouchableOpacity
                    style={[
                      styles.input,
                      styles.dateInput,
                      errors.dateOfBirth && styles.inputError,
                    ]}
                    onPress={() => {
                      if (!isLoading) {
                        if (Platform.OS === 'android') {
                          openAndroidDatePicker();
                        } else {
                          setTempSelectedDate(null);
                          setShowDatePicker(true);
                        }
                      }
                    }}
                    disabled={isLoading}
                  >
                    <Text style={[styles.dateText, !value && styles.placeholderText]}>
                      {value ? formatDateDisplay(value) : 'Select date of birth (optional)'}
                    </Text>
                  </TouchableOpacity>
                  {Platform.OS === 'ios' ? (
                    <Modal
                      visible={showDatePicker}
                      transparent
                      animationType="slide"
                      onRequestClose={() => setShowDatePicker(false)}
                    >
                      <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                          <View style={styles.modalHeader}>
                            <TouchableOpacity
                              onPress={() => {
                                setTempSelectedDate(null);
                                setShowDatePicker(false);
                              }}
                              style={styles.modalCancelButton}
                            >
                              <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>Select Date</Text>
                            <TouchableOpacity
                              onPress={() => {
                                const finalDate = tempSelectedDate || selectedDate;
                                setValue('dateOfBirth', formatDate(finalDate), { shouldValidate: true });
                                setTempSelectedDate(null);
                                setShowDatePicker(false);
                              }}
                              style={styles.modalDoneButton}
                            >
                              <Text style={styles.modalDoneText}>Done</Text>
                            </TouchableOpacity>
                          </View>
                          <DateTimePicker
                            value={selectedDate}
                            mode="date"
                            display="spinner"
                            onChange={(event, date) => {
                              // Track the selected date as user scrolls
                              if (date) {
                                setTempSelectedDate(date);
                              }
                            }}
                            maximumDate={new Date()}
                            minimumDate={new Date(1900, 0, 1)}
                            style={styles.iosDatePicker}
                          />
                        </View>
                      </View>
                    </Modal>
                  ) : null}
                  {errors.dateOfBirth && (
                    <Text style={styles.errorText}>{errors.dateOfBirth.message}</Text>
                  )}
                </>
              )}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Gender</Text>
            <Controller
              control={control}
              name="gender"
              render={({ field: { onChange, value } }) => (
                <>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={value || ''}
                      onValueChange={(itemValue) => {
                        onChange(itemValue || undefined);
                      }}
                      style={styles.picker}
                      enabled={!isLoading}
                    >
                      {GENDERS.map((gender) => (
                        <Picker.Item key={gender.value} label={gender.label} value={gender.value} />
                      ))}
                    </Picker>
                  </View>
                </>
              )}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Enter your email (optional)"
                    placeholderTextColor="#8E8E93"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                  {errors.email && (
                    <Text style={styles.errorText}>{errors.email.message}</Text>
                  )}
                </>
              )}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Recovery Phone</Text>
            <Controller
              control={control}
              name="recoveryPhone"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    style={[styles.input, errors.recoveryPhone && styles.inputError]}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Enter recovery phone (optional)"
                    placeholderTextColor="#8E8E93"
                    keyboardType="phone-pad"
                    editable={!isLoading}
                  />
                  {errors.recoveryPhone && (
                    <Text style={styles.errorText}>{errors.recoveryPhone.message}</Text>
                  )}
                </>
              )}
            />
          </View>

          <PrimaryButton
            label={isLoading ? 'Saving...' : 'Continue'}
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
          />
        </SectionCard>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: '#8E8E93',
  },
  card: {
    margin: spacing.md,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodyBold,
    fontSize: 14,
    color: '#666666',
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    height: 55,
    color: '#000000',
  },
  dateInput: {
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#000000',
  },
  placeholderText: {
    color: '#8E8E93',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  picker: {
    height: 55,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    ...typography.caption,
    color: '#FF3B30',
    marginTop: spacing.xs,
  },
  button: {
    marginTop: spacing.lg,
    width: '100%',
  },
  datePickerButton: {
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  datePickerButtonText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    ...typography.bodyBold,
    fontSize: 18,
  },
  modalCancelButton: {
    padding: spacing.xs,
  },
  modalCancelText: {
    ...typography.body,
    color: '#8E8E93',
    fontSize: 16,
  },
  modalDoneButton: {
    padding: spacing.xs,
  },
  modalDoneText: {
    ...typography.bodyBold,
    color: '#007AFF',
    fontSize: 16,
  },
  iosDatePicker: {
    height: 200,
  },
  androidDatePicker: {
    height: 200,
    width: '100%',
  },
  pickerWrapper: {
    padding: spacing.md,
    alignItems: 'center',
  },
});
