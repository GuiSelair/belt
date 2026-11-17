import type { SqlDialect } from '../../lib/dialects';

const RESERVED_WORDS = new Set([
  'all',
  'and',
  'any',
  'as',
  'asc',
  'at',
  'between',
  'by',
  'case',
  'check',
  'column',
  'constraint',
  'create',
  'cross',
  'current',
  'default',
  'delete',
  'desc',
  'distinct',
  'do',
  'drop',
  'else',
  'end',
  'except',
  'exists',
  'false',
  'fetch',
  'for',
  'foreign',
  'from',
  'full',
  'go',
  'grant',
  'group',
  'having',
  'if',
  'in',
  'index',
  'inner',
  'insert',
  'intersect',
  'into',
  'is',
  'join',
  'key',
  'left',
  'like',
  'limit',
  'natural',
  'not',
  'null',
  'of',
  'offset',
  'on',
  'or',
  'order',
  'outer',
  'primary',
  'references',
  'right',
  'rows',
  'select',
  'set',
  'some',
  'table',
  'then',
  'to',
  'top',
  'true',
  'union',
  'unique',
  'update',
  'user',
  'using',
  'values',
  'when',
  'where',
  'with',
]);

const PLAIN_IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function isReservedWord(name: string) {
  return RESERVED_WORDS.has(name.toLowerCase());
}

export function quoteIdentifier(name: string, dialect: SqlDialect) {
  if (PLAIN_IDENTIFIER.test(name) && !isReservedWord(name)) return name;
  if (dialect === 'mysql') return `\`${name.replace(/`/g, '``')}\``;
  if (dialect === 'sqlserver') return `[${name.replace(/]/g, ']]')}]`;
  return `"${name.replace(/"/g, '""')}"`;
}

/** `order_items` → `oi`, `UserAccounts` → `ua`, `users` → `u`. */
export function tableAliasBase(tableName: string) {
  const words = tableName
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
  const initials = words
    .map((word) => word[0])
    .join('')
    .toLowerCase()
    .replace(/^[^a-z_]+/, '');
  return initials === '' ? 't' : initials;
}

export class NamePool {
  private readonly taken = new Set<string>();

  /** Reserved words are allowed only for names that get quoted when needed. */
  constructor(private readonly avoidReserved = true) {}

  reserve(name: string) {
    this.taken.add(name.toLowerCase());
  }

  /** Returns `base`, or `base2`, `base3`… when taken or reserved by SQL. */
  claim(base: string, separator = '') {
    let candidate = base;
    for (let suffix = 2; this.isUnavailable(candidate); suffix++) {
      candidate = `${base}${separator}${suffix}`;
    }
    this.reserve(candidate);
    return candidate;
  }

  private isUnavailable(name: string) {
    return (
      this.taken.has(name.toLowerCase()) ||
      (this.avoidReserved && isReservedWord(name))
    );
  }
}
