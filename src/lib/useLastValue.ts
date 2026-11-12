'use client';

import { useState } from 'react';

/**
 * Returns `value` when defined, otherwise the last defined value seen.
 * Uses the "adjust state during render" pattern from the React docs.
 */
export function useLastValue<Value>(
  value: Value | undefined,
  initial: Value,
): Value {
  const [last, setLast] = useState(initial);
  if (value !== undefined && !Object.is(value, last)) setLast(value);
  return value ?? last;
}
