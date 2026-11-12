'use client';

import { useEffect, useState } from 'react';

export type TaskOutcome<Result> =
  { ok: true; result: Result } | { ok: false; error: string };

interface SettledTask<Input, Result> {
  input: Input;
  outcome: TaskOutcome<Result>;
}

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Runs `task` whenever `input` changes and keeps only the outcome of the
 * latest input. The previous outcome stays available while a newer input is
 * pending, so screens can display it as stale. `task` and `input` must be
 * referentially stable (memoize them) to avoid re-running on every render.
 */
export function useLatestTask<Input, Result>(
  task: (input: Input) => Promise<Result>,
  input: Input | null,
) {
  const [settled, setSettled] = useState<SettledTask<Input, Result> | null>(
    null,
  );

  useEffect(() => {
    if (input === null) return;
    let isCurrent = true;

    task(input).then(
      (result) => {
        if (isCurrent) setSettled({ input, outcome: { ok: true, result } });
      },
      (error: unknown) => {
        if (isCurrent) {
          setSettled({
            input,
            outcome: { ok: false, error: toErrorMessage(error) },
          });
        }
      },
    );

    return () => {
      isCurrent = false;
    };
  }, [task, input]);

  return {
    outcome: settled?.outcome ?? null,
    isPending: input !== null && settled?.input !== input,
  };
}
