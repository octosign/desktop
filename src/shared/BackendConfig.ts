interface BackendConfig {
  name: string;
  description?: string;
  repository?: string;
  version: string;
  author?: string;
  license?: string;
  exec: string;
  build: string;
}

export default BackendConfig;
