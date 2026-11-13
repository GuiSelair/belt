import type { SqlDialect } from '../../lib/dialects';
import { loadSqlParser } from '../../lib/loadSqlParser';
import {
  parseSql,
  type SqlParser,
  type SqlSyntaxError,
} from '../../lib/parseSql';
import { NamePool, quoteIdentifier, tableAliasBase } from './aliasNames';
import { tokenizeSql, type SqlToken } from './sqlTokens';

export interface AddAliasesRequest {
  text: string;
  dialect: SqlDialect;
}

export type AddAliasesResult =
  | { ok: true; output: string; changes: number; notices: string[] }
  | { ok: false; error: SqlSyntaxError };

type JsonObject = Record<string, unknown>;

interface Position {
  line: number;
  column: number;
}

interface Span {
  start: Position;
  end: Position;
}

interface Ident {
  value: string;
  span?: Span;
}

interface TableAlias {
  explicit?: boolean;
  name: Ident;
}

interface Edit {
  at: number;
  until: number;
  text: string;
}

interface Scope {
  parent: Scope | null;
  /** Lower-cased table names mapped to their new alias, or null when shadowed. */
  renames: Map<string, string | null>;
  hasManyRelations: boolean;
}

export const NOTICES = {
  unqualifiedColumns:
    'Columns without a table prefix were left as they are: the table they come from cannot be known without the schema.',
  skippedProjection:
    'One SELECT list uses syntax that could not be mapped safely, so its columns were left without aliases.',
  skippedTableFunction: 'Table functions in FROM were left without aliases.',
  skippedFinalTable:
    'Tables read with FINAL were left without aliases, since the SQL parser does not accept an alias before FINAL.',
} as const;

const PROJECTION_STOP_WORDS = new Set([
  'from',
  'into',
  'where',
  'group',
  'having',
  'order',
  'limit',
  'union',
  'intersect',
  'except',
  'window',
  'qualify',
  'fetch',
  'offset',
]);

/** ClickHouse's `FROM events FINAL` is parsed as a table aliased `FINAL`. */
const TABLE_MODIFIERS_PARSED_AS_ALIAS = new Set(['final']);

