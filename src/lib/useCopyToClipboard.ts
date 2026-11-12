'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type CopyStatus = 'idle' | 'copied' | 'error';

const RESET_AFTER_MS = 2000;

export function useCopyToClipboard() {
  const [status, setStatus] = useState<CopyStatus>('idle');
  const resetTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(resetTimerRef.current), []);

  const copy = useCallback(async (text: string) => {
    clearTimeout(resetTimerRef.current);
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      setStatus('copied');
    } catch {
      setStatus('error');
    }
    resetTimerRef.current = setTimeout(() => setStatus('idle'), RESET_AFTER_MS);
  }, []);

  return { copy, status };
}
