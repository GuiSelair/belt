export type SimpleType =
  'boolean' | 'integer' | 'decimal' | 'date' | 'dateTime' | 'string';

const INTEGER = /^[+-]?\d+$/;
const DECIMAL = /^[+-]?(\d+(\.\d*)?|\.\d+)$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/;
const NUMERIC_TYPES = new Set<SimpleType>(['integer', 'decimal']);

function isCalendarDate(value: string) {
  const datePart = value.slice(0, 10);
  const date = new Date(`${datePart}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().startsWith(datePart)
  );
}

export function detectSimpleType(rawValue: string): SimpleType {
  const value = rawValue.trim();
  if (value === 'true' || value === 'false') return 'boolean';
  if (INTEGER.test(value)) return 'integer';
  if (DECIMAL.test(value)) return 'decimal';
  if (DATE.test(value) && isCalendarDate(value)) return 'date';
  if (DATE_TIME.test(value) && isCalendarDate(value)) return 'dateTime';
  return 'string';
}

export function mergeSimpleTypes(
  current: SimpleType | null,
  next: SimpleType | null,
): SimpleType | null {
  if (current === null) return next;
  if (next === null || current === next) return current;
  if (NUMERIC_TYPES.has(current) && NUMERIC_TYPES.has(next)) return 'decimal';
  return 'string';
}
