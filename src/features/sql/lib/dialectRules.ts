import { lineColumnToOffset, offsetToLineColumn } from '@/lib/textPosition';

import type { SqlDialect } from './dialects';
import type { SqlSyntaxError } from './parseSql';

type AstNode = Record<string, unknown>;

interface DialectRule {
  message: string;
  invalidIn: SqlDialect[];
  /** Returns the offending part of `node`, or null when the rule passes. */
  find: (node: AstNode) => unknown;
}

interface Violation {
  message: string;
  line: number;
}

function isNode(value: unknown): value is AstNode {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function child(node: unknown, key: string): AstNode | null {
  if (!isNode(node)) return null;
  const value = node[key];
  return isNode(value) ? value : null;
}

function hasLimit(node: AstNode) {
  const clause = child(node, 'limit_clause');
  if (!clause) return false;
  return (
    clause.OffsetCommaLimit != null ||
    child(clause, 'LimitOffset')?.limit != null
  );
}

function hasOffset(node: AstNode) {
  return child(child(node, 'limit_clause'), 'LimitOffset')?.offset != null;
}

const dialectRules: DialectRule[] = [
  {
    message: 'TOP is only supported by SQL Server and ClickHouse',
    invalidIn: ['postgresql', 'mysql', 'oracle'],
    find: (node) => ('projection' in node && node.top != null ? node : null),
  },
  {
    message:
      'LIMIT is not supported, use OFFSET ... ROWS FETCH NEXT ... ROWS ONLY',
    invalidIn: ['oracle', 'sqlserver'],
    find: (node) => (hasLimit(node) ? node.limit_clause : null),
  },
  {
    message: 'FETCH FIRST is not supported, use LIMIT',
    invalidIn: ['mysql'],
    find: (node) => node.fetch ?? null,
  },
  {
    message: 'FETCH requires an OFFSET ... ROWS clause before it',
    invalidIn: ['sqlserver'],
    find: (node) => (hasOffset(node) ? null : (node.fetch ?? null)),
  },
  {
    message: 'START WITH / CONNECT BY is only supported by Oracle',
    invalidIn: ['postgresql', 'mysql', 'clickhouse', 'sqlserver'],
    find: (node) =>
      Array.isArray(node.connect_by) && node.connect_by.length > 0
        ? node.connect_by
        : null,
  },
  {
    message: 'The (+) outer join operator is only supported by Oracle',
    invalidIn: ['postgresql', 'mysql', 'clickhouse', 'sqlserver'],
    find: (node) => node.OuterJoin ?? null,
  },
  {
    message: 'ILIKE is only supported by PostgreSQL and ClickHouse',
    invalidIn: ['mysql', 'oracle', 'sqlserver'],
    find: (node) => node.ILike ?? null,
  },
  {
    message:
      'The :: cast operator is only supported by PostgreSQL and ClickHouse',
    invalidIn: ['mysql', 'oracle', 'sqlserver'],
    find: (node) => (child(node, 'Cast')?.kind === 'DoubleColon' ? node : null),
  },
];

function forEachNode(value: unknown, visit: (node: AstNode) => void) {
  if (Array.isArray(value)) {
    value.forEach((item) => forEachNode(item, visit));
    return;
  }
  if (!isNode(value)) return;
  visit(value);
  Object.values(value).forEach((item) => forEachNode(item, visit));
}

/** Smallest source line among the spans inside `value`, if it has any. */
function firstLine(value: unknown): number | null {
  const lines: number[] = [];
  forEachNode(value, (node) => {
    const line = child(child(node, 'span'), 'start')?.line;
    if (typeof line === 'number' && line > 0) lines.push(line);
  });
  return lines.length > 0 ? Math.min(...lines) : null;
}

function toLineStartError(text: string, { message, line }: Violation) {
  const lineStart = lineColumnToOffset(text, line, 1);
  const indent = /^[ \t]*/.exec(text.slice(lineStart))?.[0].length ?? 0;
  const offset = lineStart + indent;
  return { message, offset, ...offsetToLineColumn(text, offset) };
}

/**
 * The parser accepts many constructs in every dialect, so these rules reject
 * the most common ones that a dialect's database would refuse to run.
 */
export function findDialectViolation(
  statements: unknown[],
  text: string,
  dialect: SqlDialect,
): SqlSyntaxError | null {
  const rules = dialectRules.filter(({ invalidIn }) =>
    invalidIn.includes(dialect),
  );
  const violations: Violation[] = [];

  forEachNode(statements, (node) => {
    rules.forEach(({ message, find }) => {
      const offending = find(node);
      if (offending == null) return;
      const line = firstLine(offending) ?? firstLine(node) ?? 1;
      violations.push({ message, line });
    });
  });

  if (violations.length === 0) return null;
  const earliest = violations.reduce((current, next) =>
    next.line < current.line ? next : current,
  );
  return toLineStartError(text, earliest);
}
