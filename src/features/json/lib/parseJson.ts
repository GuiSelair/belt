import { offsetToLineColumn } from '@/lib/textPosition';

import type {
  JsonEntry,
  JsonNode,
  JsonParseResult,
  JsonPositionedMessage,
} from './types';

class JsonSyntaxError extends Error {
  constructor(
    message: string,
    readonly offset: number,
  ) {
    super(message);
  }
}

const NUMBER_PATTERN = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y;
const VALID_ESCAPES = new Set(['"', '\\', '/', 'b', 'f', 'n', 'r', 't']);
const HEX_PATTERN = /^[0-9a-fA-F]{4}$/;
const LITERALS: Record<string, JsonNode> = {
  true: { kind: 'boolean', value: true },
  false: { kind: 'boolean', value: false },
  null: { kind: 'null' },
};

function describeChar(char: string | undefined) {
  return char === undefined ? 'end of input' : `'${char}'`;
}

/**
 * Strict JSON (RFC 8259) parser that keeps source positions, the raw text of
 * numbers and strings (no precision loss) and reports duplicate keys.
 */
export function parseJson(input: string): JsonParseResult {
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
  const bomOffset = input.length - text.length;
  const warnings: Omit<JsonPositionedMessage, 'line' | 'column'>[] = [];
  let index = 0;

  function fail(message: string, offset = index): never {
    throw new JsonSyntaxError(message, offset);
  }

  function skipWhitespace() {
    while (index < text.length) {
      const char = text[index];
      if (char !== ' ' && char !== '\n' && char !== '\r' && char !== '\t') {
        return;
      }
      index++;
    }
  }

  function parseString(): string {
    const start = index;
    index++;

    while (index < text.length) {
      const char = text[index];
      if (char === '"') {
        index++;
        return text.slice(start, index);
      }
      if (char === '\\') {
        const escape = text[index + 1];
        if (escape === 'u') {
          if (!HEX_PATTERN.test(text.slice(index + 2, index + 6))) {
            fail('Invalid unicode escape sequence');
          }
          index += 6;
          continue;
        }
        if (!VALID_ESCAPES.has(escape)) fail('Invalid escape sequence');
        index += 2;
        continue;
      }
      if (char.charCodeAt(0) < 0x20) {
        fail('Control characters must be escaped inside strings');
      }
      index++;
    }

    return fail('Unterminated string', start);
  }

  function parseNumber(): JsonNode {
    NUMBER_PATTERN.lastIndex = index;
    const match = NUMBER_PATTERN.exec(text);
    if (!match) fail('Invalid number');
    index += match[0].length;
    return { kind: 'number', raw: match[0] };
  }

  function parseLiteral(): JsonNode {
    for (const [word, node] of Object.entries(LITERALS)) {
      if (text.startsWith(word, index)) {
        index += word.length;
        return node;
      }
    }
    const token = /^[a-zA-Z]+/.exec(text.slice(index, index + 20))?.[0];
    return fail(`Unexpected token '${token ?? text[index]}'`);
  }

  function parseArray(): JsonNode {
    index++;
    const items: JsonNode[] = [];
    skipWhitespace();
    if (text[index] === ']') {
      index++;
      return { kind: 'array', items };
    }

    while (true) {
      items.push(parseValue());
      skipWhitespace();
      const char = text[index];
      if (char === ']') {
        index++;
        return { kind: 'array', items };
      }
      if (char !== ',') {
        fail(
          `Expected ',' or ']' after array item but found ${describeChar(char)}`,
        );
      }
      index++;
      skipWhitespace();
      if (text[index] === ']') fail('Trailing comma is not allowed in arrays');
    }
  }

  function parseEntry(seenKeys: Set<string>): JsonEntry {
    if (text[index] !== '"') {
      fail(
        `Expected property name (double-quoted string) but found ${describeChar(text[index])}`,
      );
    }
    const keyOffset = index;
    const rawKey = parseString();
    const key = JSON.parse(rawKey) as string;
    if (seenKeys.has(key)) {
      warnings.push({ message: `Duplicate key ${rawKey}`, offset: keyOffset });
    }
    seenKeys.add(key);

    skipWhitespace();
    if (text[index] !== ':') {
      fail(
        `Expected ':' after property name but found ${describeChar(text[index])}`,
      );
    }
    index++;
    return { key, rawKey, value: parseValue() };
  }

  function parseObject(): JsonNode {
    index++;
    const entries: JsonEntry[] = [];
    const seenKeys = new Set<string>();
    skipWhitespace();
    if (text[index] === '}') {
      index++;
      return { kind: 'object', entries };
    }

    while (true) {
      entries.push(parseEntry(seenKeys));
      skipWhitespace();
      const char = text[index];
      if (char === '}') {
        index++;
        return { kind: 'object', entries };
      }
      if (char !== ',') {
        fail(
          `Expected ',' or '}' after property value but found ${describeChar(char)}`,
        );
      }
      index++;
      skipWhitespace();
      if (text[index] === '}') fail('Trailing comma is not allowed in objects');
    }
  }

  function parseValue(): JsonNode {
    skipWhitespace();
    const char = text[index];
    if (char === undefined) fail('Unexpected end of input');
    if (char === '{') return parseObject();
    if (char === '[') return parseArray();
    if (char === '"') return { kind: 'string', raw: parseString() };
    if (char === '-' || (char >= '0' && char <= '9')) return parseNumber();
    if (char >= 'a' && char <= 'z') return parseLiteral();
    return fail(`Unexpected character ${describeChar(char)}`);
  }

  function withPosition(
    message: string,
    offset: number,
  ): JsonPositionedMessage {
    const absoluteOffset = offset + bomOffset;
    return {
      message,
      offset: absoluteOffset,
      ...offsetToLineColumn(input, absoluteOffset),
    };
  }

  try {
    const value = parseValue();
    skipWhitespace();
    if (index < text.length) fail('Unexpected content after JSON value');
    return {
      ok: true,
      value,
      warnings: warnings.map((warning) =>
        withPosition(warning.message, warning.offset),
      ),
    };
  } catch (error) {
    if (error instanceof JsonSyntaxError) {
      return { ok: false, error: withPosition(error.message, error.offset) };
    }
    if (error instanceof RangeError) {
      return {
        ok: false,
        error: withPosition('JSON is nested too deeply to process', index),
      };
    }
    throw error;
  }
}
