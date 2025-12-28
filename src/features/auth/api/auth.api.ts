import { apiClient } from '@services/apiClient';
import type {
  Account,
  LogoutRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RequestOtpRequest,
  RequestOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from '../types';

export const authApi = {
  requestOtp: async (data: RequestOtpRequest): Promise<RequestOtpResponse> => {
    return apiClient.post<RequestOtpResponse>('/auth/request-otp', data);
  },

  verifyOtp: async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    return apiClient.post<VerifyOtpResponse>('/auth/verify-otp', data);
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    return apiClient.post<RefreshTokenResponse>('/auth/refresh', data);
  },

  logout: async (data: LogoutRequest): Promise<void> => {
    return apiClient.post<void>('/auth/logout', data);
  },

  getCurrentAccount: async (): Promise<Account> => {
    return apiClient.get<Account>('/auth/account/me');
  },

  updateAccount: async (data: {
    fullName: string;
    dateOfBirth: string;
    bloodGroup: string;
    gender?: 'male' | 'female' | 'other' | null;
    email?: string | null;
    recoveryPhone?: string | null;
  }): Promise<Account> => {
    return apiClient.put<Account>('/auth/account/me', data);
  },
};
