import type { WorkerRequest, WorkerResponse } from './protocol';

interface RunOptions {
  timeoutMs?: number;
}

interface PendingRequest {
  resolve(result: unknown): void;
  reject(error: Error): void;
  timer: ReturnType<typeof setTimeout>;
}

export interface WorkerClient {
  run(task: string, payload: unknown, options?: RunOptions): Promise<unknown>;
  dispose(): void;
}

export const DEFAULT_TIMEOUT_MS = 5000;

/**
 * Sends named tasks to a lazily created worker. A timeout or crash terminates
 * the worker, rejects every pending task, and the next task starts a new one.
 */
export function createWorkerClient(createWorker: () => Worker): WorkerClient {
  let worker: Worker | null = null;
  let nextId = 0;
  const pending = new Map<number, PendingRequest>();

  function settle(id: number) {
    const request = pending.get(id);
    if (!request) return null;
    clearTimeout(request.timer);
    pending.delete(id);
    return request;
  }

  function reset(error: Error) {
    worker?.terminate();
    worker = null;
    for (const id of [...pending.keys()]) settle(id)?.reject(error);
  }

  function handleMessage(event: MessageEvent<WorkerResponse>) {
    const response = event.data;
    const request = settle(response.id);
    if (!request) return;
    if (response.ok) request.resolve(response.result);
    else request.reject(new Error(response.error));
  }

  function handleError(event: ErrorEvent) {
    event.preventDefault?.();
    reset(new Error(event.message || 'The background worker crashed.'));
  }

  function getWorker() {
    if (worker) return worker;
    worker = createWorker();
    worker.onmessage = handleMessage;
    worker.onerror = handleError;
    return worker;
  }

  function run(
    task: string,
    payload: unknown,
    { timeoutMs = DEFAULT_TIMEOUT_MS }: RunOptions = {},
  ) {
    const id = ++nextId;
    return new Promise<unknown>((resolve, reject) => {
      const timer = setTimeout(() => {
        reset(
          new Error(
            `Processing took longer than ${timeoutMs / 1000}s and was stopped.`,
          ),
        );
      }, timeoutMs);
      pending.set(id, { resolve, reject, timer });
      const request: WorkerRequest = { id, task, payload };
      getWorker().postMessage(request);
    });
  }

  function dispose() {
    reset(new Error('The background worker was disposed.'));
  }

  return { run, dispose };
}
