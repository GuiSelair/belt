import { parseJson } from '../parseJson';
import type { JsonPositionedMessage } from '../types';
import { inferSchemaShape } from './inferSchemaShape';
import { writeJsonSchema, type JsonSchemaOptions } from './writeJsonSchema';

export interface GenerateJsonSchemaRequest extends JsonSchemaOptions {
  text: string;
}

export type GenerateJsonSchemaResult =
  | { ok: true; schema: string; notices: string[] }
  | { ok: false; error: JsonPositionedMessage };

export function generateJsonSchema({
  text,
  ...options
}: GenerateJsonSchemaRequest): GenerateJsonSchemaResult {
  const parsed = parseJson(text);
  if (!parsed.ok) return parsed;

  const notices = new Set<string>();
  const shape = inferSchemaShape(parsed.value, notices);
  const schema = writeJsonSchema(shape, options, notices);

  return { ok: true, schema, notices: [...notices] };
}
