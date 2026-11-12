import { parseJson } from './parseJson';
import { printJson, type PrintJsonOptions } from './printJson';
import type { JsonPositionedMessage } from './types';

export interface FormatJsonRequest extends PrintJsonOptions {
  text: string;
}

export type FormatJsonResult =
  { ok: true; output: string } | { ok: false; error: JsonPositionedMessage };

export function formatJson({
  text,
  ...options
}: FormatJsonRequest): FormatJsonResult {
  const parsed = parseJson(text);
  if (!parsed.ok) return parsed;
  return { ok: true, output: printJson(parsed.value, options) };
}
