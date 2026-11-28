import { describe, expect, it } from 'vitest';

import { convertBase64 } from './convertBase64';

const rfcVectors = [
  ['', ''],
  ['f', 'Zg=='],
  ['fo', 'Zm8='],
  ['foo', 'Zm9v'],
  ['foob', 'Zm9vYg=='],
  ['fooba', 'Zm9vYmE='],
  ['foobar', 'Zm9vYmFy'],
] as const;

function encode(text: string) {
  return convertBase64({ text, direction: 'encode' });
}

function decode(text: string) {
  return convertBase64({ text, direction: 'decode' });
}

describe('convertBase64', () => {
  it('encodes the RFC 4648 vectors', () => {
    for (const [text, base64] of rfcVectors) {
      expect(encode(text)).toEqual({ ok: true, output: base64 });
    }
  });

  it('decodes the RFC 4648 vectors, including missing padding', () => {
    for (const [text, base64] of rfcVectors.slice(1)) {
      expect(decode(base64)).toEqual({ ok: true, output: text });
    }
    expect(decode('Zm9vYmE')).toEqual({ ok: true, output: 'fooba' });
    expect(decode('Zg')).toEqual({ ok: true, output: 'f' });
  });

  it('preserves whitespace and UTF-8 when encoding', () => {
    expect(encode(' a ')).toEqual({ ok: true, output: 'IGEg' });
    expect(encode('João')).toEqual({ ok: true, output: 'Sm/Do28=' });
    expect(decode('Sm/Do28=')).toEqual({ ok: true, output: 'João' });
  });

  it('ignores whitespace inside Base64', () => {
    expect(decode('Zm9v\nYmFy  ')).toEqual({ ok: true, output: 'foobar' });
  });

  it('rejects empty, malformed and non-UTF-8 input', () => {
    expect(decode('   ')).toEqual({
      ok: false,
      error: { message: 'Paste Base64 to decode.' },
    });
    expect(decode('!!!')).toEqual({
      ok: false,
      error: { message: 'This is not valid Base64.' },
    });
    expect(decode('Z')).toEqual({
      ok: false,
      error: { message: 'This is not valid Base64.' },
    });
    expect(decode('Zm9v=')).toEqual({
      ok: false,
      error: { message: 'This is not valid Base64.' },
    });
    expect(decode('/w==')).toEqual({
      ok: false,
      error: { message: 'The decoded bytes are not valid UTF-8.' },
    });
  });
});
