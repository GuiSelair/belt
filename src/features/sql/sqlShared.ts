import type { EditorDiagnostic } from '@/components/editor/CodeEditor';
import type { SelectOption } from '@/components/form/SelectField';

import { sqlDialects, type SqlDialect } from './lib/dialects';
import type { SqlSyntaxError } from './lib/parseSql';

export const SQL_SAMPLE = `SELECT users.id, users.name, COUNT(orders.id)
FROM users
LEFT JOIN orders ON orders.user_id = users.id
WHERE users.active = TRUE
GROUP BY users.id, users.name
ORDER BY users.name;`;

export const dialectOptions: SelectOption<SqlDialect>[] = sqlDialects.map(
  ({ id, label }) => ({ value: id, label }),
);

export function toSqlDiagnostic(error: SqlSyntaxError): EditorDiagnostic {
  return {
    from: error.offset,
    to: error.offset + 1,
    severity: 'error',
    message: error.message,
  };
}
