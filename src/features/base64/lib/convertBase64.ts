export type Base64Direction = 'encode' | 'decode';

export interface ConvertBase64Request {
  text: string;
  direction: Base64Direction;
}

export interface Base64ConvertError {
  message: string;
}

export type ConvertBase64Result =
  { ok: true; output: string } | { ok: false; error: Base64ConvertError };

const BASE64_BODY = /^[A-Za-z0-9+/]*={0,2}$/;
const CHUNK_SIZE = 0x8000;

function bytesToBinary(bytes: Uint8Array) {
  const parts: string[] = [];
  for (let index = 0; index < bytes.length; index += CHUNK_SIZE) {
    const chunk = bytes.subarray(index, index + CHUNK_SIZE);
    parts.push(String.fromCharCode(...Array.from(chunk)));
  }
  return parts.join('');
}

function encodeBase64(text: string): ConvertBase64Result {
  const bytes = new TextEncoder().encode(text);
  return { ok: true, output: btoa(bytesToBinary(bytes)) };
}

function padBase64(value: string) {
  const remainder = value.length % 4;
  if (remainder === 0) return value;
  return value + '='.repeat(4 - remainder);
}

function isWellFormedBase64(value: string) {
  if (!BASE64_BODY.test(value)) return false;
  if (value.includes('=')) return value.length % 4 === 0;
  return value.length % 4 !== 1;
}

function decodeBase64(text: string): ConvertBase64Result {
  const compact = text.replace(/\s/g, '');
  if (compact === '') {
    return { ok: false, error: { message: 'Paste Base64 to decode.' } };
  }
  if (!isWellFormedBase64(compact)) {
    return { ok: false, error: { message: 'This is not valid Base64.' } };
  }

  let binary: string;
  try {
    binary = atob(padBase64(compact));
  } catch {
    return { ok: false, error: { message: 'This is not valid Base64.' } };
  }

  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  try {
    return {
      ok: true,
      output: new TextDecoder('utf-8', { fatal: true }).decode(bytes),
    };
  } catch {
    return {
      ok: false,
      error: { message: 'The decoded bytes are not valid UTF-8.' },
    };
  }
}

export function convertBase64({
  text,
  direction,
}: ConvertBase64Request): ConvertBase64Result {
  if (direction === 'encode') return encodeBase64(text);
  return decodeBase64(text);
}
