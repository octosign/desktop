export interface BackendOption {
  id: string;
  label: string;
  defaultValue: string;
}

export interface BackendMetadata {
  status: 'OK' | string;
  supports?: string[];
  options?: BackendOption[];
}

export interface SignatureStatus {
  status: 'SIGNED' | 'UNSIGNED' | 'UNKNOWN';
  details?: string;
}
