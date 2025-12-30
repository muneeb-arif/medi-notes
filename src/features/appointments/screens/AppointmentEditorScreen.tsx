import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { z } from 'zod';
import { Screen } from '@components/Screen';
import { SectionCard } from '@components/SectionCard';
import { PrimaryButton } from '@components/PrimaryButton';
import { spacing, typography } from '@theme';
import { useActiveProfileStore } from '@store/activeProfile.store';
import { useCreateAppointment } from '../hooks/useCreateAppointment';
import { useUpdateAppointment } from '../hooks/useUpdateAppointment';
import { useAppointmentDetail } from '../hooks/useAppointmentDetail';
import type { AppointmentStatus } from '../types';

const appointmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  specialty: z.string().optional(),
  doctorName: z.string().optional(),
  facility: z.string().optional(),
  location: z.string().optional(),
  startAt: z.string().min(1, 'Start date and time is required'),
  endAt: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

const STATUS_OPTIONS: { value: AppointmentStatus; label: string }[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const formatDateTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const formatDateTimeDisplay = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

export const AppointmentEditorScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { activeProfileId } = useActiveProfileStore();
  const appointmentId = (route.params as { appointmentId?: string })?.appointmentId;
  const mode = (route.params as { mode?: string })?.mode || 'create';

  const createAppointment = useCreateAppointment(activeProfileId);
  const updateAppointment = useUpdateAppointment();
  const { data: existingAppointment, isLoading: isLoadingAppointment } = useAppointmentDetail(
    mode === 'edit' ? appointmentId || null : null
  );

  // Default start time: now + 24 hours
  const getDefaultStartTime = () => {
    const date = new Date();
    date.setHours(date.getHours() + 24);
    // Round to nearest 15 minutes
    const minutes = date.getMinutes();
    date.setMinutes(Math.round(minutes / 15) * 15);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  };

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startPickerMode, setStartPickerMode] = useState<'date' | 'time'>('date');
  const [endPickerMode, setEndPickerMode] = useState<'date' | 'time'>('date');

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      title: '',
      specialty: '',
      doctorName: '',
      facility: '',
      location: '',
      startAt: formatDateTime(getDefaultStartTime()),
      endAt: '',
      status: 'scheduled',
      notes: '',
    },
  });

  const startAtValue = watch('startAt');
  const endAtValue = watch('endAt');

  React.useEffect(() => {
    if (existingAppointment && mode === 'edit') {
      reset({
        title: existingAppointment.title,
        specialty: existingAppointment.specialty || '',
        doctorName: existingAppointment.doctorName || '',
        facility: existingAppointment.facility || '',
        location: existingAppointment.location || '',
        startAt: existingAppointment.startAt.slice(0, 16),
        endAt: existingAppointment.endAt?.slice(0, 16) || '',
        status: existingAppointment.status,
        notes: existingAppointment.notes || '',
      });
    }
  }, [existingAppointment, mode, reset]);

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'dismissed') {
        setShowStartPicker(false);
        return;
      }
      if (event.type === 'set' && selectedDate) {
        const currentDate = getStartDate();
        let newDate: Date;
        
        if (startPickerMode === 'date') {
          // User selected a date, now show time picker
          newDate = new Date(selectedDate);
          newDate.setHours(currentDate.getHours());
          newDate.setMinutes(currentDate.getMinutes());
          setValue('startAt', formatDateTime(newDate), { shouldValidate: true });
          setStartPickerMode('time');
          // Keep picker open for time selection
        } else {
          // User selected a time, combine with existing date and close
          newDate = new Date(currentDate);
          newDate.setHours(selectedDate.getHours());
          newDate.setMinutes(selectedDate.getMinutes());
          setValue('startAt', formatDateTime(newDate), { shouldValidate: true });
          setShowStartPicker(false);
          setStartPickerMode('date'); // Reset for next time
        }
      }
    } else {
      // iOS
      if (selectedDate) {
        setValue('startAt', formatDateTime(selectedDate), { shouldValidate: true });
      }
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'dismissed') {
        setShowEndPicker(false);
        return;
      }
      if (event.type === 'set' && selectedDate) {
        const currentDate = getEndDate();
        let newDate: Date;
        
        if (endPickerMode === 'date') {
          // User selected a date, now show time picker
          newDate = new Date(selectedDate);
          newDate.setHours(currentDate.getHours());
          newDate.setMinutes(currentDate.getMinutes());
          setValue('endAt', formatDateTime(newDate), { shouldValidate: true });
          setEndPickerMode('time');
          // Keep picker open for time selection
        } else {
          // User selected a time, combine with existing date and close
          newDate = new Date(currentDate);
          newDate.setHours(selectedDate.getHours());
          newDate.setMinutes(selectedDate.getMinutes());
          setValue('endAt', formatDateTime(newDate), { shouldValidate: true });
          setShowEndPicker(false);
          setEndPickerMode('date'); // Reset for next time
        }
      }
    } else {
      // iOS
      if (selectedDate) {
        setValue('endAt', formatDateTime(selectedDate), { shouldValidate: true });
      }
    }
  };

  const getStartDate = (): Date => {
    if (startAtValue) {
      try {
        return new Date(startAtValue);
      } catch {
        return getDefaultStartTime();
      }
    }
    return getDefaultStartTime();
  };

  const getEndDate = (): Date => {
    if (endAtValue) {
      try {
        return new Date(endAtValue);
      } catch {
        return new Date();
      }
    }
    return new Date();
  };

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      const payload = {
        title: data.title,
        specialty: data.specialty || undefined,
        doctorName: data.doctorName || undefined,
        facility: data.facility || undefined,
        location: data.location || undefined,
        startAt: new Date(data.startAt).toISOString(),
        endAt: data.endAt ? new Date(data.endAt).toISOString() : undefined,
        status: data.status,
        notes: data.notes || undefined,
      };

      if (mode === 'create') {
        await createAppointment.mutateAsync(payload);
      } else {
        await updateAppointment.mutateAsync({ appointmentId: appointmentId!, data: payload });
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save appointment');
    }
  };

  const isLoading = createAppointment.isPending || updateAppointment.isPending || isLoadingAppointment;

  if (isLoadingAppointment) {
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
          {/* Appointment Details */}
          <SectionCard style={styles.section}>
            <Text style={styles.sectionTitle}>Appointment Details</Text>
            
            <View style={styles.field}>
              <Text style={styles.label}>Title *</Text>
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, value } }) => (
                  <>
                    <TextInput
                      style={[styles.input, errors.title && styles.inputError]}
                      value={value}
                      onChangeText={onChange}
                      placeholder="Appointment title"
                    />
                    {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}
                  </>
                )}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Start Date & Time *</Text>
              <Controller
                control={control}
                name="startAt"
                render={({ field: { value } }) => (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.input,
                        styles.dateInput,
                        errors.startAt && styles.inputError,
                      ]}
                      onPress={() => {
                        if (Platform.OS === 'android') {
                          setStartPickerMode('date');
                        }
                        setShowStartPicker(true);
                      }}
                      disabled={isLoading}
                    >
                      <Text style={[styles.dateText, !value && styles.placeholderText]}>
                        {value ? formatDateTimeDisplay(value) : 'Select start date & time'}
                      </Text>
                    </TouchableOpacity>
                    {showStartPicker && (
                      <>
                        <DateTimePicker
                          value={getStartDate()}
                          mode={Platform.OS === 'android' ? startPickerMode : 'datetime'}
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={handleStartDateChange}
                          minimumDate={new Date()}
                        />
                        {Platform.OS === 'ios' && (
                          <TouchableOpacity
                            style={styles.datePickerButton}
                            onPress={() => setShowStartPicker(false)}
                          >
                            <Text style={styles.datePickerButtonText}>Done</Text>
                          </TouchableOpacity>
                        )}
                      </>
                    )}
                    {errors.startAt && <Text style={styles.errorText}>{errors.startAt.message}</Text>}
                  </>
                )}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>End Date & Time</Text>
              <Controller
                control={control}
                name="endAt"
                render={({ field: { value } }) => (
                  <>
                    <TouchableOpacity
                      style={[styles.input, styles.dateInput]}
                      onPress={() => {
                        if (Platform.OS === 'android') {
                          setEndPickerMode('date');
                        }
                        setShowEndPicker(true);
                      }}
                      disabled={isLoading}
                    >
                      <Text style={[styles.dateText, !value && styles.placeholderText]}>
                        {value ? formatDateTimeDisplay(value) : 'Select end date & time (optional)'}
                      </Text>
                    </TouchableOpacity>
                    {showEndPicker && (
                      <>
                        <DateTimePicker
                          value={getEndDate()}
                          mode={Platform.OS === 'android' ? endPickerMode : 'datetime'}
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={handleEndDateChange}
                          minimumDate={startAtValue ? new Date(startAtValue) : new Date()}
                        />
                        {Platform.OS === 'ios' && (
                          <TouchableOpacity
                            style={styles.datePickerButton}
                            onPress={() => setShowEndPicker(false)}
                          >
                            <Text style={styles.datePickerButtonText}>Done</Text>
                          </TouchableOpacity>
                        )}
                      </>
                    )}
                  </>
                )}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Status *</Text>
              <View style={styles.statusContainer}>
                {STATUS_OPTIONS.map((option) => (
                  <Controller
                    key={option.value}
                    control={control}
                    name="status"
                    render={({ field: { onChange, value } }) => (
                      <TouchableOpacity
                        style={[styles.statusButton, value === option.value && styles.statusButtonActive]}
                        onPress={() => onChange(option.value)}
                      >
                        <Text
                          style={[styles.statusText, value === option.value && styles.statusTextActive]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                ))}
              </View>
              {errors.status && <Text style={styles.errorText}>{errors.status.message}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Doctor Name</Text>
              <Controller
                control={control}
                name="doctorName"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    value={value || ''}
                    onChangeText={onChange}
                    placeholder="Optional"
                  />
                )}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Specialty</Text>
              <Controller
                control={control}
                name="specialty"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    value={value || ''}
                    onChangeText={onChange}
                    placeholder="Optional"
                  />
                )}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Facility</Text>
              <Controller
                control={control}
                name="facility"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    value={value || ''}
                    onChangeText={onChange}
                    placeholder="Optional"
                  />
                )}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Location</Text>
              <Controller
                control={control}
                name="location"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    value={value || ''}
                    onChangeText={onChange}
                    placeholder="Optional"
                  />
                )}
              />
            </View>
          </SectionCard>

          {/* Optional Notes */}
          <SectionCard style={styles.section}>
            <Text style={styles.sectionTitle}>Optional Notes</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Notes</Text>
              <Controller
                control={control}
                name="notes"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={value || ''}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={3}
                    placeholder="Additional notes..."
                  />
                )}
              />
            </View>
          </SectionCard>

          <PrimaryButton
            label={mode === 'create' ? 'Create Appointment' : 'Update Appointment'}
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading}
            style={styles.submitButton}
          />
        </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    paddingBottom: 200,
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  helperText: {
    ...typography.caption,
    color: '#8E8E93',
    marginTop: spacing.xs,
  },
  errorText: {
    ...typography.caption,
    color: '#FF3B30',
    marginTop: spacing.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statusButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: '#007AFF',
  },
  statusText: {
    ...typography.body,
    fontSize: 14,
    color: '#000000',
  },
  statusTextActive: {
    color: '#FFFFFF',
  },
  submitButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
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
  datePickerButton: {
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  datePickerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
