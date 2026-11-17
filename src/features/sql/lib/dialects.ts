import type { DialectName } from '@guanmingchiu/sqlparser-ts';

export type SqlDialect =
  'postgresql' | 'mysql' | 'oracle' | 'clickhouse' | 'sqlserver';

export interface SqlDialectDefinition {
  id: SqlDialect;
  label: string;
  parserDialect: DialectName;
}

export const sqlDialects: readonly SqlDialectDefinition[] = [
  { id: 'postgresql', label: 'PostgreSQL', parserDialect: 'postgresql' },
  { id: 'mysql', label: 'MySQL', parserDialect: 'mysql' },
  { id: 'oracle', label: 'Oracle', parserDialect: 'oracle' },
  { id: 'clickhouse', label: 'ClickHouse', parserDialect: 'clickhouse' },
  { id: 'sqlserver', label: 'SQL Server', parserDialect: 'mssql' },
];

export function getSqlDialect(id: SqlDialect): SqlDialectDefinition {
  const dialect = sqlDialects.find((candidate) => candidate.id === id);
  if (!dialect) throw new Error(`Unknown SQL dialect: ${id}`);
  return dialect;
}
