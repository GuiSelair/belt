import type { SqlDialect } from '../lib/dialects';

export type SqlExampleKind = 'simple' | 'complex' | 'invalid';

export interface SqlExample {
  kind: SqlExampleKind;
  title: string;
  description: string;
  sql: string;
}

function simple(description: string, sql: string): SqlExample {
  return { kind: 'simple', title: 'Simple query', description, sql };
}

function complex(description: string, sql: string): SqlExample {
  return { kind: 'complex', title: 'Complex query', description, sql };
}

function invalid(description: string, sql: string): SqlExample {
  return { kind: 'invalid', title: 'Invalid query', description, sql };
}

export const sqlExamples: Record<SqlDialect, SqlExample[]> = {
  postgresql: [
    simple(
      'Filters, sorts and limits rows with LIMIT.',
      `SELECT id, name, email
FROM users
WHERE active = TRUE
ORDER BY name
LIMIT 10;`,
    ),
    complex(
      'CTE, window function, ILIKE, :: cast and FETCH FIRST.',
      `WITH recent_orders AS (
  SELECT user_id, total, created_at::date AS order_date
  FROM orders
  WHERE created_at >= NOW() - INTERVAL '30 days'
)
SELECT u.name,
  COUNT(*) AS orders,
  SUM(r.total) AS revenue,
  RANK() OVER (ORDER BY SUM(r.total) DESC) AS ranking
FROM users u
JOIN recent_orders r ON r.user_id = u.id
WHERE u.email ILIKE '%@example.com'
GROUP BY u.name
ORDER BY revenue DESC
FETCH FIRST 5 ROWS ONLY;`,
    ),
    invalid(
      'TOP is SQL Server syntax. PostgreSQL uses LIMIT or FETCH FIRST.',
      `SELECT TOP 10 id, name
FROM users
ORDER BY name;`,
    ),
  ],
  mysql: [
    simple(
      'Filters, sorts and limits rows with LIMIT.',
      `SELECT id, name, email
FROM users
WHERE active = 1
ORDER BY created_at DESC
LIMIT 10;`,
    ),
    complex(
      'Backtick identifiers, date functions, HAVING and LIMIT offset, count.',
      `SELECT \`u\`.\`name\`,
  COUNT(\`o\`.\`id\`) AS \`orders\`,
  IFNULL(SUM(\`o\`.\`total\`), 0) AS \`revenue\`
FROM \`users\` AS \`u\`
LEFT JOIN \`orders\` AS \`o\`
  ON \`o\`.\`user_id\` = \`u\`.\`id\`
  AND \`o\`.\`created_at\` >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY \`u\`.\`name\`
HAVING COUNT(\`o\`.\`id\`) > 0
ORDER BY \`revenue\` DESC
LIMIT 20, 10;`,
    ),
    invalid(
      'MySQL does not support FETCH FIRST. Use LIMIT instead.',
      `SELECT id, name
FROM users
ORDER BY name
FETCH FIRST 10 ROWS ONLY;`,
    ),
  ],
  oracle: [
    simple(
      'Filters, sorts and limits rows with FETCH FIRST.',
      `SELECT id, name, email
FROM users
WHERE active = 1
ORDER BY name
FETCH FIRST 10 ROWS ONLY;`,
    ),
    complex(
      'Optimizer hint, (+) outer join, q-quoted string and CONNECT BY.',
      `SELECT /*+ FULL(e) */
  e.id,
  e.name,
  d.name AS department,
  LEVEL AS depth
FROM employees e, departments d
WHERE e.department_id = d.id(+)
  AND e.status <> q'[it's inactive]'
START WITH e.manager_id IS NULL
CONNECT BY PRIOR e.id = e.manager_id;`,
    ),
    invalid(
      'Oracle does not support LIMIT. Use FETCH FIRST instead.',
      `SELECT id, name
FROM users
ORDER BY name
LIMIT 10;`,
    ),
  ],
  clickhouse: [
    simple(
      'Aggregates events of the day with count() and LIMIT.',
      `SELECT event_type, count() AS total
FROM events
WHERE event_date = today()
GROUP BY event_type
ORDER BY total DESC
LIMIT 10;`,
    ),
    complex(
      'FINAL, PREWHERE, conditional aggregates, LIMIT BY and SETTINGS.',
      `SELECT
  user_id,
  toStartOfDay(created_at) AS day,
  countIf(event_type = 'purchase') AS purchases,
  uniqExact(session_id) AS sessions
FROM events FINAL
PREWHERE event_date >= today() - 7
WHERE event_type IN ('view', 'purchase')
GROUP BY user_id, day
ORDER BY purchases DESC
LIMIT 3 BY user_id
SETTINGS max_threads = 4;`,
    ),
    invalid(
      'CONNECT BY is Oracle syntax. ClickHouse has no hierarchical queries.',
      `SELECT id, name
FROM employees
START WITH manager_id IS NULL
CONNECT BY PRIOR id = manager_id;`,
    ),
  ],
  sqlserver: [
    simple(
      'Limits rows with TOP and filters a schema-qualified table.',
      `SELECT TOP 10 id, name, email
FROM dbo.users
WHERE active = 1
ORDER BY name;`,
    ),
    complex(
      'Bracket identifiers, table hint, CTE and OFFSET ... FETCH NEXT.',
      `WITH [recent_orders] AS (
  SELECT [user_id], [total]
  FROM [dbo].[orders] WITH (NOLOCK)
  WHERE [created_at] >= DATEADD(DAY, -30, GETDATE())
)
SELECT u.[name],
  COUNT(*) AS [orders],
  ISNULL(SUM(r.[total]), 0) AS [revenue]
FROM [dbo].[users] AS u
INNER JOIN [recent_orders] AS r ON r.[user_id] = u.[id]
GROUP BY u.[name]
ORDER BY [revenue] DESC
OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY;`,
    ),
    invalid(
      'SQL Server does not support LIMIT. Use TOP or OFFSET ... FETCH.',
      `SELECT id, name
FROM users
ORDER BY name
LIMIT 10;`,
    ),
  ],
};
