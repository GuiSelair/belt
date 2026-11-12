import type { EncodedCharacter } from './types';

export interface TrackedEncoding {
  encoded: string;
  changes: EncodedCharacter[];
  hadPercent: boolean;
}

/** RFC 3986 percent-encoding that reports every character it changed. */
export function encodeTracked(value: string): TrackedEncoding {
  const changes = new Map<string, string>();
  let encoded = '';

  for (const char of value.toWellFormed()) {
    const encodedChar = encodeURIComponent(char);
    if (encodedChar !== char) changes.set(char, encodedChar);
    encoded += encodedChar;
  }

  return {
    encoded,
    changes: [...changes].map(([char, encodedChar]) => ({
      char,
      encoded: encodedChar,
    })),
    hadPercent: value.includes('%'),
  };
}
