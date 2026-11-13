import { describe, expect, it } from 'vitest';

import type { SqlDialect } from '../../lib/dialects';
import { NOTICES, addAliases } from './addAliases';

async function aliased(text: string, dialect: SqlDialect = 'postgresql') {
  const result = await addAliases({ text, dialect });
  if (!result.ok) throw new Error(result.error.message);
  return result;
}

async function output(text: string, dialect: SqlDialect = 'postgresql') {
  return (await aliased(text, dialect)).output;
}

describe('addAliases', () => {
  it('aliases tables, joins and every selected column', async () => {
    expect(
      await output(
        'SELECT users.id, users.name, COUNT(orders.id)\n' +
          'FROM users\n' +
          'LEFT JOIN orders ON orders.user_id = users.id\n' +
          'GROUP BY users.id, users.name',
      ),
    ).toBe(
      'SELECT u.id AS id, u.name AS name, COUNT(o.id) AS count_id\n' +
        'FROM users AS u\n' +
        'LEFT JOIN orders AS o ON o.user_id = u.id\n' +
        'GROUP BY u.id, u.name',
    );
  });

  it('builds table aliases from initials and keeps them unique', async () => {
    expect(
      await output(
        'SELECT order_items.id FROM order_items JOIN orders ON TRUE JOIN organizations ON TRUE',
      ),
    ).toBe(
      'SELECT oi.id AS id FROM order_items AS oi JOIN orders AS o ON TRUE JOIN organizations AS o2 ON TRUE',
    );
  });

  it('keeps existing aliases and makes implicit ones explicit', async () => {
    expect(await output('SELECT u.id uid, u.name AS name FROM users u')).toBe(
      'SELECT u.id AS uid, u.name AS name FROM users AS u',
    );
  });

  it('does not reuse names already taken in the query', async () => {
    expect(await output('SELECT u.id FROM users u JOIN uploads ON TRUE')).toBe(
      'SELECT u.id AS id FROM users AS u JOIN uploads AS u2 ON TRUE',
    );
  });

  it('keeps column aliases unique within a SELECT list', async () => {
    expect(await output('SELECT a.id, b.id, 1 + 1, 2 FROM a, b')).toBe(
      'SELECT a2.id AS id, b2.id AS id_2, 1 + 1 AS expr, 2 AS expr_2 FROM a AS a2, b AS b2',
    );
  });

  it('renames schema-qualified references', async () => {
    expect(await output('SELECT sales.orders.id FROM sales.orders')).toBe(
      'SELECT o.id AS id FROM sales.orders AS o',
    );
  });

  it('renames qualified wildcards and leaves bare wildcards alone', async () => {
    expect(await output('SELECT users.*, * FROM users')).toBe(
      'SELECT u.*, * FROM users AS u',
    );
  });

  it('gives each subquery its own scope', async () => {
    expect(
      await output(
        'SELECT users.id FROM users WHERE EXISTS (SELECT 1 FROM users WHERE users.id > 0)',
      ),
    ).toBe(
      'SELECT u.id AS id FROM users AS u WHERE EXISTS (SELECT 1 AS expr FROM users AS u2 WHERE u2.id > 0)',
    );
  });

  it('lets correlated subqueries reach the outer tables', async () => {
    expect(
      await output(
        'SELECT users.id FROM users WHERE EXISTS (SELECT 1 FROM orders WHERE orders.user_id = users.id)',
      ),
    ).toBe(
      'SELECT u.id AS id FROM users AS u WHERE EXISTS (SELECT 1 AS expr FROM orders AS o WHERE o.user_id = u.id)',
    );
  });

  it('aliases derived tables and their contents', async () => {
    expect(
      await output('SELECT total FROM (SELECT count(*) FROM orders)'),
    ).toBe(
      'SELECT total AS total FROM (SELECT count(*) AS count FROM orders AS o) AS sq',
    );
  });

  it('handles CTEs and set operations', async () => {
    expect(
      await output(
        'WITH recent AS (SELECT id FROM orders) SELECT recent.id FROM recent UNION SELECT id FROM archive',
      ),
    ).toBe(
      'WITH recent AS (SELECT id AS id FROM orders AS o) SELECT r.id AS id FROM recent AS r UNION SELECT id AS id FROM archive AS a',
    );
  });

  it('renames references in ORDER BY', async () => {
    expect(await output('SELECT users.id FROM users ORDER BY users.name')).toBe(
      'SELECT u.id AS id FROM users AS u ORDER BY u.name',
    );
  });

  it('keeps formatting and comments', async () => {
    expect(
      await output(
        'SELECT\n  id, -- primary key\n  name\nFROM users /* all */',
      ),
    ).toBe(
      'SELECT\n  id AS id, -- primary key\n  name AS name\nFROM users AS u /* all */',
    );
  });

  it('omits AS before table aliases in Oracle', async () => {
    expect(
      await output(
        'SELECT users.id FROM users JOIN orders o ON 1 = 1',
        'oracle',
      ),
    ).toBe('SELECT u.id AS id FROM users u JOIN orders o ON 1 = 1');
  });

  it('quotes column aliases with the dialect quote when needed', async () => {
    expect(await output('SELECT `order` FROM t', 'mysql')).toBe(
      'SELECT `order` AS `order` FROM t AS t2',
    );
    expect(await output('SELECT TOP 5 [user] FROM t', 'sqlserver')).toBe(
      'SELECT TOP 5 [user] AS [user] FROM t AS t2',
    );
  });

  it('keeps SQL Server alias assignments as they are', async () => {
    expect(await output('SELECT total = a + b FROM t', 'sqlserver')).toBe(
      'SELECT total = a + b FROM t AS t2',
    );
  });

  it('finds the end of complex select items', async () => {
    expect(
      await output(
        "SELECT DISTINCT EXTRACT(YEAR FROM o.created_at), CASE WHEN o.total > 0 THEN 'a, b' END, " +
          'row_number() OVER (PARTITION BY o.id ORDER BY o.total), o.total::text FROM orders o',
      ),
    ).toBe(
      "SELECT DISTINCT EXTRACT(YEAR FROM o.created_at) AS expr, CASE WHEN o.total > 0 THEN 'a, b' END AS expr_2, " +
        'row_number() OVER (PARTITION BY o.id ORDER BY o.total) AS row_number, o.total::text AS total FROM orders AS o',
    );
  });

  it('handles quoted table names and ClickHouse', async () => {
    expect(
      await output('SELECT `order_items`.id FROM `order_items`', 'mysql'),
    ).toBe('SELECT oi.id AS id FROM `order_items` AS oi');
    expect(
      await output(
        'SELECT events.id, count() FROM events GROUP BY events.id',
        'clickhouse',
      ),
    ).toBe(
      'SELECT e.id AS id, count() AS count FROM events AS e GROUP BY e.id',
    );
  });

  it('leaves ClickHouse tables read with FINAL without an alias', async () => {
    const result = await aliased(
      'SELECT events.id FROM events FINAL',
      'clickhouse',
    );

    expect(result.output).toBe('SELECT events.id AS id FROM events FINAL');
    expect(result.notices).toContain(NOTICES.skippedFinalTable);
  });

  it('handles every statement in the input', async () => {
    expect(await output('SELECT a FROM t1; SELECT b FROM t2;')).toBe(
      'SELECT a AS a FROM t1 AS t; SELECT b AS b FROM t2 AS t3;',
    );
  });

  it('warns about unqualified columns when several tables are joined', async () => {
    const result = await aliased(
      'SELECT name FROM users JOIN orders ON orders.user_id = users.id',
    );

    expect(result.notices).toContain(NOTICES.unqualifiedColumns);
  });

  it('reports syntax errors with their position', async () => {
    const result = await addAliases({
      text: 'SELECT id FROM',
      dialect: 'postgresql',
    });

    expect(result.ok).toBe(false);
    expect(!result.ok && result.error.line).toBe(1);
  });
});
