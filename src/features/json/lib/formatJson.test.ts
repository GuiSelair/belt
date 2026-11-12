import { describe, expect, it } from 'vitest';

import { formatJson } from './formatJson';

function format(text: string, indent = '  ', sortKeys = false) {
  const result = formatJson({ text, indent, sortKeys });
  if (!result.ok) throw new Error(result.error.message);
  return result.output;
}

describe('formatJson', () => {
  it('beautifies with two spaces by default', () => {
    expect(format('{"a":[1,{"b":null}],"c":{}}')).toBe(
      '{\n  "a": [\n    1,\n    {\n      "b": null\n    }\n  ],\n  "c": {}\n}',
    );
  });

  it('supports four spaces and tabs', () => {
    expect(format('{"a":1}', '    ')).toBe('{\n    "a": 1\n}');
    expect(format('{"a":1}', '\t')).toBe('{\n\t"a": 1\n}');
  });

  it('minifies when the indent is empty', () => {
    expect(format('{ "a" : [ 1 , 2 ] ,\n "b" : "x y" }', '')).toBe(
      '{"a":[1,2],"b":"x y"}',
    );
  });

  it('preserves big numbers and string escapes exactly', () => {
    expect(format('[12345678901234567890123, "caf\\u00e9"]', '')).toBe(
      '[12345678901234567890123,"caf\\u00e9"]',
    );
  });

  it('sorts keys recursively while keeping array order', () => {
    expect(format('{"b":1,"a":{"d":1,"c":2},"z":[3,1]}', '', true)).toBe(
      '{"a":{"c":2,"d":1},"b":1,"z":[3,1]}',
    );
  });

  it('returns the parse error for invalid input', () => {
    const result = formatJson({ text: '[1,', indent: '  ', sortKeys: false });

    expect(result.ok).toBe(false);
  });
});
