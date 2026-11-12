'use client';

import { useEffect, useState } from 'react';

export const TYPING_DEBOUNCE_MS = 300;

export function useDebouncedValue<Value>(
  value: Value,
  delayMs = TYPING_DEBOUNCE_MS,
): Value {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
