/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEFAULT_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
