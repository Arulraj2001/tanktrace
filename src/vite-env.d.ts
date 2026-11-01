/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AWS_LOCATION_API_KEY?: string;
  readonly VITE_AWS_LOCATION_MAP_NAME?: string;
  readonly VITE_AWS_LOCATION_REGION?: string;
  readonly VITE_S3_DATA_URL?: string;
  readonly VITE_APP_ENV?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
