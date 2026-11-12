import { describe, expect, it } from 'vitest';

import { lineColumnToOffset, offsetToLineColumn } from './textPosition';

const text = 'first\nsecond\r\nthird';

describe('textPosition', () => {
  it('converts offsets to 1-based line and column', () => {
    expect(offsetToLineColumn(text, 0)).toEqual({ line: 1, column: 1 });
    expect(offsetToLineColumn(text, 6)).toEqual({ line: 2, column: 1 });
    expect(offsetToLineColumn(text, 14)).toEqual({ line: 3, column: 1 });
    expect(offsetToLineColumn(text, 16)).toEqual({ line: 3, column: 3 });
  });

  it('converts line and column back to offsets', () => {
    expect(lineColumnToOffset(text, 1, 1)).toBe(0);
    expect(lineColumnToOffset(text, 3, 3)).toBe(16);
  });

  it('clamps positions outside the text', () => {
    expect(lineColumnToOffset(text, 99, 1)).toBe(text.length);
    expect(offsetToLineColumn(text, 999)).toEqual({ line: 3, column: 6 });
  });
});
