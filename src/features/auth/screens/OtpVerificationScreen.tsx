import { PrimaryButton } from '@components/PrimaryButton';
import { Screen } from '@components/Screen';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useActiveProfileStore } from '@store/activeProfile.store';
import { useSessionStore } from '@store/session.store';
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
  TouchableOpacity,
  View,
} from 'react-native';
import { z } from 'zod';
import { authApi } from '../api/auth.api';

const otpSchema = z.object({
  otp: z.string().length(5, 'OTP must be exactly 5 digits').regex(/^\d+$/, 'OTP must contain only digits'),
});

type OtpFormData = z.infer<typeof otpSchema>;

interface RouteParams {
  phone: string;
}

export const OtpVerificationScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { phone } = (route.params || {}) as RouteParams;
  const { setTokens, setAccount } = useSessionStore();
  const { setActiveProfileId } = useActiveProfileStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  const onSubmit = async (data: OtpFormData) => {
    if (!phone) {
      Alert.alert('Error', 'Phone number is missing. Please start over.');
      navigation.goBack();
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.verifyOtp({ phone, otp: data.otp });
      await setTokens(response.tokens);
      setAccount(response.account);
      
      // Auto-select default profile if provided
      if (response.defaultProfileId) {
        await setActiveProfileId(response.defaultProfileId);
      }
      
      // Navigation will be handled automatically by RootNavigator
      // based on requiresOnboarding flag in the account state
    } catch (error) {
      const apiError = error as { message?: string; code?: string };
      let errorMessage = 'Invalid OTP. Please try again.';

      if (apiError.code === 'OTP_EXPIRED') {
        errorMessage = 'OTP has expired. Please request a new one.';
      } else if (apiError.code === 'OTP_MAX_ATTEMPTS') {
        errorMessage = 'Maximum attempts exceeded. Please request a new OTP.';
      } else if (apiError.message) {
        errorMessage = apiError.message;
      }

      Alert.alert('Verification Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!phone) return;

    setIsResending(true);
    try {
      await authApi.requestOtp({ phone });
      Alert.alert('Success', 'A new OTP has been sent to your phone.');
    } catch (error) {
      const apiError = error as { message?: string };
      Alert.alert(
        'Resend Failed',
        apiError.message || 'Unable to resend OTP. Please try again.'
      );
    } finally {
      setIsResending(false);
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
              <Text style={styles.brandTitle}>My Medi Logs</Text>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.cardTitle}>Enter Verification Code</Text>
              <Text style={styles.cardSubtitle}>
                We&apos;ve sent a 5-digit code to {phone ? phone.replace(/(.{2})(.{3})(.{4})/, '$1***$3') : 'your phone'}
              </Text>

              <View style={styles.field}>
                <Text style={styles.label}>Verification Code</Text>
                <Controller
                  control={control}
                  name="otp"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <>
                      <TextInput
                        style={[styles.input, errors.otp && styles.inputError]}
                        placeholder="12345"
                        value={value}
                        onChangeText={(text) => {
                          // Only allow digits and limit to 5
                          const digitsOnly = text.replace(/[^0-9]/g, '').slice(0, 5);
                          onChange(digitsOnly);
                        }}
                        onBlur={onBlur}
                        keyboardType="number-pad"
                        autoCapitalize="none"
                        maxLength={5}
                        placeholderTextColor="#8E8E93"
                      />
                      {errors.otp && (
                        <Text style={styles.errorText}>{errors.otp.message}</Text>
                      )}
                      <Text style={styles.helperText}>Enter the 5-digit code</Text>
                    </>
                  )}
                />
              </View>

              <PrimaryButton
                label={isLoading ? 'Verifying...' : 'Verify OTP'}
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                disabled={isLoading}
                style={styles.button}
              />

              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendOtp}
                disabled={isResending}
              >
                <Text style={styles.resendText}>
                  {isResending ? 'Sending...' : "Didn't receive code? Resend"}
                </Text>
              </TouchableOpacity>
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
    paddingBottom: 120,
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
    fontSize: 24,
    backgroundColor: '#FFFFFF',
    height: 60,
    color: '#000000',
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: '600',
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
  resendButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  resendText: {
    ...typography.body,
    color: '#007AFF',
    fontSize: 15,
    textAlign: 'center',
  },
});

