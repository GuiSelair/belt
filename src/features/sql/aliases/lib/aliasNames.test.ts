import { describe, expect, it } from 'vitest';

import { NamePool, quoteIdentifier, tableAliasBase } from './aliasNames';

describe('tableAliasBase', () => {
  it('uses the initials of each word', () => {
    expect(tableAliasBase('users')).toBe('u');
    expect(tableAliasBase('order_items')).toBe('oi');
    expect(tableAliasBase('UserAccounts')).toBe('ua');
    expect(tableAliasBase('2024_sales')).toBe('s');
    expect(tableAliasBase('___')).toBe('t');
  });
});

describe('NamePool', () => {
  it('adds a numeric suffix to taken and reserved names', () => {
    const pool = new NamePool();
    pool.reserve('U');

    expect(pool.claim('u')).toBe('u2');
    expect(pool.claim('u')).toBe('u3');
    expect(pool.claim('on')).toBe('on2');
  });

  it('can allow reserved words for names that get quoted', () => {
    expect(new NamePool(false).claim('order', '_')).toBe('order');
  });
});

describe('quoteIdentifier', () => {
  it('quotes only names that need it, using the dialect quote', () => {
    expect(quoteIdentifier('total', 'postgresql')).toBe('total');
    expect(quoteIdentifier('order', 'postgresql')).toBe('"order"');
    expect(quoteIdentifier('my name', 'mysql')).toBe('`my name`');
    expect(quoteIdentifier('user', 'sqlserver')).toBe('[user]');
  });
});
