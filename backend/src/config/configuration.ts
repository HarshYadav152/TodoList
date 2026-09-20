export interface AppConfig {
  port: number;
  mongoUri: string;
  frontendUrl: string;
  jwt: {
    accessSecret: string;
    accessExpiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  vapid: {
    publicKey: string;
    privateKey: string;
    subject: string;
  };
}

/**
 * Single source of truth for env-derived config.
 * Fails loudly at boot if a required secret is missing in production,
 * so a mis-configured deploy never silently falls back to an insecure default.
 */
export default (): AppConfig => {
  const isProd = process.env.NODE_ENV === 'production';

  const required = (
    value: string | undefined,
    name: string,
    devFallback: string,
  ) => {
    if (value && value.length > 0) return value;
    if (isProd) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    return devFallback;
  };

  return {
    port: parseInt(process.env.PORT ?? '3001', 10),
    mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/todolist',
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    jwt: {
      accessSecret: required(
        process.env.JWT_ACCESS_SECRET,
        'JWT_ACCESS_SECRET',
        'dev-access-secret-change-me',
      ),
      accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
      refreshSecret: required(
        process.env.JWT_REFRESH_SECRET,
        'JWT_REFRESH_SECRET',
        'dev-refresh-secret-change-me',
      ),
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    },
    vapid: {
      publicKey: process.env.VAPID_PUBLIC_KEY ?? '',
      privateKey: process.env.VAPID_PRIVATE_KEY ?? '',
      subject: process.env.VAPID_SUBJECT ?? 'mailto:admin@example.com',
    },
  };
};
