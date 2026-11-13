import { describe, expect, it } from 'vitest';

import { decodeJwt } from './decodeJwt';

function encode(value: unknown) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return Buffer.from(text).toString('base64url');
}

function buildToken(header: unknown, payload: unknown, signature = 'sig') {
  return [encode(header), encode(payload), signature].join('.');
}

describe('decodeJwt', () => {
  it('decodes the header, payload and signature', () => {
    const result = decodeJwt(
      buildToken({ alg: 'HS256', typ: 'JWT' }, { sub: '42', name: 'Ada' }),
    );

    expect(result).toEqual({
      ok: true,
      token: {
        header: { alg: 'HS256', typ: 'JWT' },
        payload: { sub: '42', name: 'Ada' },
        headerJson: '{\n  "alg": "HS256",\n  "typ": "JWT"\n}',
        payloadJson: '{\n  "sub": "42",\n  "name": "Ada"\n}',
        signature: 'sig',
      },
    });
  });

  it('ignores surrounding whitespace and the Bearer prefix', () => {
    const token = buildToken({ alg: 'none' }, { sub: '1' }, '');
    const result = decodeJwt(`  Bearer ${token}\n`);

    expect(result.ok).toBe(true);
  });

  it('decodes UTF-8 text', () => {
    const result = decodeJwt(buildToken({ alg: 'HS256' }, { name: 'João' }));

    expect(result.ok && result.token.payload.name).toBe('João');
  });

  it('keeps the exact digits of large numbers in the JSON view', () => {
    const payload = '{"id":12345678901234567890}';
    const result = decodeJwt(buildToken({ alg: 'HS256' }, payload));

    expect(result.ok && result.token.payloadJson).toContain(
      '12345678901234567890',
    );
  });

  it('rejects tokens without three parts', () => {
    const result = decodeJwt('abc.def');

    expect(result).toEqual({
      ok: false,
      error: {
        message: 'A JWT has 3 dot-separated parts, but this token has 2.',
      },
    });
  });

  it('explains that encrypted tokens cannot be decoded', () => {
    const result = decodeJwt('a.b.c.d.e');

    expect(!result.ok && result.error.message).toMatch(/encrypted token/);
  });

  it('points to the segment with invalid Base64URL', () => {
    const result = decodeJwt(`${encode({ alg: 'HS256' })}.@@@.sig`);

    expect(result).toEqual({
      ok: false,
      error: {
        message: 'The payload is not valid Base64URL.',
        segment: 'payload',
      },
    });
  });

  it('points to the segment that is not JSON', () => {
    const result = decodeJwt(`${encode('not json')}.${encode({})}.sig`);

    expect(result).toEqual({
      ok: false,
      error: { message: 'The header is not valid JSON.', segment: 'header' },
    });
  });

  it('requires JSON objects', () => {
    const result = decodeJwt(buildToken({ alg: 'HS256' }, [1, 2]));

    expect(!result.ok && result.error.message).toBe(
      'The payload must be a JSON object.',
    );
  });

  it('asks for a token when the input is empty', () => {
    expect(decodeJwt('   ')).toEqual({
      ok: false,
      error: { message: 'Paste a token to decode.' },
    });
  });
});
