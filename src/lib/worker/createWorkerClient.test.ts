import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createWorkerClient } from './createWorkerClient';
import type { WorkerRequest } from './protocol';

class FakeWorker {
  static instances: FakeWorker[] = [];
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  terminated = false;
  received: WorkerRequest<string>[] = [];

  constructor() {
    FakeWorker.instances.push(this);
  }

  postMessage(message: WorkerRequest<string>) {
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
  return createWorkerClient<string, string>(
    () => new FakeWorker() as unknown as Worker,
    { timeoutMs: 1000 },
  );
}

describe('createWorkerClient', () => {
  beforeEach(() => {
    FakeWorker.instances = [];
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates the worker lazily and resolves responses by id', async () => {
    const client = createClient();
    expect(FakeWorker.instances).toHaveLength(0);

    const first = client.run('a');
    const second = client.run('b');
    const worker = FakeWorker.instances[0];
    worker.reply(worker.received[1].id, 'B');
    worker.reply(worker.received[0].id, 'A');

    await expect(first).resolves.toBe('A');
    await expect(second).resolves.toBe('B');
    expect(FakeWorker.instances).toHaveLength(1);
  });

  it('rejects worker-side errors', async () => {
    const client = createClient();
    const pending = client.run('a');
    const worker = FakeWorker.instances[0];
    worker.onmessage?.({
      data: { id: worker.received[0].id, ok: false, error: 'boom' },
    } as MessageEvent);

    await expect(pending).rejects.toThrow('boom');
  });

  it('terminates on timeout and recreates the worker on next run', async () => {
    const client = createClient();
    const pending = client.run('slow');
    const assertion = expect(pending).rejects.toThrow(/took longer than/);

    vi.advanceTimersByTime(1000);
    await assertion;
    expect(FakeWorker.instances[0].terminated).toBe(true);

    const next = client.run('next');
    expect(FakeWorker.instances).toHaveLength(2);
    client.dispose();
    await expect(next).rejects.toThrow(/disposed/);
  });
});
