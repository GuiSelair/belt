import type { Statement } from '@guanmingchiu/sqlparser-ts';

import { lineColumnToOffset, offsetToLineColumn } from '@/lib/textPosition';

import { getSqlDialect, type SqlDialect } from './dialects';
import type { loadSqlParser } from './loadSqlParser';

export type SqlParser = Awaited<ReturnType<typeof loadSqlParser>>;

export interface SqlSyntaxError {
  message: string;
  offset: number;
  line: number;
  column: number;
}

export type ParseSqlResult =
  { ok: true; statements: Statement[] } | { ok: false; error: SqlSyntaxError };

const MESSAGE_PREFIX = /^sql parser error:\s*/i;
const LOCATION_SUFFIX = /\s+at Line: (\d+), Column: (\d+)\s*$/;

interface ErrorWithLocation {
  message: string;
  location?: { line: number; column: number };
}

export function toSqlSyntaxError(
  error: ErrorWithLocation,
  text: string,
): SqlSyntaxError {
  let message = error.message.replace(MESSAGE_PREFIX, '');
  let location = error.location;
  const suffix = LOCATION_SUFFIX.exec(message);
  if (suffix) {
    message = message.slice(0, suffix.index);
    location ??= { line: Number(suffix[1]), column: Number(suffix[2]) };
  }

  const offset = location
    ? lineColumnToOffset(text, location.line, location.column)
    : text.trimEnd().length;
  return { message, offset, ...offsetToLineColumn(text, offset) };
}

export function parseSql(
  parser: SqlParser,
  text: string,
  dialect: SqlDialect,
): ParseSqlResult {
  try {
    const statements = parser.parse(text, getSqlDialect(dialect).parserDialect);
    return { ok: true, statements };
  } catch (error) {
    if (error instanceof parser.ParserError) {
      return { ok: false, error: toSqlSyntaxError(error, text) };
    }
    throw error;
  }
}

const STATEMENT_LABELS: Record<string, string> = { Query: 'SELECT' };

export function describeStatement(statement: Statement): string {
  const kind =
    typeof statement === 'string' ? statement : Object.keys(statement)[0];
  return (
    STATEMENT_LABELS[kind] ??
    kind.replace(/([a-z])([A-Z])/g, '$1 $2').toUpperCase()
  );
}
