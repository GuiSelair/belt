import { describe, expect, it } from 'vitest';

import { JWT_SAMPLE } from '../jwtShared';
import { inspectJwt } from './inspectJwt';

describe('inspectJwt', () => {
  it('decodes the token and describes its claims', () => {
    const result = inspectJwt(JWT_SAMPLE);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.token.header.alg).toBe('HS256');
    expect(result.description.algorithm).toBe('HS256');
    expect(result.description.status).toBe('active');
  });

  it('returns the decode error for malformed tokens', () => {
    expect(inspectJwt('not-a-token')).toEqual({
      ok: false,
      error: {
        message: 'A JWT has 3 dot-separated parts, but this token has 1.',
      },
    });
  });
});
