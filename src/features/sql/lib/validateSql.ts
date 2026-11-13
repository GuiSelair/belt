import { sqlDialects, type SqlDialect } from './dialects';
import { loadSqlParser } from './loadSqlParser';
import {
  describeStatement,
  parseSql,
  type SqlParser,
  type SqlSyntaxError,
} from './parseSql';

export interface ValidateSqlRequest {
  text: string;
  dialect: SqlDialect;
}

export interface DialectCompatibility {
  dialect: SqlDialect;
  ok: boolean;
}

export type ValidateSqlResult =
  | {
      ok: true;
      statements: string[];
      compatibility: DialectCompatibility[];
    }
  | {
      ok: false;
      error: SqlSyntaxError;
      compatibility: DialectCompatibility[];
    };

export function validateSqlWith(
  parser: SqlParser,
  { text, dialect }: ValidateSqlRequest,
): ValidateSqlResult {
  const compatibility = sqlDialects.map(({ id }) => ({
    dialect: id,
    ok: parseSql(parser, text, id).ok,
  }));
  const result = parseSql(parser, text, dialect);
  if (!result.ok) return { ok: false, error: result.error, compatibility };
  return {
    ok: true,
    statements: result.statements.map(describeStatement),
    compatibility,
  };
}

export async function validateSql(
  request: ValidateSqlRequest,
): Promise<ValidateSqlResult> {
  return validateSqlWith(await loadSqlParser(), request);
}
