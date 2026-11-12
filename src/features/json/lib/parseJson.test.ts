import { describe, expect, it } from 'vitest';

import { parseJson } from './parseJson';

function expectError(text: string) {
  const result = parseJson(text);
  if (result.ok) throw new Error(`Expected "${text}" to be invalid`);
  return result.error;
}

describe('parseJson', () => {
  it.each(['"text"', '42', '-1.5e10', 'null', 'true', 'false', '[]', '{}'])(
    'accepts the primitive or empty value %s',
    (text) => {
      expect(parseJson(text).ok).toBe(true);
    },
  );

  it('ignores a BOM and surrounding whitespace', () => {
    expect(parseJson('\uFEFF  \n {"a": 1} \n').ok).toBe(true);
  });

  it('reports a trailing comma with line and column', () => {
    expect(expectError('{"a": 1,}')).toMatchObject({
      offset: 8,
      line: 1,
      column: 9,
      message: expect.stringMatching(/trailing comma/i),
    });
  });

  it('reports positions on multi-line input', () => {
    const error = expectError('{\n  "a": 1\n  "b": 2\n}');

    expect(error).toMatchObject({ line: 3, column: 3 });
    expect(error.message).toMatch(/expected ',' or '}'/i);
  });

  it.each([
    ['{"a": tru}', /unexpected/i],
    ['{"a": "open', /unterminated string/i],
    ['["\\x"]', /invalid escape/i],
    ['01', /unexpected content/i],
    ['{a: 1}', /property name/i],
    ['', /unexpected end/i],
    ['{"a" 1}', /expected ':'/i],
  ])('rejects %s', (text, message) => {
    expect(expectError(text).message).toMatch(message);
  });

  it('keeps the raw digits of big numbers', () => {
    const result = parseJson('{"id": 12345678901234567890123}');
    if (!result.ok) throw new Error('should parse');

    expect(result.value).toEqual({
      kind: 'object',
      entries: [
        {
          key: 'id',
          rawKey: '"id"',
          value: { kind: 'number', raw: '12345678901234567890123' },
        },
      ],
    });
  });

  it('warns about duplicate keys with their position', () => {
    const result = parseJson('{\n  "a": 1,\n  "a": 2\n}');
    if (!result.ok) throw new Error('should parse');

    expect(result.warnings).toEqual([
      expect.objectContaining({
        message: expect.stringContaining('"a"'),
        line: 3,
        column: 3,
      }),
    ]);
  });
});
