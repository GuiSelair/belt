import { describe, expect, it } from 'vitest';

import { detectSimpleType, mergeSimpleTypes } from './simpleTypes';

describe('detectSimpleType', () => {
  it.each([
    ['true', 'boolean'],
    ['42', 'integer'],
    ['-007', 'integer'],
    ['3.14', 'decimal'],
    ['.5', 'decimal'],
    ['1e5', 'string'],
    ['2026-11-12', 'date'],
    ['2026-02-30', 'string'],
    ['2026-11-12T09:30:00Z', 'dateTime'],
    ['2026-11-12T09:30:00.123-03:00', 'dateTime'],
    ['', 'string'],
    ['hello', 'string'],
  ] as const)('detects %j as %s', (value, expected) => {
    expect(detectSimpleType(value)).toBe(expected);
  });
});

describe('mergeSimpleTypes', () => {
  it('widens integer and decimal to decimal', () => {
    expect(mergeSimpleTypes('integer', 'decimal')).toBe('decimal');
  });

  it('falls back to string for incompatible types', () => {
    expect(mergeSimpleTypes('integer', 'date')).toBe('string');
    expect(mergeSimpleTypes('boolean', 'string')).toBe('string');
  });

  it('keeps the known type when the other is unknown', () => {
    expect(mergeSimpleTypes(null, 'date')).toBe('date');
    expect(mergeSimpleTypes('date', null)).toBe('date');
  });
});
