import type { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: false,
  apiBaseUrl: '/api',
  runtimeConfigUrl: '/assets/runtime-config.json',
  features: {
    enableRealtime: false,
    enableVerboseLogging: true,
    useMockData: false
  }
};
