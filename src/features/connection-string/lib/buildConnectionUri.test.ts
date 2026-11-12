import { describe, expect, it } from 'vitest';

import { buildConnectionUri } from './buildConnectionUri';
import { createConnectionForm } from './createConnectionForm';
import type { ConnectionForm, EngineId, ParamEntry } from './types';

let nextId = 0;
function createId() {
  nextId += 1;
  return `id-${nextId}`;
}

function param(key: string, value: string): ParamEntry {
  return { id: createId(), key, value, origin: 'custom' };
}

function formFor(
  engineId: EngineId,
  overrides: Partial<ConnectionForm> & { host?: string; port?: string } = {},
): ConnectionForm {
  const { host = 'db.local', port = '', ...rest } = overrides;
  return {
    ...createConnectionForm(engineId, createId),
    hosts: [{ id: createId(), host, port }],
    ...rest,
  };
}

const credentials = { username: 'app', password: 'secret', database: 'shop' };

describe('buildConnectionUri', () => {
  it.each([
    ['postgresql', {}, 'postgresql://app:secret@db.local:5432/shop'],
    ['mysql', {}, 'mysql://app:secret@db.local:3306/shop'],
    ['mongodb', {}, 'mongodb://app:secret@db.local:27017/shop'],
    [
      'mongodb',
      { variantEnabled: true },
      'mongodb+srv://app:secret@db.local/shop',
    ],
    ['redis', { database: '2' }, 'redis://app:secret@db.local:6379/2'],
    [
      'redis',
      { variantEnabled: true, database: '0' },
      'rediss://app:secret@db.local:6379/0',
    ],
    ['oracle', { database: 'ORCLPDB1' }, 'tcp://db.local:1521/ORCLPDB1'],
    [
      'oracle',
      { variantEnabled: true, database: 'ORCLPDB1' },
      'tcps://db.local:2484/ORCLPDB1',
    ],
    ['clickhouse', {}, 'clickhouse://app:secret@db.local:9000/shop'],
    [
      'clickhouse',
      { variantEnabled: true },
      'clickhouse://app:secret@db.local:9440/shop?secure=true',
    ],
    ['sqlserver', {}, 'sqlserver://app:secret@db.local:1433?database=shop'],
    [
      'sqlserver',
      { instance: 'SQLEXPRESS' },
      'sqlserver://app:secret@db.local/SQLEXPRESS?database=shop',
    ],
    [
      'sqlserver',
      { instance: 'SQLEXPRESS', port: '1500' },
      'sqlserver://app:secret@db.local:1500/SQLEXPRESS?database=shop',
    ],
  ] as const)('builds %s %j', (engineId, overrides, expected) => {
    const form = formFor(engineId, { ...credentials, ...overrides });
    expect(buildConnectionUri(form).uri).toBe(expected);
  });

  it('omits userinfo without a username and the password when empty', () => {
    expect(buildConnectionUri(formFor('postgresql')).uri).toBe(
      'postgresql://db.local:5432',
    );
    expect(
      buildConnectionUri(formFor('postgresql', { username: 'app' })).uri,
    ).toBe('postgresql://app@db.local:5432');
  });

  it('allows a password without username on Redis', () => {
    const form = formFor('redis', { password: 'secret' });
    expect(buildConnectionUri(form).uri).toBe('redis://:secret@db.local:6379');
  });

  it('lists multiple MongoDB hosts and adds the slash before the query', () => {
    const form = formFor('mongodb', {
      hosts: [
        { id: 'a', host: 'one.local', port: '' },
        { id: 'b', host: 'two.local', port: '27018' },
      ],
      params: [param('replicaSet', 'rs0')],
    });
    expect(buildConnectionUri(form).uri).toBe(
      'mongodb://one.local:27017,two.local:27018/?replicaSet=rs0',
    );
  });

  it('keeps only the first host in SRV mode', () => {
    const form = formFor('mongodb', {
      variantEnabled: true,
      hosts: [
        { id: 'a', host: 'cluster.example.net', port: '' },
        { id: 'b', host: 'ignored.local', port: '' },
      ],
    });
    expect(buildConnectionUri(form).uri).toBe(
      'mongodb+srv://cluster.example.net',
    );
  });

  it('wraps IPv6 hosts in brackets', () => {
    expect(buildConnectionUri(formFor('postgresql', { host: '::1' })).uri).toBe(
      'postgresql://[::1]:5432',
    );
  });

  it('appends params and lets a user param override an implied one', () => {
    const postgres = formFor('postgresql', {
      ...credentials,
      params: [param('sslmode', 'require')],
    });
    expect(buildConnectionUri(postgres).uri).toBe(
      'postgresql://app:secret@db.local:5432/shop?sslmode=require',
    );

    const clickhouse = formFor('clickhouse', {
      variantEnabled: true,
      params: [param('secure', 'false')],
    });
    expect(buildConnectionUri(clickhouse).uri).toBe(
      'clickhouse://db.local:9440/?secure=false',
    );
  });

  it('percent-encodes credentials and reports the changes', () => {
    const form = formFor('postgresql', {
      username: 'app',
      password: 'p@ss#1',
      database: 'shop',
    });
    const result = buildConnectionUri(form);

    expect(result.uri).toBe('postgresql://app:p%40ss%231@db.local:5432/shop');
    expect(result.encodings).toEqual([
      {
        field: 'Password',
        changes: [
          { char: '@', encoded: '%40' },
          { char: '#', encoded: '%23' },
        ],
        hadPercent: false,
      },
    ]);
  });

  it('treats typed percent sequences as raw text', () => {
    const form = formFor('postgresql', { username: 'app', password: '%40' });
    const result = buildConnectionUri(form);
    expect(result.uri).toContain(':%2540@');
    expect(result.encodings[0].hadPercent).toBe(true);
  });

  it('round-trips encoded credentials through the URL parser', () => {
    const password = 'p@ss:w/rd?#[]% &=+ção';
    const form = formFor('postgresql', { username: 'user@corp', password });
    const url = new URL(buildConnectionUri(form).uri);

    expect(decodeURIComponent(url.username)).toBe('user@corp');
    expect(decodeURIComponent(url.password)).toBe(password);
    expect(url.hostname).toBe('db.local');
  });

  it('masks the password in the preview URI', () => {
    const form = formFor('postgresql', { username: 'app', password: 'p@ss' });
    expect(buildConnectionUri(form).maskedUri).toBe(
      'postgresql://app:••••@db.local:5432',
    );
  });

  it('ignores credentials for Oracle', () => {
    const form = formFor('oracle', { username: 'app', password: 'p@ss' });
    const result = buildConnectionUri(form);
    expect(result.uri).toBe('tcp://db.local:1521');
    expect(result.encodings).toEqual([]);
  });
});
