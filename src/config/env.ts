export const env = {
  isDevelopment: import.meta.env.VITE_ENV === 'development',
  isProduction: import.meta.env.VITE_ENV === 'production',
  isStaging: import.meta.env.VITE_ENV === 'staging',
  isMockEnabled: import.meta.env.VITE_FF_ENABLE_MOCK_API === 'true',
  isPWAEnabled: import.meta.env.VITE_PWA_ENABLED === 'true',
} as const;
