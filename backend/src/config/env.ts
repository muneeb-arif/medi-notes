export const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
  jwtAccessExpiry: '15m',
  jwtRefreshExpiry: '7d',
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/medinotes',
  appEnv: process.env.APP_ENV || 'production',
  testOtp: process.env.TEST_OTP || '00000',
};

