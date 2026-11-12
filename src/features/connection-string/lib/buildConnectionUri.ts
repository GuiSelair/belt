import { getEngine } from './engines';
import { formatHost } from './formatHost';
import { encodeTracked } from './percentEncode';
import { resolveEngine, type ResolvedEngine } from './resolveEngine';
import type {
  BuildResult,
  ConnectionForm,
  EngineDefinition,
  FieldEncoding,
} from './types';

export const MASKED_PASSWORD = '••••';

interface UriParts {
  encode(field: string, value: string): string;
  encodePassword(): string;
}

function getActiveHosts(form: ConnectionForm, resolved: ResolvedEngine) {
  return resolved.allowsMultipleHosts ? form.hosts : form.hosts.slice(0, 1);
}

function buildUserInfo(
  form: ConnectionForm,
  engine: EngineDefinition,
  { encode, encodePassword }: UriParts,
) {
  const hasPassword = form.password !== '';
  if (engine.credentials === 'none') return '';
  if (form.username === '') {
    const allowsPasswordOnly = engine.credentials === 'password-only-allowed';
    return allowsPasswordOnly && hasPassword ? `:${encodePassword()}@` : '';
  }
  const user = encode('Username', form.username);
  return hasPassword ? `${user}:${encodePassword()}@` : `${user}@`;
}

function buildHosts(
  form: ConnectionForm,
  engine: EngineDefinition,
  resolved: ResolvedEngine,
) {
  const omitsDefaultPort = engine.supportsInstance && form.instance !== '';

  return getActiveHosts(form, resolved)
    .map(({ host, port }) => {
      const typedPort = port.trim();
      if (typedPort !== '') return `${formatHost(host)}:${typedPort}`;
      if (resolved.defaultPort === null || omitsDefaultPort) {
        return formatHost(host);
      }
      return `${formatHost(host)}:${resolved.defaultPort}`;
    })
    .join(',');
}

function buildQuery(
  form: ConnectionForm,
  engine: EngineDefinition,
  resolved: ResolvedEngine,
  { encode }: UriParts,
) {
  const params = form.params.filter((param) => param.key.trim() !== '');
  const userKeys = new Set(params.map((param) => param.key.trim()));
  const pairs: string[] = [];

  const { placement, queryKey, label } = engine.database;
  if (placement === 'query' && queryKey && form.database !== '') {
    pairs.push(`${queryKey}=${encode(label, form.database)}`);
  }
  for (const [key, value] of Object.entries(resolved.impliedParams)) {
    if (!userKeys.has(key)) pairs.push(`${key}=${value}`);
  }
  for (const { key, value } of params) {
    const field = `Parameter "${key.trim()}"`;
    pairs.push(`${encode(field, key.trim())}=${encode(field, value)}`);
  }

  return pairs.length > 0 ? `?${pairs.join('&')}` : '';
}

function buildPath(
  form: ConnectionForm,
  engine: EngineDefinition,
  { encode }: UriParts,
  hasQuery: boolean,
) {
  if (engine.supportsInstance && form.instance !== '') {
    return `/${encode('Instance', form.instance)}`;
  }
  if (engine.database.placement === 'path' && form.database !== '') {
    return `/${encode(engine.database.label, form.database)}`;
  }
  return engine.database.placement === 'path' && hasQuery ? '/' : '';
}

function composeUri(form: ConnectionForm, parts: UriParts) {
  const engine = getEngine(form.engineId);
  const resolved = resolveEngine(engine, form.variantEnabled);
  const query = buildQuery(form, engine, resolved, parts);

  return [
    `${resolved.scheme}://`,
    buildUserInfo(form, engine, parts),
    buildHosts(form, engine, resolved),
    buildPath(form, engine, parts, query !== ''),
    query,
  ].join('');
}

export function buildConnectionUri(form: ConnectionForm): BuildResult {
  const encodings = new Map<string, FieldEncoding>();

  function trackingEncode(field: string, value: string) {
    const { encoded, changes, hadPercent } = encodeTracked(value);
    if (changes.length === 0) return encoded;
    const current = encodings.get(field);
    const merged = new Map(
      [...(current?.changes ?? []), ...changes].map((change) => [
        change.char,
        change,
      ]),
    );
    encodings.set(field, {
      field,
      changes: [...merged.values()],
      hadPercent: Boolean(current?.hadPercent) || hadPercent,
    });
    return encoded;
  }

  function plainEncode(_field: string, value: string) {
    return encodeTracked(value).encoded;
  }

  const uri = composeUri(form, {
    encode: trackingEncode,
    encodePassword: () => trackingEncode('Password', form.password),
  });
  const maskedUri = composeUri(form, {
    encode: plainEncode,
    encodePassword: () => MASKED_PASSWORD,
  });

  return { uri, maskedUri, encodings: [...encodings.values()] };
}
