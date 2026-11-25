import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createWorkerClient } from './createWorkerClient';
import type { WorkerRequest } from './protocol';

class FakeWorker {
  static instances: FakeWorker[] = [];
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  terminated = false;
  received: WorkerRequest[] = [];

  constructor() {
    FakeWorker.instances.push(this);
  }

  postMessage(message: WorkerRequest) {
    this.received.push(message);
  }

  terminate() {
    this.terminated = true;
  }

  reply(id: number, result: string) {
    this.onmessage?.({ data: { id, ok: true, result } } as MessageEvent);
  }
}

function createClient() {
  return createWorkerClient(() => new FakeWorker() as unknown as Worker);
}

describe('createWorkerClient', () => {
  beforeEach(() => {
    FakeWorker.instances = [];
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates one worker lazily and sends every task to it', async () => {
    const client = createClient();
    expect(FakeWorker.instances).toHaveLength(0);

    const first = client.run('upper', 'a');
    const second = client.run('lower', 'b');
    const worker = FakeWorker.instances[0];
    expect(worker.received.map(({ task }) => task)).toEqual(['upper', 'lower']);
    worker.reply(worker.received[1].id, 'B');
    worker.reply(worker.received[0].id, 'A');

    await expect(first).resolves.toBe('A');
    await expect(second).resolves.toBe('B');
    expect(FakeWorker.instances).toHaveLength(1);
  });

  it('rejects worker-side errors', async () => {
    const client = createClient();
    const pending = client.run('upper', 'a');
    const worker = FakeWorker.instances[0];
    worker.onmessage?.({
      data: { id: worker.received[0].id, ok: false, error: 'boom' },
    } as MessageEvent);

    await expect(pending).rejects.toThrow('boom');
  });

  it('applies the timeout of each task', async () => {
    const client = createClient();
    const fast = client.run('fast', 'a', { timeoutMs: 1000 });
    const slow = client.run('slow', 'b', { timeoutMs: 3000 });
    const assertion = expect(fast).rejects.toThrow(/longer than 1s/);

    vi.advanceTimersByTime(1000);
    await assertion;
    await expect(slow).rejects.toThrow(/longer than 1s/);
  });

  it('terminates on timeout and recreates the worker on next run', async () => {
    const client = createClient();
    const pending = client.run('slow', 'a', { timeoutMs: 1000 });
    const assertion = expect(pending).rejects.toThrow(/took longer than/);

    vi.advanceTimersByTime(1000);
    await assertion;
    expect(FakeWorker.instances[0].terminated).toBe(true);

    const next = client.run('next', 'b');
    expect(FakeWorker.instances).toHaveLength(2);
    client.dispose();
    await expect(next).rejects.toThrow(/disposed/);
  });
});
