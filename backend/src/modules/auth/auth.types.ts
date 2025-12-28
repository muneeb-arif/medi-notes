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

export interface RequestOtpRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface VerifyOtpResponse {
  account: Account;
  tokens: Tokens;
  requiresOnboarding: boolean;
  defaultProfileId?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

