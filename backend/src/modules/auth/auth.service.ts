import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../../config/env';
import { HttpError } from '../../utils/httpError';
import { query, queryOne, transaction } from '../../utils/db';
import type {
  Account,
  Tokens,
  RequestOtpRequest,
  VerifyOtpRequest,
} from './auth.types';

const OTP_EXPIRY_MINUTES = 5;
const OTP_MAX_ATTEMPTS = 5;

const generateOTP = (): string => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

const generateTokens = (accountId: string): Tokens => {
  const accessToken = jwt.sign({ accountId }, config.jwtSecret, {
    expiresIn: config.jwtAccessExpiry,
  });

  const refreshToken = jwt.sign({ accountId, type: 'refresh' }, config.jwtSecret, {
    expiresIn: config.jwtRefreshExpiry,
  });

  return { accessToken, refreshToken };
};

const hashRefreshToken = async (refreshToken: string): Promise<string> => {
  return bcrypt.hash(refreshToken, 10);
};

const verifyRefreshTokenHash = async (
  refreshToken: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(refreshToken, hash);
};

const getClientInfo = (req: Request): { ip: string; userAgent: string } => {
  const ip = req.ip || 
    (typeof req.headers['x-forwarded-for'] === 'string' ? req.headers['x-forwarded-for'].split(',')[0].trim() : undefined) ||
    (req.socket?.remoteAddress) ||
    'unknown';
  
  const userAgent = typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : 'unknown';
  
  return { ip, userAgent };
};

