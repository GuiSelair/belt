export type EngineId =
  | 'postgresql'
  | 'mysql'
  | 'mongodb'
  | 'redis'
  | 'oracle'
  | 'clickhouse'
  | 'sqlserver';

export interface EngineVariant {
  label: string;
  scheme: string;
  /** `null` means the URI carries no port (e.g. `mongodb+srv`). */
  defaultPort: number | null;
  impliedParams?: Record<string, string>;
  singleHost?: boolean;
}

export interface ParamSuggestion {
  key: string;
  description: string;
  values?: readonly string[];
  driverSpecific?: boolean;
}

export interface DatabaseField {
  label: string;
  placement: 'path' | 'query';
  queryKey?: string;
  numeric?: boolean;
  helperText?: string;
}

export interface EngineDefinition {
  id: EngineId;
  label: string;
  scheme: string;
  defaultPort: number;
  variant?: EngineVariant;
  credentials: 'userinfo' | 'none' | 'password-only-allowed';
  multipleHosts: boolean;
  database: DatabaseField;
  supportsInstance: boolean;
  suggestedParams: readonly ParamSuggestion[];
  notice?: string;
}

export interface HostEntry {
  id: string;
  host: string;
  port: string;
}

export interface ParamEntry {
  id: string;
  key: string;
  value: string;
  origin: 'suggested' | 'custom';
}

export interface ConnectionForm {
  engineId: EngineId;
  variantEnabled: boolean;
  hosts: HostEntry[];
  username: string;
  password: string;
  database: string;
  instance: string;
  params: ParamEntry[];
}

export interface EncodedCharacter {
  char: string;
  encoded: string;
}

export interface FieldEncoding {
  field: string;
  changes: EncodedCharacter[];
  hadPercent: boolean;
}

export interface BuildResult {
  uri: string;
  maskedUri: string;
  encodings: FieldEncoding[];
}
