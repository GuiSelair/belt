import { describe, expect, it } from 'vitest';

import { detectStringFormat } from './stringFormats';

describe('detectStringFormat', () => {
  it.each([
    ['2026-11-12T09:30:00Z', 'date-time'],
    ['2026-11-12T09:30:00.123-03:00', 'date-time'],
    ['2026-11-12', 'date'],
    ['09:30:00Z', 'time'],
    ['4f1c2b8e-9d3a-4e7b-a6f5-2c8d1e0b7a93', 'uuid'],
    ['192.168.0.1', 'ipv4'],
    ['dev@example.com', 'email'],
    ['https://example.com/path?q=1', 'uri'],
  ])('detects %s as %s', (value, format) => {
    expect(detectStringFormat(value)).toBe(format);
  });

  it.each([
    'Belt',
    '',
    '2026-02-30',
    '2026-11-12T09:30:00',
    '256.1.1.1',
    'not an@email',
    'example.com',
  ])('leaves %j without a format', (value) => {
    expect(detectStringFormat(value)).toBeNull();
  });
});