export const authService = {
  requestOtp: async (
    data: RequestOtpRequest,
    req: Request
  ): Promise<{ message: string }> => {
    const { phone } = data;
    const { ip, userAgent } = getClientInfo(req);

    // Generate 5-digit OTP
    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);

    // Calculate expiry (5 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

    // Store OTP challenge
    await query(
      `INSERT INTO otp_challenges (phone, otp_hash, channel, purpose, expires_at, ip, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [phone, otpHash, 'sms', 'login', expiresAt, ip, userAgent]
    );

    // Log OTP request event (no account_id yet)
    await query(
      `INSERT INTO login_events (phone, event_type, reason, ip, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [phone, 'otp_requested', null, ip, userAgent]
    );

    // In production, send OTP via SMS service here
    // For now, we'll log it (but NEVER in production with real PHI)
    console.log(`[DEV ONLY] OTP for ${phone}: ${otp}`);

    return { message: 'OTP sent successfully' };
  },

  verifyOtp: async (
    data: VerifyOtpRequest,
    req: Request
  ): Promise<{ account: Account; tokens: Tokens; requiresOnboarding: boolean }> => {
    const { phone, otp } = data;
    const { ip, userAgent } = getClientInfo(req);

    // Find the most recent unverified OTP challenge for this phone
    const challenge = await queryOne<{
      id: string;
      otp_hash: string;
      expires_at: Date;
      attempts_used: number;
      max_attempts: number;
    }>(
      `SELECT id, otp_hash, expires_at, attempts_used, max_attempts
       FROM otp_challenges
       WHERE phone = $1
         AND verified_at IS NULL
         AND purpose = 'login'
       ORDER BY created_at DESC
       LIMIT 1`,
      [phone]
    );

    if (!challenge) {
      throw new HttpError(400, 'OTP_NOT_FOUND', 'No active OTP found. Please request a new one.');
    }

    // Check expiry
    if (new Date() > new Date(challenge.expires_at)) {
      throw new HttpError(400, 'OTP_EXPIRED', 'OTP has expired. Please request a new one.');
    }

    // Check attempts
    if (challenge.attempts_used >= challenge.max_attempts) {
      throw new HttpError(400, 'OTP_MAX_ATTEMPTS', 'Maximum OTP attempts exceeded. Please request a new one.');
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, challenge.otp_hash);
    
    // Increment attempts
    await query(
      `UPDATE otp_challenges SET attempts_used = attempts_used + 1 WHERE id = $1`,
      [challenge.id]
    );

    if (!isValid) {
      // Log failed attempt
      await query(
        `INSERT INTO login_events (phone, event_type, reason, ip, user_agent)
         VALUES ($1, $2, $3, $4, $5)`,
        [phone, 'otp_verification_failed', 'Invalid OTP', ip, userAgent]
      );

      throw new HttpError(400, 'INVALID_OTP', 'Invalid OTP. Please try again.');
    }

    // Mark OTP as verified
    await query(
      `UPDATE otp_challenges SET verified_at = NOW() WHERE id = $1`,
      [challenge.id]
    );

    // Check if account exists
    let account = await queryOne<{
      id: string;
      phone: string;
      full_name: string | null;
      date_of_birth: string | null;
      blood_group: string | null;
      email: string | null;
      created_at: Date;
    }>(
      `SELECT id, phone, full_name, date_of_birth, blood_group, email, created_at
       FROM accounts
       WHERE phone = $1`,
      [phone]
    );

    let accountId: string;
    let requiresOnboarding = false;

    if (!account) {
      // Create new account
      accountId = uuidv4();
      const now = new Date();

      await transaction(async (client) => {
        // Create account with phone only
        await client.query(
          `INSERT INTO accounts (id, phone, full_name, date_of_birth, blood_group, created_at, updated_at)
           VALUES ($1, $2, NULL, NULL, NULL, $3, $3)`,
          [accountId, phone, now]
        );

        // Create account_settings
        await client.query(
          `INSERT INTO account_settings (account_id, language, emergency_enabled, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $4)`,
          [accountId, 'en', true, now]
        );

        // Auto-create default "General" profile
        await client.query(
          `INSERT INTO profiles (id, account_id, name, is_default, created_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [uuidv4(), accountId, 'General', true, now]
        );
      });

      account = {
        id: accountId,
        phone,
        full_name: null,
        date_of_birth: null,
        blood_group: null,
        email: null,
        created_at: now,
      };

      requiresOnboarding = true;
    } else {
      accountId = account.id;
      // Check if onboarding is required
      requiresOnboarding = !account.full_name || !account.date_of_birth || !account.blood_group;
    }

    // Create auth session with refresh token
    const tokens = generateTokens(accountId);
    const refreshTokenHash = await hashRefreshToken(tokens.refreshToken);

    const sessionExpiresAt = new Date();
    sessionExpiresAt.setDate(sessionExpiresAt.getDate() + 7); // 7 days

    await query(
      `INSERT INTO auth_sessions (account_id, refresh_token_hash, expires_at, created_at, last_used_at)
       VALUES ($1, $2, $3, NOW(), NOW())`,
      [accountId, refreshTokenHash, sessionExpiresAt]
    );

    // Log successful login
    await query(
      `INSERT INTO login_events (account_id, phone, event_type, reason, ip, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [accountId, phone, 'login_success', null, ip, userAgent]
    );

    return {
      account: {
        id: account.id,
        phone: account.phone,
        fullName: account.full_name,
        dateOfBirth: account.date_of_birth,
        bloodGroup: account.blood_group,
        email: account.email,
        createdAt: account.created_at.toISOString(),
        requiresOnboarding,
      },
      tokens,
      requiresOnboarding,
    };
  },

  refreshToken: async (refreshToken: string): Promise<Tokens> => {
    try {
      const decoded = jwt.verify(refreshToken, config.jwtSecret) as {
        accountId: string;
        type?: string;
      };

      if (decoded.type !== 'refresh') {
        throw new HttpError(401, 'INVALID_TOKEN', 'Invalid token type');
      }

      const accountId = decoded.accountId;

      // Find active session with matching refresh token hash
      const sessions = await query<{
        id: string;
        refresh_token_hash: string;
        expires_at: Date;
      }>(
        `SELECT id, refresh_token_hash, expires_at
         FROM auth_sessions
         WHERE account_id = $1
           AND revoked_at IS NULL
           AND expires_at > NOW()
         ORDER BY created_at DESC`,
        [accountId]
      );

      let sessionFound = false;
      for (const session of sessions) {
        const isValid = await verifyRefreshTokenHash(refreshToken, session.refresh_token_hash);
        if (isValid) {
          sessionFound = true;

          // Rotate refresh token
          const newTokens = generateTokens(accountId);
          const newRefreshTokenHash = await hashRefreshToken(newTokens.refreshToken);

          const newSessionExpiresAt = new Date();
          newSessionExpiresAt.setDate(newSessionExpiresAt.getDate() + 7);

          // Revoke old session and create new one
          await query(
            `UPDATE auth_sessions SET revoked_at = NOW() WHERE id = $1`,
            [session.id]
          );

          await query(
            `INSERT INTO auth_sessions (account_id, refresh_token_hash, expires_at, created_at, last_used_at)
             VALUES ($1, $2, $3, NOW(), NOW())`,
            [accountId, newRefreshTokenHash, newSessionExpiresAt]
          );

          return newTokens;
        }
      }

      if (!sessionFound) {
        throw new HttpError(401, 'INVALID_TOKEN', 'Invalid or expired refresh token');
      }

      throw new HttpError(401, 'INVALID_TOKEN', 'Invalid refresh token');
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(401, 'INVALID_TOKEN', 'Invalid or expired refresh token');
    }
  },

  logout: async (refreshToken: string): Promise<void> => {
    try {
      const decoded = jwt.verify(refreshToken, config.jwtSecret) as {
        accountId: string;
        type?: string;
      };

      if (decoded.type !== 'refresh') {
        return; // Silently fail if token is invalid
      }

      const accountId = decoded.accountId;

      // Find and revoke all active sessions for this account
      const sessions = await query<{ id: string; refresh_token_hash: string }>(
        `SELECT id, refresh_token_hash
         FROM auth_sessions
         WHERE account_id = $1
           AND revoked_at IS NULL
           AND expires_at > NOW()`,
        [accountId]
      );

      for (const session of sessions) {
        const isValid = await verifyRefreshTokenHash(refreshToken, session.refresh_token_hash);
        if (isValid) {
          await query(
            `UPDATE auth_sessions SET revoked_at = NOW() WHERE id = $1`,
            [session.id]
          );
          return;
        }
      }
    } catch (error) {
      // Silently fail on logout
      return;
    }
  },

  getAccountById: async (accountId: string): Promise<Account | null> => {
    const account = await queryOne<{
      id: string;
      phone: string;
      full_name: string | null;
      date_of_birth: string | null;
      blood_group: string | null;
      email: string | null;
      created_at: Date;
    }>(
      `SELECT id, phone, full_name, date_of_birth, blood_group, email, created_at
       FROM accounts
       WHERE id = $1`,
      [accountId]
    );

    if (!account) {
      return null;
    }

    const requiresOnboarding = !account.full_name || !account.date_of_birth || !account.blood_group;

    return {
      id: account.id,
      phone: account.phone,
      fullName: account.full_name,
      dateOfBirth: account.date_of_birth,
      bloodGroup: account.blood_group,
      email: account.email,
      createdAt: account.created_at.toISOString(),
      requiresOnboarding,
    };
  },
};
