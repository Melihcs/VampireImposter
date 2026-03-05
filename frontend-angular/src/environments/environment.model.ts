export interface RuntimeFeatureFlags {
  enableRealtime: boolean;
  enableVerboseLogging: boolean;
  useMockData: boolean;
}

export interface AppEnvironment {
  production: boolean;
  apiBaseUrl: string;
  runtimeConfigUrl: string;
  features: RuntimeFeatureFlags;
}
