import { v4 as uuidv4 } from 'uuid';
import { query, queryOne } from '../../utils/db';
import type {
  CreateProfileInput,
  PersonProfile,
  ProfileSettingsInput,
  UpdateProfileInput,
} from './profiles.types';

export const profilesService = {
  list: async (accountId: string): Promise<PersonProfile[]> => {
    const profiles = await query<{
      id: string;
      account_id: string;
      name: string;
      is_default: boolean;
      created_at: Date;
    }>(
      `SELECT id, account_id, name, is_default, created_at
       FROM profiles
       WHERE account_id = $1
       ORDER BY is_default DESC, created_at ASC`,
      [accountId]
    );

    return profiles.map((p) => ({
      id: p.id,
      accountId: p.account_id,
      name: p.name,
      isDefault: p.is_default,
      createdAt: p.created_at.toISOString(),
    }));
  },

  getById: async (accountId: string, profileId: string): Promise<PersonProfile | undefined> => {
    const profile = await queryOne<{
      id: string;
      account_id: string;
      name: string;
      is_default: boolean;
      created_at: Date;
    }>(
      `SELECT id, account_id, name, is_default, created_at
       FROM profiles
       WHERE id = $1 AND account_id = $2`,
      [profileId, accountId]
    );

    if (!profile) {
      return undefined;
    }

    return {
      id: profile.id,
      accountId: profile.account_id,
      name: profile.name,
      isDefault: profile.is_default,
      createdAt: profile.created_at.toISOString(),
    };
  },

  create: async (accountId: string, data: CreateProfileInput): Promise<PersonProfile> => {
    const profileId = uuidv4();
    const now = new Date();

    await query(
      `INSERT INTO profiles (id, account_id, name, is_default, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [profileId, accountId, data.name.trim(), false, now]
    );

    const profile = await profilesService.getById(accountId, profileId);
    if (!profile) {
      throw new Error('PROFILE_NOT_FOUND');
    }

    return profile;
  },

  update: async (
    accountId: string,
    profileId: string,
    data: UpdateProfileInput
  ): Promise<PersonProfile> => {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      values.push(data.name.trim());
      paramIndex++;
    }

    if (updates.length === 0) {
      // No updates provided, just return existing profile
      const profile = await profilesService.getById(accountId, profileId);
      if (!profile) {
        throw new Error('PROFILE_NOT_FOUND');
      }
      return profile;
    }

    values.push(profileId, accountId);

    await query(
      `UPDATE profiles
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex} AND account_id = $${paramIndex + 1}`,
      values
    );

    const profile = await profilesService.getById(accountId, profileId);
    if (!profile) {
      throw new Error('PROFILE_NOT_FOUND');
    }

    return profile;
  },

  delete: async (accountId: string, profileId: string): Promise<void> => {
    // Check if profile exists first
    const profile = await profilesService.getById(accountId, profileId);
    if (!profile) {
      throw new Error('PROFILE_NOT_FOUND');
    }

    await query(
      `DELETE FROM profiles
       WHERE id = $1 AND account_id = $2`,
      [profileId, accountId]
    );
  },

  updateSettings: async (
    accountId: string,
    profileId: string,
    data: ProfileSettingsInput
  ): Promise<PersonProfile> => {
    // Note: ProfileSettingsInput fields are not in the current schema
    // This method is kept for API compatibility but may need schema updates
    const profile = await profilesService.getById(accountId, profileId);
    if (!profile) {
      throw new Error('PROFILE_NOT_FOUND');
    }

    return profile;
  },
};
