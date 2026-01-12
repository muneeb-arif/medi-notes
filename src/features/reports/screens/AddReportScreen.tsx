import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { z } from 'zod';
import { Screen } from '@components/Screen';
import { SectionCard } from '@components/SectionCard';
import { PrimaryButton } from '@components/PrimaryButton';
import { spacing, typography } from '@theme';
import { useCreateReport } from '../hooks/useCreateReport';
import type { ReportType } from '../types';

const reportSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  reportDate: z.string().min(1, 'Report date is required'),
  type: z.enum(['lab', 'radiology', 'prescription', 'visit_note', 'discharge', 'other']),
  doctorName: z.string().optional(),
  facility: z.string().optional(),
  tags: z.string().optional(),
});

type ReportFormData = z.infer<typeof reportSchema>;

const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  lab: 'Lab',
  radiology: 'Radiology',
  prescription: 'Prescription',
  visit_note: 'Visit Note',
  discharge: 'Discharge',
  other: 'Other',
};

export const AddReportScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const profileId = (route.params as { profileId: string })?.profileId;
  const createReport = useCreateReport(profileId);

  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    mimeType: string;
  } | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      title: '',
      reportDate: '',
      type: 'lab',
      doctorName: '',
      facility: '',
      tags: '',
    },
  });

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          name: asset.name || 'report',
          mimeType: asset.mimeType || 'application/pdf',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const onSubmit = async (data: ReportFormData) => {
    // Validate file type if file is selected
    if (selectedFile) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(selectedFile.mimeType)) {
        Alert.alert('Error', 'Only PDF, JPEG, and PNG files are allowed');
        return;
      }
    }

    try {
      const tags = data.tags
        ? data.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : undefined;

      await createReport.mutateAsync({
        input: {
          title: data.title,
          reportDate: data.reportDate,
          type: data.type as ReportType,
          doctorName: data.doctorName || undefined,
          facility: data.facility || undefined,
          tags,
        },
        fileUri: selectedFile?.uri,
        fileType: selectedFile?.mimeType,
      });

      navigation.goBack();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to save report. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <Screen scrollable padding="none">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* File Section */}
          <SectionCard style={styles.section}>
            <Text style={styles.sectionTitle}>File</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Select File (Optional)</Text>
              <TouchableOpacity style={styles.fileButton} onPress={pickDocument}>
                <Text style={styles.fileButtonText}>
                  {selectedFile ? `Selected: ${selectedFile.name}` : 'Select PDF, JPEG, or PNG (Optional)'}
                </Text>
              </TouchableOpacity>
              {!selectedFile && (
                <Text style={styles.helperText}>Accepted formats: PDF, JPEG, PNG. You can save the report without a file.</Text>
              )}
            </View>
          </SectionCard>

          {/* Details Section */}
          <SectionCard style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            
            <View style={styles.field}>
              <Text style={styles.label}>Title *</Text>
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      style={[styles.input, errors.title && styles.inputError]}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Enter report title"
                    />
                    {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}
                  </>
                )}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Report Date *</Text>
              <Controller
                control={control}
                name="reportDate"
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      style={[styles.input, errors.reportDate && styles.inputError]}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="YYYY-MM-DD"
                    />
                    {errors.reportDate && (
                      <Text style={styles.errorText}>{errors.reportDate.message}</Text>
                    )}
                    <Text style={styles.helperText}>Format: YYYY-MM-DD</Text>
                  </>
                )}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Type *</Text>
              <View style={styles.typeContainer}>
                {(['lab', 'radiology', 'prescription', 'visit_note', 'discharge', 'other'] as const).map(
                  (type) => (
                    <Controller
                      key={type}
                      control={control}
                      name="type"
                      render={({ field: { onChange, value } }) => (
                        <TouchableOpacity
                          style={[styles.typeButton, value === type && styles.typeButtonActive]}
                          onPress={() => onChange(type)}
                        >
                          <Text
                            style={[
                              styles.typeText,
                              value === type && styles.typeTextActive,
                            ]}
                          >
                            {REPORT_TYPE_LABELS[type]}
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  )
                )}
              </View>
              {errors.type && <Text style={styles.errorText}>{errors.type.message}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Doctor Name</Text>
              <Controller
                control={control}
                name="doctorName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    value={value || ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
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
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    value={value || ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Optional"
                  />
                )}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Tags</Text>
              <Controller
                control={control}
                name="tags"
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      style={styles.input}
                      value={value || ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Comma-separated tags (optional)"
                    />
                    <Text style={styles.helperText}>Separate multiple tags with commas</Text>
                  </>
                )}
              />
            </View>
          </SectionCard>

          <PrimaryButton
            label="Save Report"
            onPress={handleSubmit(onSubmit)}
            loading={createReport.isPending}
            disabled={createReport.isPending}
            style={styles.submitButton}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 120,
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
  helperText: {
    ...typography.caption,
    color: '#8E8E93',
    marginTop: spacing.xs,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: '#E5E5EA',
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
  },
  typeText: {
    ...typography.body,
    fontSize: 14,
    color: '#000000',
  },
  typeTextActive: {
    color: '#FFFFFF',
  },
  fileButton: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: spacing.md,
    backgroundColor: '#F5F5F5',
  },
  fileButtonText: {
    ...typography.body,
    color: '#000000',
  },
  submitButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
});
