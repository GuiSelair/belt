import { describe, expect, it } from 'vitest';

import { createTaskDispatcher } from './createTaskDispatcher';

const dispatch = createTaskDispatcher({
  double: async () => (value: number) => value * 2,
  fail: async () => () => {
    throw new Error('boom');
  },
  failToLoad: () => Promise.reject(new Error('chunk failed')),
});

describe('createTaskDispatcher', () => {
  it('runs the handler of the requested task', async () => {
    await expect(
      dispatch({ id: 1, task: 'double', payload: 21 }),
    ).resolves.toEqual({ id: 1, ok: true, result: 42 });
  });

  it('reports unknown tasks, including inherited object keys', async () => {
    await expect(
      dispatch({ id: 2, task: 'missing', payload: null }),
    ).resolves.toEqual({ id: 2, ok: false, error: 'Unknown task: missing' });
    await expect(
      dispatch({ id: 3, task: 'toString', payload: null }),
    ).resolves.toEqual({ id: 3, ok: false, error: 'Unknown task: toString' });
  });

  it('turns handler and loader errors into error responses', async () => {
    await expect(
      dispatch({ id: 4, task: 'fail', payload: null }),
    ).resolves.toEqual({ id: 4, ok: false, error: 'boom' });
    await expect(
      dispatch({ id: 5, task: 'failToLoad', payload: null }),
    ).resolves.toEqual({ id: 5, ok: false, error: 'chunk failed' });
  });
});
