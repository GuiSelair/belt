import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useLatestTask } from './useLatestTask';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe('useLatestTask', () => {
  it('discards results from stale inputs', async () => {
    const calls = new Map<string, ReturnType<typeof deferred<string>>>();
    function task(input: string) {
      const call = deferred<string>();
      calls.set(input, call);
      return call.promise;
    }

    const { result, rerender } = renderHook(
      ({ input }) => useLatestTask(task, input),
      { initialProps: { input: 'first' } },
    );
    rerender({ input: 'second' });

    await act(async () => {
      calls.get('first')?.resolve('FIRST');
      calls.get('second')?.resolve('SECOND');
    });

    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.outcome).toEqual({ ok: true, result: 'SECOND' });
  });

  it('keeps the previous outcome while a new input is pending', async () => {
    const echo = (value: string) => Promise.resolve(value);
    const { result, rerender } = renderHook(
      ({ input }) => useLatestTask(echo, input),
      { initialProps: { input: 'a' } },
    );
    await waitFor(() => expect(result.current.isPending).toBe(false));

    rerender({ input: 'b' });

    expect(result.current.isPending).toBe(true);
    expect(result.current.outcome).toEqual({ ok: true, result: 'a' });
  });

  it('reports task failures as error outcomes', async () => {
    const fail = () => Promise.reject(new Error('nope'));
    const { result } = renderHook(() => useLatestTask(fail, 'x'));

    await waitFor(() =>
      expect(result.current.outcome).toEqual({ ok: false, error: 'nope' }),
    );
  });
});
