export interface PersonProfile {
  id: string;
  accountId: string;
  name: string;
  notes?: string;
  tags?: string[];
  isDefault: boolean;
  createdAt: string;
  lastUpdatedAt?: string;
}

export interface CreateProfileInput {
  name: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateProfileInput {
  name?: string;
  notes?: string;
  tags?: string[];
}

export interface ProfileSettingsInput {
  emergencyAccessEnabled: boolean;
  doctorSharingEnabled: boolean;
}
