import type { JsonObject } from './decodeJwt';

export type JwtStatus = 'active' | 'expired' | 'not-yet-valid' | 'no-expiry';

export interface ClaimRow {
  key: string;
  label: string;
  value: string;
  detail?: string;
}

export interface JwtDescription {
  algorithm: string | null;
  type: string | null;
  status: JwtStatus;
  claims: ClaimRow[];
}

const REGISTERED_CLAIMS: readonly { key: string; label: string }[] = [
  { key: 'iss', label: 'Issuer' },
  { key: 'sub', label: 'Subject' },
  { key: 'aud', label: 'Audience' },
  { key: 'iat', label: 'Issued at' },
  { key: 'nbf', label: 'Not before' },
  { key: 'exp', label: 'Expires at' },
  { key: 'jti', label: 'JWT ID' },
];

const TIME_CLAIMS = new Set(['iat', 'nbf', 'exp']);

const RELATIVE_UNITS: readonly [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 60 * 60],
  ['month', 30 * 24 * 60 * 60],
  ['day', 24 * 60 * 60],
  ['hour', 60 * 60],
  ['minute', 60],
  ['second', 1],
];

const relativeFormatter = new Intl.RelativeTimeFormat('en', {
  numeric: 'auto',
});

export function formatRelativeTime(seconds: number, nowSeconds: number) {
  const delta = seconds - nowSeconds;
  const magnitude = Math.abs(delta);
  const [unit, size] =
    RELATIVE_UNITS.find(([, unitSize]) => magnitude >= unitSize) ??
    RELATIVE_UNITS[RELATIVE_UNITS.length - 1];
  return relativeFormatter.format(Math.trunc(delta / size), unit);
}

function readNumericDate(payload: JsonObject, key: string): number | null {
  const value = payload[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function readString(object: JsonObject, key: string): string | null {
  const value = object[key];
  return typeof value === 'string' ? value : null;
}

function describeValue(value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join(', ');
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

function describeTime(seconds: number, nowSeconds: number) {
  const date = new Date(seconds * 1000);
  if (Number.isNaN(date.getTime())) return undefined;
  return `${date.toISOString()} (${formatRelativeTime(seconds, nowSeconds)})`;
}

function resolveStatus(payload: JsonObject, nowSeconds: number): JwtStatus {
  const notBefore = readNumericDate(payload, 'nbf');
  const expiresAt = readNumericDate(payload, 'exp');
  if (notBefore !== null && nowSeconds < notBefore) return 'not-yet-valid';
  if (expiresAt === null) return 'no-expiry';
  return nowSeconds >= expiresAt ? 'expired' : 'active';
}

export function describeClaims(
  header: JsonObject,
  payload: JsonObject,
  now: Date = new Date(),
): JwtDescription {
  const nowSeconds = Math.floor(now.getTime() / 1000);
  const claims = REGISTERED_CLAIMS.filter(({ key }) => key in payload).map(
    ({ key, label }): ClaimRow => {
      const value = payload[key];
      const seconds = TIME_CLAIMS.has(key)
        ? readNumericDate(payload, key)
        : null;
      return {
        key,
        label,
        value: describeValue(value),
        detail:
          seconds === null ? undefined : describeTime(seconds, nowSeconds),
      };
    },
  );

  return {
    algorithm: readString(header, 'alg'),
    type: readString(header, 'typ'),
    status: resolveStatus(payload, nowSeconds),
    claims,
  };
}
