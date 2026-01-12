import { PrimaryButton } from '@components/PrimaryButton';
import { Screen } from '@components/Screen';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useActiveProfileStore } from '@store/activeProfile.store';
import { useSessionStore } from '@store/session.store';
import { colors, spacing, typography } from '@theme';
import React, { useRef, useState } from 'react';
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
  otp: z.string().length(5, 'Please enter all 5 digits').regex(/^\d+$/, 'Code must contain only numbers'),
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
  const { ensureDefaultProfile } = useActiveProfileStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const hasAutoVerified = useRef(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '00000',
    },
  });

  const onSubmit = async (data: OtpFormData) => {
    if (!phone) {
      Alert.alert('Missing Information', 'Phone number is missing. Please start over.');
      navigation.goBack();
      return;
    }

    setIsLoading(true);
    try {
      console.log('[OTP] Starting verification...');
      const response = await authApi.verifyOtp({ phone, otp: data.otp });
      console.log('[OTP] API response received:', { 
        hasTokens: !!response.tokens, 
        hasAccount: !!response.account,
        requiresOnboarding: response.requiresOnboarding 
      });
      
      console.log('[OTP] Setting tokens...');
      await setTokens(response.tokens);
      console.log('[OTP] Tokens set, setting account...');
      
      setAccount(response.account);
      console.log('[OTP] Account set, ensuring default profile...');
      
      await ensureDefaultProfile();
      console.log('[OTP] Default profile ensured. Navigation should happen now.');
      
      // Check if state was actually updated
      const currentState = useSessionStore.getState();
      console.log('[OTP] Current session state:', {
        hasAccessToken: !!currentState.accessToken,
        hasAccount: !!currentState.account,
        isHydrated: currentState.isHydrated
      });
      
      // Navigation will be handled automatically by RootNavigator
      // based on requiresOnboarding flag in the account state
    } catch (error) {
      console.error('[OTP] Verification error:', error);
      const apiError = error as { message?: string; code?: string };
      let errorMessage = 'The code you entered is incorrect. Please try again.';

      if (apiError.code === 'expired_otp' || apiError.code === 'OTP_EXPIRED') {
        errorMessage = 'This code has expired. Please request a new one.';
      } else if (apiError.code === 'too_many_attempts' || apiError.code === 'OTP_MAX_ATTEMPTS') {
        errorMessage = 'Too many attempts. Please request a new code.';
      } else if (apiError.code === 'invalid_otp' || apiError.code === 'INVALID_OTP') {
        errorMessage = 'The code you entered is incorrect. Please try again.';
      } else if (apiError.message) {
        errorMessage = apiError.message;
      }

      if (Platform.OS !== 'web') {
        Alert.alert('Verification Failed', errorMessage);
      } else {
        console.error('[OTP] Verification Failed:', errorMessage);
      }
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
        'Unable to Resend',
        apiError.message || 'Unable to send a new code. Please try again.'
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
              <Text style={styles.brandTitle}>Medi Note</Text>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.cardTitle}>Enter Verification Code</Text>
              <Text style={styles.cardSubtitle}>
                Enter the 5-digit code sent to your phone
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
                      <Text style={styles.helperText}>Enter the 5-digit code sent to your phone</Text>
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
    backgroundColor: colors.gradientPrimary,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: colors.gradientPrimary,
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
    width: '100%',
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

