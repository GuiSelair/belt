import { describe, expect, it } from 'vitest';

import { describeClaims, formatRelativeTime } from './describeClaims';

const NOW = new Date('2026-01-01T00:00:00Z');
const NOW_SECONDS = NOW.getTime() / 1000;

describe('describeClaims', () => {
  it('reads the algorithm and type from the header', () => {
    const description = describeClaims({ alg: 'RS256', typ: 'JWT' }, {}, NOW);

    expect(description.algorithm).toBe('RS256');
    expect(description.type).toBe('JWT');
  });

  it('lists only the registered claims present, in a stable order', () => {
    const description = describeClaims(
      {},
      { name: 'Ada', sub: '42', iss: 'belt', aud: ['web', 'api'] },
      NOW,
    );

    expect(description.claims).toEqual([
      { key: 'iss', label: 'Issuer', value: 'belt', detail: undefined },
      { key: 'sub', label: 'Subject', value: '42', detail: undefined },
      { key: 'aud', label: 'Audience', value: 'web, api', detail: undefined },
    ]);
  });

  it('shows time claims as UTC dates with a relative time', () => {
    const description = describeClaims(
      {},
      { exp: NOW_SECONDS + 2 * 60 * 60 },
      NOW,
    );

    expect(description.claims[0]).toEqual({
      key: 'exp',
      label: 'Expires at',
      value: String(NOW_SECONDS + 7200),
      detail: '2026-01-01T02:00:00.000Z (in 2 hours)',
    });
  });

  it('marks tokens as active before they expire', () => {
    const description = describeClaims({}, { exp: NOW_SECONDS + 1 }, NOW);

    expect(description.status).toBe('active');
  });

  it('marks tokens as expired at the expiry time', () => {
    const description = describeClaims({}, { exp: NOW_SECONDS }, NOW);

    expect(description.status).toBe('expired');
  });

  it('marks tokens that are not valid yet', () => {
    const description = describeClaims(
      {},
      { nbf: NOW_SECONDS + 60, exp: NOW_SECONDS + 120 },
      NOW,
    );

    expect(description.status).toBe('not-yet-valid');
  });

  it('flags tokens without an expiry', () => {
    expect(describeClaims({}, { sub: '1' }, NOW).status).toBe('no-expiry');
  });

  it('ignores time claims that are not numbers', () => {
    const description = describeClaims({}, { exp: 'tomorrow' }, NOW);

    expect(description.status).toBe('no-expiry');
    expect(description.claims[0].detail).toBeUndefined();
  });
});

describe('formatRelativeTime', () => {
  it('uses the largest fitting unit', () => {
    expect(formatRelativeTime(NOW_SECONDS - 3 * 86400, NOW_SECONDS)).toBe(
      '3 days ago',
    );
    expect(formatRelativeTime(NOW_SECONDS + 90, NOW_SECONDS)).toBe(
      'in 1 minute',
    );
    expect(formatRelativeTime(NOW_SECONDS, NOW_SECONDS)).toBe('now');
  });
});
