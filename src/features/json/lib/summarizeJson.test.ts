import { describe, expect, it } from 'vitest';

import { parseJson } from './parseJson';
import { summarizeJson } from './summarizeJson';

function summarize(text: string) {
  const result = parseJson(text);
  if (!result.ok) throw new Error('should parse');
  return summarizeJson(result.value, text);
}

describe('summarizeJson', () => {
  it('describes objects by key count', () => {
    expect(summarize('{"a":1,"b":2}')).toEqual({
      rootType: 'object',
      childCount: 2,
      sizeInBytes: 13,
    });
  });

  it('describes arrays by item count and measures UTF-8 bytes', () => {
    expect(summarize('["é"]')).toEqual({
      rootType: 'array',
      childCount: 1,
      sizeInBytes: 6,
    });
  });

  it('has no child count for primitives', () => {
    expect(summarize('null')).toMatchObject({
      rootType: 'null',
      childCount: null,
    });
  });
});
