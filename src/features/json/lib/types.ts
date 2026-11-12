export interface JsonEntry {
  key: string;
  rawKey: string;
  value: JsonNode;
}

export type JsonNode =
  | { kind: 'object'; entries: JsonEntry[] }
  | { kind: 'array'; items: JsonNode[] }
  | { kind: 'string'; raw: string }
  | { kind: 'number'; raw: string }
  | { kind: 'boolean'; value: boolean }
  | { kind: 'null' };

export interface JsonPositionedMessage {
  message: string;
  offset: number;
  line: number;
  column: number;
}

export type JsonParseResult =
  | { ok: true; value: JsonNode; warnings: JsonPositionedMessage[] }
  | { ok: false; error: JsonPositionedMessage };