function withoutKey(node: JsonObject, key: string): unknown[] {
  return Object.entries(node)
    .filter(([name]) => name !== key)
    .map(([, value]) => value);
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isQuery(node: JsonObject) {
  return 'body' in node && 'pipe_operators' in node;
}

function isSelect(node: JsonObject) {
  return 'projection' in node && 'select_token' in node;
}

function unwrapExpr(expr: unknown): unknown {
  let current = expr;
  while (isObject(current)) {
    if ('Nested' in current) current = current.Nested;
    else if (isObject(current.Cast)) current = current.Cast.expr;
    else break;
  }
  return current;
}

function lastIdentValue(idents: unknown): string | null {
  if (!Array.isArray(idents) || idents.length === 0) return null;
  const last = idents[idents.length - 1] as JsonObject;
  const ident = isObject(last.Identifier) ? last.Identifier : last;
  return typeof ident.value === 'string' ? ident.value : null;
}

function columnName(expr: unknown): string | null {
  const unwrapped = unwrapExpr(expr);
  if (!isObject(unwrapped)) return null;
  if (isObject(unwrapped.Identifier)) {
    return lastIdentValue([unwrapped.Identifier]);
  }
  if (Array.isArray(unwrapped.CompoundIdentifier)) {
    return lastIdentValue(unwrapped.CompoundIdentifier);
  }
  return null;
}

function functionArgColumn(fn: JsonObject): string | null {
  const list = isObject(fn.args) ? fn.args.List : null;
  const args = isObject(list) && Array.isArray(list.args) ? list.args : [];
  if (args.length !== 1 || !isObject(args[0])) return null;
  const unnamed = args[0].Unnamed;
  return isObject(unnamed) ? columnName(unnamed.Expr) : null;
}

export function columnAliasBase(expr: unknown): string {
  const name = columnName(expr);
  if (name) return name;
  const unwrapped = unwrapExpr(expr);
  if (isObject(unwrapped) && isObject(unwrapped.Function)) {
    const functionName = lastIdentValue(unwrapped.Function.name);
    if (functionName) {
      const argument = functionArgColumn(unwrapped.Function);
      const base = functionName.toLowerCase();
      return argument ? `${base}_${argument}` : base;
    }
  }
  return 'expr';
}

class AliasWriter {
  private readonly edits: Edit[] = [];
  private readonly notices = new Set<string>();
  private readonly tableNames = new NamePool();
  private readonly tokens: SqlToken[];
  private readonly lineStarts: number[] = [0];

  constructor(
    private readonly text: string,
    private readonly dialect: SqlDialect,
  ) {
    this.tokens = tokenizeSql(text);
    for (let index = 0; index < text.length; index++) {
      if (text.charCodeAt(index) === 10) this.lineStarts.push(index + 1);
    }
  }

  run(statements: unknown[]) {
    for (const statement of statements) this.reserveExistingNames(statement);
    for (const statement of statements) {
      this.walk(statement, {
        parent: null,
        renames: new Map(),
        hasManyRelations: false,
      });
    }

    let output = this.text;
    const ordered = [...this.edits].sort((a, b) => b.at - a.at);
    for (const edit of ordered) {
      output = output.slice(0, edit.at) + edit.text + output.slice(edit.until);
    }
    return { output, changes: this.edits.length, notices: [...this.notices] };
  }

  private offset(position: Position) {
    return (
      (this.lineStarts[position.line - 1] ?? this.text.length) +
      position.column -
      1
    );
  }

  private range(node: { span?: Span } | undefined) {
    const span = node?.span;
    if (!span || span.start.line === 0) return null;
    return { start: this.offset(span.start), end: this.offset(span.end) };
  }

  private spanBounds(node: unknown) {
    let min = Infinity;
    let max = -Infinity;
    const visit = (value: unknown) => {
      if (Array.isArray(value)) value.forEach(visit);
      if (!isObject(value)) return;
      const range = this.range(value as { span?: Span });
      if (range) {
        min = Math.min(min, range.start);
        max = Math.max(max, range.end);
      }
      Object.values(value).forEach(visit);
    };
    visit(node);
    return Number.isFinite(min) ? { start: min, end: max } : null;
  }

  private insert(at: number, text: string) {
    this.edits.push({ at, until: at, text });
  }

  private reserveExistingNames(node: unknown) {
    if (Array.isArray(node)) {
      node.forEach((child) => this.reserveExistingNames(child));
      return;
    }
    if (!isObject(node)) return;
    if (isObject(node.Table)) {
      const name = lastIdentValue(node.Table.name);
      if (name) this.tableNames.reserve(name);
    }
    if (isObject(node.alias)) {
      const alias = node.alias as Partial<TableAlias> & Partial<Ident>;
      const value = alias.name?.value ?? alias.value;
      if (typeof value === 'string') this.tableNames.reserve(value);
    }
    Object.values(node).forEach((child) => this.reserveExistingNames(child));
  }

  private walk(node: unknown, scope: Scope) {
    if (Array.isArray(node)) {
      node.forEach((child) => this.walk(child, scope));
      return;
    }
    if (!isObject(node)) return;
    if (isQuery(node)) {
      this.processQuery(node, scope);
      return;
    }
    if (isSelect(node)) {
      this.processSelect(node, scope);
      return;
    }
    if (Array.isArray(node.CompoundIdentifier)) {
      this.renameQualifier(node.CompoundIdentifier as Ident[], scope, 1);
      return;
    }
    if (Array.isArray(node.QualifiedWildcard)) {
      const [target] = node.QualifiedWildcard;
      if (isObject(target) && Array.isArray(target.ObjectName)) {
        const parts = target.ObjectName.map(
          (part) => (part as JsonObject).Identifier as Ident,
        );
        this.renameQualifier(parts, scope, 0);
      }
      return;
    }
    if (isObject(node.Identifier) && scope.hasManyRelations) {
      this.notices.add(NOTICES.unqualifiedColumns);
    }
    if (isObject(node.Function)) {
      this.walk(withoutKey(node.Function, 'name'), scope);
      return;
    }
    Object.values(node).forEach((child) => this.walk(child, scope));
  }

  private lookup(scope: Scope, key: string): string | null | undefined {
    for (let current: Scope | null = scope; current; current = current.parent) {
      if (current.renames.has(key)) return current.renames.get(key);
    }
    return undefined;
  }

  private renameQualifier(idents: Ident[], scope: Scope, keep: number) {
    if (idents.some((ident) => !ident)) return;
    for (let length = idents.length - keep; length >= 1; length--) {
      const key = idents
        .slice(0, length)
        .map((ident) => ident.value.toLowerCase())
        .join('.');
      const alias = this.lookup(scope, key);
      if (alias === undefined) continue;
      if (alias === null) return;
      const first = this.range(idents[0]);
      const last = this.range(idents[length - 1]);
      if (first && last) {
        this.edits.push({ at: first.start, until: last.end, text: alias });
      }
      return;
    }
  }

  private processQuery(query: JsonObject, scope: Scope) {
    const { body, with: withClause, ...rest } = query;
    this.walk(withClause, scope);
    const bodyScope = this.processSetExpr(body, scope);
    this.walk(Object.values(rest), bodyScope ?? scope);
  }

  private processSetExpr(body: unknown, scope: Scope): Scope | null {
    if (!isObject(body)) return null;
    if (isObject(body.Select)) return this.processSelect(body.Select, scope);
    if (isObject(body.SetOperation)) {
      this.processSetExpr(body.SetOperation.left, scope);
      this.processSetExpr(body.SetOperation.right, scope);
      return null;
    }
    this.walk(body, scope);
    return null;
  }

  private processSelect(select: JsonObject, outer: Scope): Scope {
    const from = Array.isArray(select.from)
      ? (select.from as JsonObject[])
      : [];
    const relationCount = from.reduce(
      (count, item) =>
        count + 1 + (Array.isArray(item.joins) ? item.joins.length : 0),
      0,
    );
    const scope: Scope = {
      parent: outer,
      renames: new Map(),
      hasManyRelations: relationCount > 1,
    };
    const joinOperators: unknown[] = [];

    const visitTableWithJoins = (item: JsonObject) => {
      this.processRelation(item.relation, scope, outer, visitTableWithJoins);
      for (const join of (item.joins as JsonObject[] | undefined) ?? []) {
        this.processRelation(join.relation, scope, outer, visitTableWithJoins);
        joinOperators.push(join.join_operator);
      }
    };
    from.forEach(visitTableWithJoins);

    this.aliasProjection(select);

    this.walk(withoutKey(select, 'from'), scope);
    this.walk(joinOperators, scope);
    return scope;
  }

  private processRelation(
    relation: unknown,
    scope: Scope,
    outer: Scope,
    visitTableWithJoins: (item: JsonObject) => void,
  ) {
    if (!isObject(relation)) return;

    if (isObject(relation.Table)) {
      this.aliasTable(relation.Table, scope);
    } else if (isObject(relation.Derived)) {
      const derived = relation.Derived;
      this.walk(derived.subquery, derived.lateral ? scope : outer);
      if (isObject(derived.alias)) {
        this.makeExplicit(derived.alias as unknown as TableAlias);
      } else {
        this.aliasSubquery(derived.subquery);
      }
    } else if (isObject(relation.NestedJoin)) {
      const nested = relation.NestedJoin;
      if (isObject(nested.table_with_joins)) {
        visitTableWithJoins(nested.table_with_joins);
      }
      if (isObject(nested.alias)) {
        this.makeExplicit(nested.alias as unknown as TableAlias);
      }
    } else {
      this.walk(relation, scope);
    }
  }

  private tableAliasText(alias: string) {
    return this.dialect === 'oracle' ? ` ${alias}` : ` AS ${alias}`;
  }

  private makeExplicit(alias: TableAlias) {
    if (alias.explicit !== false || this.dialect === 'oracle') return;
    const range = this.range(alias.name);
    if (range) this.insert(range.start, 'AS ');
  }

  private aliasTable(table: JsonObject, scope: Scope) {
    const parts = Array.isArray(table.name)
      ? table.name.map((part) => (part as JsonObject).Identifier as Ident)
      : [];
    if (parts.length === 0 || parts.some((part) => !part)) return;
    const fullKey = parts.map((part) => part.value.toLowerCase()).join('.');
    const lastKey = parts[parts.length - 1].value.toLowerCase();

    const existingAlias = table.alias as TableAlias | undefined;
    const isModifier =
      existingAlias?.explicit === false &&
      TABLE_MODIFIERS_PARSED_AS_ALIAS.has(
        existingAlias.name.value.toLowerCase(),
      );
    if (existingAlias) {
      if (isModifier) this.notices.add(NOTICES.skippedFinalTable);
      else this.makeExplicit(existingAlias);
      scope.renames.set(fullKey, null);
      scope.renames.set(lastKey, null);
      return;
    }
    if (table.args) {
      this.notices.add(NOTICES.skippedTableFunction);
      return;
    }

    const range = this.range(parts[parts.length - 1]);
    if (!range) return;
    const alias = this.tableNames.claim(
      tableAliasBase(parts[parts.length - 1].value),
    );
    this.insert(range.end, this.tableAliasText(alias));
    if (!scope.renames.has(fullKey)) scope.renames.set(fullKey, alias);
    if (!scope.renames.has(lastKey)) scope.renames.set(lastKey, alias);
  }

  private aliasSubquery(subquery: unknown) {
    const bounds = this.spanBounds(subquery);
    if (!bounds) return;
    let depth = 0;
    for (const token of this.tokens) {
      if (token.start < bounds.end || token.kind !== 'symbol') continue;
      if (token.text === '(') depth++;
      if (token.text !== ')') continue;
      if (depth === 0) {
        this.insert(
          token.end,
          this.tableAliasText(this.tableNames.claim('sq')),
        );
        return;
      }
      depth--;
    }
  }

  private projectionGroups(start: number): SqlToken[][] {
    const groups: SqlToken[][] = [];
    let current: SqlToken[] = [];
    let depth = 0;

    for (const token of this.tokens) {
      if (token.start < start) continue;
      const lower = token.text.toLowerCase();
      if (token.kind === 'symbol' && (lower === '(' || lower === '[')) depth++;
      if (token.kind === 'symbol' && (lower === ')' || lower === ']')) {
        if (depth === 0) break;
        depth--;
      }
      if (depth === 0 && token.kind === 'symbol' && lower === ';') break;
      if (
        depth === 0 &&
        token.kind === 'word' &&
        PROJECTION_STOP_WORDS.has(lower)
      ) {
        break;
      }
      if (depth === 0 && token.kind === 'symbol' && lower === ',') {
        groups.push(current);
        current = [];
        continue;
      }
      current.push(token);
    }
    if (current.length > 0) groups.push(current);
    return groups;
  }

  private aliasProjection(select: JsonObject) {
    const items = Array.isArray(select.projection)
      ? (select.projection as JsonObject[])
      : [];
    const selectToken = this.range(select.select_token as { span?: Span });
    if (!selectToken || items.length === 0) return;

    const groups = this.projectionGroups(selectToken.end);
    if (groups.length !== items.length) {
      this.notices.add(NOTICES.skippedProjection);
      return;
    }

    const columnNames = new NamePool(false);
    for (const item of items) {
      if (isObject(item.ExprWithAlias)) {
        columnNames.reserve((item.ExprWithAlias.alias as Ident).value);
      }
    }

    items.forEach((item, index) => {
      const group = groups[index];
      if (isObject(item.ExprWithAlias)) {
        this.makeColumnAliasExplicit(item.ExprWithAlias, group);
      } else if ('UnnamedExpr' in item) {
        const alias = columnNames.claim(columnAliasBase(item.UnnamedExpr), '_');
        const end = group[group.length - 1].end;
        this.insert(end, ` AS ${quoteIdentifier(alias, this.dialect)}`);
      }
    });
  }

  private makeColumnAliasExplicit(item: JsonObject, group: SqlToken[]) {
    const aliasRange = this.range(item.alias as Ident);
    const exprBounds = this.spanBounds(item.expr);
    if (!aliasRange || !exprBounds || aliasRange.start < exprBounds.end) return;
    const index = group.findIndex((token) => token.start === aliasRange.start);
    if (index <= 0 || group[index - 1].text.toLowerCase() === 'as') return;
    this.insert(aliasRange.start, 'AS ');
  }
}

export function addAliasesWith(
  parser: SqlParser,
  { text, dialect }: AddAliasesRequest,
): AddAliasesResult {
  const parsed = parseSql(parser, text, dialect);
  if (!parsed.ok) return parsed;

  const result = new AliasWriter(text, dialect).run(parsed.statements);
  const check = parseSql(parser, result.output, dialect);
  if (!check.ok) {
    throw new Error(
      `Adding aliases produced invalid SQL (${check.error.message}). The input was left unchanged.`,
    );
  }
  return { ok: true, ...result };
}

export async function addAliases(
  request: AddAliasesRequest,
): Promise<AddAliasesResult> {
  return addAliasesWith(await loadSqlParser(), request);
}
