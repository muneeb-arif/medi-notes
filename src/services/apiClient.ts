import { authApi } from '@features/auth/api/auth.api';
import { useSessionStore } from '@store/session.store';
import Constants from 'expo-constants';

const baseURL =
  process.env.EXPO_PUBLIC_API_BASE_URL || Constants.expoConfig?.extra?.apiBaseURL || '';

interface RequestConfig extends RequestInit {
  headers?: HeadersInit;
}

export interface ApiError {
  message: string;
  code: string;
  status?: number;
}

// OTP-specific error code mappings
// Maps backend codes to clean UI-friendly codes
const OTP_ERROR_CODE_MAP: Record<string, string> = {
  OTP_EXPIRED: 'expired_otp',
  OTP_MAX_ATTEMPTS: 'too_many_attempts',
  INVALID_OTP: 'invalid_otp',
};

class ApiClient {
  private baseURL: string;
  private isRefreshing = false;
  private refreshPromise: Promise<void> | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthToken(): string | null {
    return useSessionStore.getState().accessToken;
  }

  private getRefreshToken(): string | null {
    return useSessionStore.getState().refreshToken;
  }

  private async clearSession(): Promise<void> {
    await useSessionStore.getState().clearSession();
  }

  /**
   * Attempts to refresh the access token using the refresh token.
   * Returns true if refresh was successful, false otherwise.
   */
  private async refreshAccessToken(): Promise<boolean> {
    // If already refreshing, wait for the existing refresh to complete
    if (this.isRefreshing && this.refreshPromise) {
      await this.refreshPromise;
      return this.getAuthToken() !== null;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
          await this.clearSession();
          return;
        }

        const response = await authApi.refreshToken({ refreshToken });
        await useSessionStore.getState().setTokens(response);
      } catch {
        // Refresh failed - clear session and log out user
        await this.clearSession();
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    await this.refreshPromise;
    return this.getAuthToken() !== null;
  }

  /**
   * Normalizes API errors into a consistent format.
   * Strips stack traces and internal error details.
   */
  private normalizeError(error: unknown, status?: number): ApiError {
    // Handle backend error format: { error: { code, message } }
    if (error && typeof error === 'object') {
      const errorObj = error as Record<string, unknown>;

      // Check for nested error object (backend format)
      if ('error' in errorObj && typeof errorObj.error === 'object') {
        const backendError = errorObj.error as Record<string, unknown>;
        const code = (backendError.code as string) || 'API_ERROR';
        const message = (backendError.message as string) || 'An error occurred';

        // Map OTP-specific error codes to clean UI-friendly codes
        const mappedCode = OTP_ERROR_CODE_MAP[code] || code;

        return {
          message,
          code: mappedCode,
          status: status || (errorObj.status as number),
        };
      }

      // Check for direct error properties
      if ('code' in errorObj && 'message' in errorObj) {
        const code = (errorObj.code as string) || 'API_ERROR';
        const message = (errorObj.message as string) || 'An error occurred';

        // Map OTP-specific error codes to clean UI-friendly codes
        const mappedCode = OTP_ERROR_CODE_MAP[code] || code;

        return {
          message,
          code: mappedCode,
          status: status || (errorObj.status as number),
        };
      }
    }

    // Handle network errors (fetch failures)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        message: 'Network error. Please check your connection and try again.',
        code: 'NETWORK_ERROR',
        status,
      };
    }

    // Handle Error instances
    if (error instanceof Error) {
      // Don't expose internal error details, but preserve network-related messages
      if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
        return {
          message: 'Network error. Please check your connection and try again.',
          code: 'NETWORK_ERROR',
          status,
        };
      }
      return {
        message: 'An error occurred. Please try again.',
        code: 'UNKNOWN_ERROR',
        status,
      };
    }

    // Fallback for unknown errors
    return {
      message: 'An error occurred. Please try again.',
      code: 'UNKNOWN_ERROR',
      status,
    };
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {},
    retryOn401 = true
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(config.headers as Record<string, string>),
    };

    // Automatically attach Authorization Bearer token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...config,
        headers,
      });

      // Handle 401 Unauthorized - attempt token refresh
      if (response.status === 401 && retryOn401) {
        // Skip refresh for auth endpoints (to avoid infinite loops)
        const isAuthEndpoint = endpoint.startsWith('/auth/');
        if (!isAuthEndpoint) {
          const refreshSuccess = await this.refreshAccessToken();
          if (refreshSuccess) {
            // Retry the original request with new token
            return this.request<T>(endpoint, config, false);
          }
        }

        // If refresh failed or is auth endpoint, clear session and throw error
        await this.clearSession();
        const errorData = await response.json().catch(() => ({}));
        const normalizedError = this.normalizeError(errorData, 401);
        throw normalizedError;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const normalizedError = this.normalizeError(errorData, response.status);
        throw normalizedError;
      }

      const responseData = await response.json();
      // Backend sends data directly (not wrapped in data field)
      return responseData;
    } catch (error) {
      // If it's already a normalized ApiError, re-throw it
      if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
        throw error;
      }

      // Normalize and throw
      const normalizedError = this.normalizeError(error);
      throw normalizedError;
    }
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(baseURL);
