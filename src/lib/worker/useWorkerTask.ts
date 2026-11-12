'use client';

import { useCallback, useEffect, useRef } from 'react';

import { createWorkerClient, type WorkerClient } from './createWorkerClient';

export interface WorkerTaskOptions<Payload, Result> {
  timeoutMs?: number;
  /** Runs small payloads on the main thread to skip worker overhead. */
  inline?: {
    when(payload: Payload): boolean;
    run(payload: Payload): Result;
  };
}

/**
 * Returns a stable async task backed by a lazily created Web Worker.
 * `createWorker` and `options` must be module-level constants.
 */
export function useWorkerTask<Payload, Result>(
  createWorker: () => Worker,
  options: WorkerTaskOptions<Payload, Result> = {},
) {
  const clientRef = useRef<WorkerClient<Payload, Result> | null>(null);
  const { timeoutMs, inline } = options;

  useEffect(
    () => () => {
      clientRef.current?.dispose();
      clientRef.current = null;
    },
    [],
  );

  return useCallback(
    async (payload: Payload): Promise<Result> => {
      if (inline?.when(payload)) return inline.run(payload);
      clientRef.current ??= createWorkerClient<Payload, Result>(createWorker, {
        timeoutMs,
      });
      return clientRef.current.run(payload);
    },
    [createWorker, inline, timeoutMs],
  );
}
