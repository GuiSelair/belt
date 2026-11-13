import { describe, expect, it } from 'vitest';

import { toSqlSyntaxError } from './parseSql';
import { validateSql } from './validateSql';

function compatibleDialects(result: Awaited<ReturnType<typeof validateSql>>) {
  return result.compatibility
    .filter(({ ok }) => ok)
    .map(({ dialect }) => dialect);
}

describe('validateSql', () => {
  it('accepts valid SQL and lists the statements', async () => {
    const result = await validateSql({
      text: 'SELECT id FROM users; UPDATE users SET active = 1; DELETE FROM t',
      dialect: 'postgresql',
    });

    expect(result).toMatchObject({
      ok: true,
      statements: ['SELECT', 'UPDATE', 'DELETE'],
    });
  });

  it('reports the line and column of a syntax error', async () => {
    const result = await validateSql({
      text: 'SELECT id\nFROM users\nWHERE id = = 1',
      dialect: 'mysql',
    });

    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toMatchObject({ line: 3, column: 12 });
  });

  it('points to the end of the input when it ends too early', async () => {
    const text = 'SELECT id FROM users WHERE\n';
    const result = await validateSql({ text, dialect: 'oracle' });

    expect(!result.ok && result.error).toEqual({
      message: 'Expected: an expression, found: EOF',
      offset: 26,
      line: 1,
      column: 27,
    });
  });

  it('accepts dialect-specific syntax only where it belongs', async () => {
    const result = await validateSql({
      text: 'SELECT `id` FROM users',
      dialect: 'sqlserver',
    });

    expect(result.ok).toBe(false);
    expect(compatibleDialects(result)).toContain('mysql');
    expect(compatibleDialects(result)).not.toContain('postgresql');
  });

  it('validates SQL Server and ClickHouse specific syntax', async () => {
    const sqlServer = await validateSql({
      text: 'SELECT TOP 10 [id] FROM dbo.users',
      dialect: 'sqlserver',
    });
    const clickHouse = await validateSql({
      text: 'SELECT id FROM events FINAL WHERE dt = today()',
      dialect: 'clickhouse',
    });

    expect(sqlServer.ok).toBe(true);
    expect(clickHouse.ok).toBe(true);
  });
});

describe('toSqlSyntaxError', () => {
  it('moves the location from the message into the error', () => {
    const error = toSqlSyntaxError(
      {
        message:
          'sql parser error: Expected: an SQL statement, found: SELEC at Line: 2, Column: 3',
      },
      'x\n  SELEC id',
    );

    expect(error).toEqual({
      message: 'Expected: an SQL statement, found: SELEC',
      offset: 4,
      line: 2,
      column: 3,
    });
  });
});
