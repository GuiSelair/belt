import { formatJson } from '@/features/json/lib/formatJson';

export type JwtSegment = 'header' | 'payload';

export type JsonObject = Record<string, unknown>;

export interface DecodedJwt {
  header: JsonObject;
  payload: JsonObject;
  /** Pretty-printed JSON, keeping the exact digits of large numbers. */
  headerJson: string;
  payloadJson: string;
  signature: string;
}

export interface JwtDecodeError {
  message: string;
  segment?: JwtSegment;
}

export type DecodeJwtResult =
  { ok: true; token: DecodedJwt } | { ok: false; error: JwtDecodeError };

const BASE64URL_PATTERN = /^[A-Za-z0-9_-]*$/;
const BEARER_PREFIX = /^bearer\s+/i;

class SegmentError extends Error {
  constructor(
    message: string,
    readonly segment: JwtSegment,
  ) {
    super(message);
  }
}

function decodeBase64Url(value: string, segment: JwtSegment): string {
  if (!BASE64URL_PATTERN.test(value) || value.length % 4 === 1) {
    throw new SegmentError(`The ${segment} is not valid Base64URL.`, segment);
  }
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    '=',
  );
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new SegmentError(`The ${segment} is not valid UTF-8.`, segment);
  }
}

function decodeSegment(value: string, segment: JwtSegment) {
  if (value === '') {
    throw new SegmentError(`The ${segment} is empty.`, segment);
  }
  const text = decodeBase64Url(value, segment);
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new SegmentError(`The ${segment} is not valid JSON.`, segment);
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new SegmentError(`The ${segment} must be a JSON object.`, segment);
  }
  const formatted = formatJson({ text, indent: '  ' });
  return {
    value: parsed as JsonObject,
    json: formatted.ok ? formatted.output : JSON.stringify(parsed, null, 2),
  };
}

export function decodeJwt(input: string): DecodeJwtResult {
  const token = input.trim().replace(BEARER_PREFIX, '');
  if (token === '') {
    return { ok: false, error: { message: 'Paste a token to decode.' } };
  }

  const parts = token.split('.');
  if (parts.length === 5) {
    return {
      ok: false,
      error: {
        message:
          'This is an encrypted token (JWE). Its payload can only be read with the decryption key.',
      },
    };
  }
  if (parts.length !== 3) {
    return {
      ok: false,
      error: {
        message: `A JWT has 3 dot-separated parts, but this token has ${parts.length}.`,
      },
    };
  }

  const [rawHeader, rawPayload, signature] = parts;
  try {
    const header = decodeSegment(rawHeader, 'header');
    const payload = decodeSegment(rawPayload, 'payload');
    return {
      ok: true,
      token: {
        header: header.value,
        payload: payload.value,
        headerJson: header.json,
        payloadJson: payload.json,
        signature,
      },
    };
  } catch (error) {
    if (error instanceof SegmentError) {
      return {
        ok: false,
        error: { message: error.message, segment: error.segment },
      };
    }
    throw error;
  }
}
