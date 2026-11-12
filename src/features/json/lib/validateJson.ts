import { parseJson } from './parseJson';
import { summarizeJson, type JsonSummary } from './summarizeJson';
import type { JsonPositionedMessage } from './types';

export type ValidateJsonResult =
  | { ok: true; summary: JsonSummary; warnings: JsonPositionedMessage[] }
  | { ok: false; error: JsonPositionedMessage };

export function validateJson(text: string): ValidateJsonResult {
  const parsed = parseJson(text);
  if (!parsed.ok) return parsed;
  return {
    ok: true,
    summary: summarizeJson(parsed.value, text),
    warnings: parsed.warnings,
  };
}
