import { describe, expect, it } from 'vitest';

import { validateJson } from './validateJson';

describe('validateJson', () => {
  it('returns the summary and warnings for valid JSON', () => {
    expect(validateJson('{"a":1,"a":2}')).toEqual({
      ok: true,
      summary: { rootType: 'object', childCount: 2, sizeInBytes: 13 },
      warnings: [expect.objectContaining({ line: 1, column: 8 })],
    });
  });

  it('returns the positioned error for invalid JSON', () => {
    expect(validateJson('[1,]')).toMatchObject({
      ok: false,
      error: { line: 1, column: 4 },
    });
  });
});
