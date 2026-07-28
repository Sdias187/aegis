export const featureFlags = {
  darkModeDefault: import.meta.env.VITE_FF_DARK_MODE_DEFAULT === 'true',
  globalSearchEnabled: import.meta.env.VITE_FF_ENABLE_GLOBAL_SEARCH === 'true',
  mockApiEnabled: import.meta.env.VITE_FF_ENABLE_MOCK_API === 'true',
} as const;
