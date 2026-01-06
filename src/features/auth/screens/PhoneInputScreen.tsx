import { PrimaryButton } from '@components/PrimaryButton';
import { Screen } from '@components/Screen';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { spacing, typography } from '@theme';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { z } from 'zod';
import { authApi } from '../api/auth.api';

const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'),
});

type PhoneFormData = z.infer<typeof phoneSchema>;

export const PhoneInputScreen: React.FC = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: '+923001234567',
    },
  });

  const onSubmit = async (data: PhoneFormData) => {
    setIsLoading(true);
    try {
      await authApi.requestOtp({ phone: data.phone });
      // @ts-ignore
      navigation.navigate('OtpVerification' as never, { phone: data.phone } as never);
    } catch (error) {
      const apiError = error as { message?: string; code?: string; status?: number };
      let errorMessage = 'Unable to send OTP. Please try again.';
      
      if (apiError.code === 'NETWORK_ERROR') {
        errorMessage = 'Unable to connect. Please check your internet connection and try again.';
      } else if (apiError.message) {
        errorMessage = apiError.message;
      } else if (apiError.status === 500) {
        errorMessage = 'Something went wrong. Please try again in a moment.';
      } else if (apiError.status === 404) {
        errorMessage = 'Unable to send code. Please try again.';
      }
      
      Alert.alert('Unable to Send Code', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen scrollable padding="none">
      <View style={styles.background}>
        <View style={styles.gradientOverlay} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.brandingContainer}>
              <Image
                source={require('../../../../assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.brandTitle}>Medi Note</Text>
              <Text style={styles.brandSubtitle}>Secure Medical Records</Text>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.cardTitle}>Enter Phone Number</Text>
              <Text style={styles.cardSubtitle}>
                We'll send you a verification code via SMS
              </Text>

              <View style={styles.field}>
                <Text style={styles.label}>Phone Number</Text>
                <Controller
                  control={control}
                  name="phone"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <>
                      <TextInput
                        style={[styles.input, errors.phone && styles.inputError]}
                        placeholder="+923001234567"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="phone-pad"
                        autoCapitalize="none"
                        autoComplete="tel"
                        placeholderTextColor="#8E8E93"
                      />
                      {errors.phone && (
                        <Text style={styles.errorText}>{errors.phone.message}</Text>
                      )}
                      <Text style={styles.helperText}>
                        Include country code (e.g., +92 for Pakistan)
                      </Text>
                    </>
                  )}
                />
              </View>

              <PrimaryButton
                label={isLoading ? 'Sending...' : 'Continue with phone'}
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                disabled={isLoading}
                style={styles.button}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#2b90f4',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: '#1E90FF',
    opacity: 0.3,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl * 2,
    paddingBottom: 250,
  },
  brandingContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl * 2,
  },
  logo: {
    width: 200,
    height: 120,
    tintColor: '#FFFFFF',
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    width: '100%',
    textAlign: "center"
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    width: "100%",
    textAlign: "center"
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardTitle: {
    ...typography.h2,
    fontSize: 22,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  cardSubtitle: {
    ...typography.caption,
    textAlign: 'center',
    marginBottom: spacing.lg,
    color: '#8E8E93',
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
    height: 50,
    color: '#000000',
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
  button: {
    marginTop: spacing.md,
    width: '100%',
  },
});

