/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_ENV: 'development' | 'production' | 'staging';
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_SENTRY_ENVIRONMENT: string;
  readonly VITE_FF_DARK_MODE_DEFAULT: string;
  readonly VITE_FF_ENABLE_GLOBAL_SEARCH: string;
  readonly VITE_FF_ENABLE_MOCK_API: string;
  readonly VITE_PWA_ENABLED: string;
  readonly VITE_POLLING_INTERVAL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
