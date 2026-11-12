import { describe, expect, it } from 'vitest';

import type { ConnectionForm } from './types';
import {
  DATABASE_FIELD_ID,
  hostFieldId,
  portFieldId,
  validateConnectionForm,
} from './validateConnectionForm';

function formWith(overrides: Partial<ConnectionForm> = {}): ConnectionForm {
  return {
    engineId: 'postgresql',
    variantEnabled: false,
    hosts: [{ id: 'h1', host: 'db.local', port: '' }],
    username: '',
    password: '',
    database: '',
    instance: '',
    params: [],
    ...overrides,
  };
}

describe('validateConnectionForm', () => {
  it('accepts a minimal form', () => {
    expect(validateConnectionForm(formWith())).toEqual({
      fieldErrors: {},
      warnings: [],
      isValid: true,
    });
  });

  it('requires a host', () => {
    const result = validateConnectionForm(
      formWith({ hosts: [{ id: 'h1', host: ' ', port: '' }] }),
    );
    expect(result.isValid).toBe(false);
    expect(result.fieldErrors[hostFieldId('h1')]).toBe('Host is required.');
  });

  it.each(['0', '65536', 'abc', '54.3'])('rejects port %s', (port) => {
    const result = validateConnectionForm(
      formWith({ hosts: [{ id: 'h1', host: 'db.local', port }] }),
    );
    expect(result.fieldErrors[portFieldId('h1')]).toMatch(
      /between 1 and 65535/,
    );
  });

  it('accepts IPv6 hosts and rejects host:port typed in the host', () => {
    const ipv6 = formWith({ hosts: [{ id: 'h1', host: '::1', port: '' }] });
    expect(validateConnectionForm(ipv6).isValid).toBe(true);

    const hostWithPort = formWith({
      hosts: [{ id: 'h1', host: 'db.local:5432', port: '' }],
    });
    expect(validateConnectionForm(hostWithPort).fieldErrors).toEqual({
      [hostFieldId('h1')]: 'Enter the port in the Port field, not in the host.',
    });
  });

  it('requires a numeric Redis database index', () => {
    const result = validateConnectionForm(
      formWith({ engineId: 'redis', database: 'cache' }),
    );
    expect(result.fieldErrors[DATABASE_FIELD_ID]).toMatch(/must be a number/);
  });

  it('warns about duplicated param keys', () => {
    const result = validateConnectionForm(
      formWith({
        params: [
          { id: 'p1', key: 'sslmode', value: 'require', origin: 'suggested' },
          { id: 'p2', key: 'sslmode', value: 'disable', origin: 'custom' },
        ],
      }),
    );
    expect(result.warnings).toEqual([
      'Parameter "sslmode" is defined more than once.',
    ]);
    expect(result.isValid).toBe(true);
  });
});
