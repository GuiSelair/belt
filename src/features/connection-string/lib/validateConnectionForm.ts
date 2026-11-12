import { getEngine } from './engines';
import { isIpv6 } from './formatHost';
import { resolveEngine } from './resolveEngine';
import type { ConnectionForm } from './types';

export type FieldErrors = Record<string, string>;

export interface ConnectionFormValidation {
  fieldErrors: FieldErrors;
  warnings: string[];
  isValid: boolean;
}

const INVALID_HOST_CHARACTERS = /[\s/?#@[\]]/;
const IPV6_ADDRESS = /^[\da-f:.]+(%[\w.-]+)?$/i;
const DIGITS = /^\d+$/;
const MAX_PORT = 65_535;

export function hostFieldId(hostId: string) {
  return `host-${hostId}`;
}

export function portFieldId(hostId: string) {
  return `port-${hostId}`;
}

export const DATABASE_FIELD_ID = 'database';

function validateHost(rawHost: string): string | null {
  const host = rawHost.trim();
  if (host === '') return 'Host is required.';
  const bareHost = host.replace(/^\[(.*)\]$/, '$1');
  if (isIpv6(bareHost)) {
    return IPV6_ADDRESS.test(bareHost)
      ? null
      : 'Enter the port in the Port field, not in the host.';
  }
  if (INVALID_HOST_CHARACTERS.test(host)) {
    return 'Host contains characters that are not allowed.';
  }
  return null;
}

function validatePort(rawPort: string): string | null {
  const port = rawPort.trim();
  if (port === '') return null;
  const value = Number(port);
  if (!DIGITS.test(port) || value < 1 || value > MAX_PORT) {
    return 'Port must be a number between 1 and 65535.';
  }
  return null;
}

function findDuplicateKeys(form: ConnectionForm) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const { key } of form.params) {
    const trimmed = key.trim();
    if (trimmed === '') continue;
    if (seen.has(trimmed)) duplicates.add(trimmed);
    seen.add(trimmed);
  }
  return [...duplicates];
}

export function validateConnectionForm(
  form: ConnectionForm,
): ConnectionFormValidation {
  const engine = getEngine(form.engineId);
  const resolved = resolveEngine(engine, form.variantEnabled);
  const hosts = resolved.allowsMultipleHosts
    ? form.hosts
    : form.hosts.slice(0, 1);
  const fieldErrors: FieldErrors = {};

  for (const { id, host, port } of hosts) {
    const hostError = validateHost(host);
    if (hostError) fieldErrors[hostFieldId(id)] = hostError;
    const portError = resolved.defaultPort === null ? null : validatePort(port);
    if (portError) fieldErrors[portFieldId(id)] = portError;
  }

  const database = form.database.trim();
  if (engine.database.numeric && database !== '' && !DIGITS.test(database)) {
    fieldErrors[DATABASE_FIELD_ID] =
      `${engine.database.label} must be a number, for example 0.`;
  }

  const warnings = findDuplicateKeys(form).map(
    (key) => `Parameter "${key}" is defined more than once.`,
  );

  return {
    fieldErrors,
    warnings,
    isValid: Object.keys(fieldErrors).length === 0,
  };
}
