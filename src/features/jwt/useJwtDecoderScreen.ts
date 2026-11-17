'use client';

import { useCallback, useMemo, useState } from 'react';

import { decodeJwt } from './lib/decodeJwt';
import { describeClaims } from './lib/describeClaims';

export const JWT_SAMPLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2F1dGguYmVsdC5kZXYiLCJzdWIiOiIxMjM0NTY3ODkwIiwiYXVkIjoiYmVsdC13ZWIiLCJuYW1lIjoiQWRhIExvdmVsYWNlIiwicm9sZXMiOlsiYWRtaW4iLCJlZGl0b3IiXSwiaWF0IjoxNzYzMDQ5NjAwLCJuYmYiOjE3NjMwNDk2MDAsImV4cCI6NDEwMjQ0NDgwMCwianRpIjoiOGYxNGU0NWYtY2VlYS00NjdmLWE5ZjEtMWEyYjNjNGQ1ZTZmIn0.YmVsdC1zYW1wbGUtc2lnbmF0dXJlLW5vdC12ZXJpZmllZA';

export function useJwtDecoderScreen() {
  const [input, setInput] = useState(JWT_SAMPLE);
  const [submitted, setSubmitted] = useState<string | null>(null);

  const result = useMemo(
    () => (submitted === null ? null : decodeJwt(submitted)),
    [submitted],
  );
  const token = result?.ok ? result.token : null;
  const decodeError = result && !result.ok ? result.error : null;
  const description = useMemo(
    () => (token ? describeClaims(token.header, token.payload) : null),
    [token],
  );

  const handleRun = useCallback(() => setSubmitted(input), [input]);
  const handleClear = useCallback(() => {
    setInput('');
    setSubmitted(null);
  }, []);

  return {
    input,
    setInput,
    canRun: input.trim() !== '',
    hasRun: submitted !== null,
    token,
    description,
    decodeError,
    handleRun,
    handleClear,
  };
}
