export interface RequestOtpRequest {
  phone: string;
}

export interface RequestOtpResponse {
  message: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface VerifyOtpResponse {
  account: Account;
  tokens: Tokens;
  requiresOnboarding: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface Account {
  id: string;
  phone: string;
  fullName: string | null;
  dateOfBirth: string | null;
  bloodGroup: string | null;
  email: string | null;
  createdAt: string;
  requiresOnboarding: boolean;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
