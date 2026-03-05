import type { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: true,
  apiBaseUrl: '/api',
  runtimeConfigUrl: '/assets/runtime-config.json',
  features: {
    enableRealtime: false,
    enableVerboseLogging: false,
    useMockData: false
  }
};
