import { useSessionStore } from '@store/session.store';
import Constants from 'expo-constants';

const baseURL =  process.env.EXPO_PUBLIC_API_BASE_URL || Constants.expoConfig?.extra?.apiBaseURL || '';

interface RequestConfig extends RequestInit {
  headers?: HeadersInit;
}

interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthToken(): string | null {
    return useSessionStore.getState().accessToken;
  }

  private sanitizeError(error: unknown): ApiError {
    // Handle network errors (fetch failures)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        message: 'Network error. Please check your connection and try again.',
        code: 'NETWORK_ERROR',
      };
    }

    // Handle API errors (already structured)
    if (error && typeof error === 'object' && 'message' in error) {
      return {
        message: (error as { message: string }).message,
        code: (error as { code?: string }).code || 'API_ERROR',
      };
    }

    // Handle Error instances
    if (error instanceof Error) {
      // Don't expose internal error details, but preserve network-related messages
      if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
        return {
          message: 'Network error. Please check your connection and try again.',
          code: 'NETWORK_ERROR',
        };
      }
      return {
        message: 'An error occurred. Please try again.',
        code: 'UNKNOWN_ERROR',
      };
    }

    // Fallback for unknown errors
    return {
      message: 'An error occurred. Please try again.',
      code: 'UNKNOWN_ERROR',
    };
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(config.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...config,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = errorData.error || errorData;
        throw {
          status: response.status,
          message: error.message || `Request failed with status ${response.status}`,
          code: error.code,
        };
      }

      return await response.json();
    } catch (error) {
      // Preserve structured errors from API
      if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
        throw error;
      }

      // Temporary debug logging (NO PHI - only endpoint, no data)
      console.log('API Error:', {
        type: error instanceof Error ? error.constructor.name : typeof error,
        message: error instanceof Error ? error.message : 'Unknown',
        endpoint: endpoint, // Safe - just the endpoint path
      });

      // Handle network/fetch errors
      const sanitized = this.sanitizeError(error);
      throw {
        ...sanitized,
        status: (error as { status?: number })?.status,
      };
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
export type { ApiError };

