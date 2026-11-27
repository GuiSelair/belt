import { describe, expect, it } from 'vitest';

import type { SqlDialect } from './dialects';
import { validateSql } from './validateSql';

async function compatibleDialects(text: string) {
  const result = await validateSql({ text, dialect: 'postgresql' });
  return result.compatibility
    .filter(({ ok }) => ok)
    .map(({ dialect }) => dialect);
}

describe('dialect rules', () => {
  it.each<[string, string, SqlDialect[]]>([
    ['TOP', 'SELECT TOP 10 id FROM users', ['clickhouse', 'sqlserver']],
    [
      'LIMIT',
      'SELECT id FROM users LIMIT 10',
      ['postgresql', 'mysql', 'clickhouse'],
    ],
    [
      'MySQL style LIMIT',
      'SELECT id FROM users LIMIT 5, 10',
      ['mysql', 'clickhouse'],
    ],
    [
      'FETCH FIRST without OFFSET',
      'SELECT id FROM users ORDER BY id FETCH FIRST 10 ROWS ONLY',
      ['postgresql', 'oracle', 'clickhouse'],
    ],
    [
      'OFFSET ... FETCH NEXT',
      'SELECT id FROM users ORDER BY id OFFSET 10 ROWS FETCH NEXT 10 ROWS ONLY',
      ['postgresql', 'oracle', 'clickhouse', 'sqlserver'],
    ],
    [
      'CONNECT BY',
      'SELECT id FROM t START WITH parent_id IS NULL CONNECT BY PRIOR id = parent_id',
      ['oracle'],
    ],
    [
      'the (+) outer join',
      'SELECT a.id FROM a, b WHERE a.id = b.a_id(+)',
      ['oracle'],
    ],
    [
      'ILIKE',
      "SELECT id FROM users WHERE name ILIKE 'a%'",
      ['postgresql', 'clickhouse'],
    ],
    ['the :: cast', 'SELECT id::text FROM users', ['postgresql', 'clickhouse']],
    [
      'a rule broken inside a subquery',
      'SELECT * FROM (SELECT id FROM users LIMIT 1) AS t',
      ['postgresql', 'mysql', 'clickhouse'],
    ],
  ])('limits %s to the dialects that support it', async (_, text, expected) => {
    expect(await compatibleDialects(text)).toEqual(expected);
  });

  it('keeps portable SQL valid in every dialect', async () => {
    expect(
      await compatibleDialects(
        'SELECT u.id, COUNT(o.id) FROM users u LEFT JOIN orders o ON o.user_id = u.id GROUP BY u.id',
      ),
    ).toHaveLength(5);
  });

  it('points to the start of the line that breaks the rule', async () => {
    const text =
      'SELECT name, salary\nFROM employees\n  ORDER BY salary DESC\n  FETCH FIRST 10 ROWS ONLY;';
    const result = await validateSql({ text, dialect: 'mysql' });

    expect(!result.ok && result.error).toEqual({
      message: 'FETCH FIRST is not supported, use LIMIT',
      offset: 60,
      line: 4,
      column: 3,
    });
  });

  it('reports the earliest violation first', async () => {
    const text = "SELECT TOP 5 id\nFROM users\nWHERE name ILIKE 'a%'";
    const result = await validateSql({ text, dialect: 'mysql' });

    expect(!result.ok && result.error).toMatchObject({
      message: 'TOP is only supported by SQL Server and ClickHouse',
      line: 1,
      column: 1,
    });
  });
});
