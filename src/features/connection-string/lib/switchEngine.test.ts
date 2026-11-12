import { describe, expect, it } from 'vitest';

import { switchEngine } from './switchEngine';
import type { ConnectionForm } from './types';

const baseForm: ConnectionForm = {
  engineId: 'postgresql',
  variantEnabled: false,
  hosts: [{ id: 'h1', host: 'db.local', port: '5432' }],
  username: 'app',
  password: 'secret',
  database: 'shop',
  instance: '',
  params: [
    { id: 'p1', key: 'sslmode', value: 'require', origin: 'suggested' },
    { id: 'p2', key: 'custom', value: '1', origin: 'custom' },
  ],
};

describe('switchEngine', () => {
  it('keeps shared fields and resets a port equal to the old default', () => {
    const { form } = switchEngine(baseForm, 'mysql');
    expect(form).toMatchObject({
      engineId: 'mysql',
      hosts: [{ id: 'h1', host: 'db.local', port: '' }],
      username: 'app',
      password: 'secret',
      database: 'shop',
    });
  });

  it('keeps a custom port', () => {
    const custom = {
      ...baseForm,
      hosts: [{ id: 'h1', host: 'db', port: '6000' }],
    };
    expect(switchEngine(custom, 'mysql').form.hosts[0].port).toBe('6000');
  });

  it('drops unsupported suggested params and reports them', () => {
    const { form, droppedParams } = switchEngine(baseForm, 'mysql');
    expect(droppedParams).toEqual(['sslmode']);
    expect(form.params.map(({ key }) => key)).toEqual(['custom']);
  });

  it('keeps only the first host when the next engine has a single host', () => {
    const multiHost: ConnectionForm = {
      ...baseForm,
      engineId: 'mongodb',
      hosts: [
        { id: 'h1', host: 'one', port: '' },
        { id: 'h2', host: 'two', port: '' },
      ],
    };
    expect(switchEngine(multiHost, 'redis').form.hosts).toHaveLength(1);
  });

  it('clears the instance when the next engine has none', () => {
    const sqlServer = {
      ...baseForm,
      engineId: 'sqlserver' as const,
      instance: 'X',
    };
    expect(switchEngine(sqlServer, 'postgresql').form.instance).toBe('');
  });
});
