import type { WorkerRequest, WorkerResponse } from './protocol';

interface WorkerClientOptions {
  timeoutMs?: number;
}

interface PendingRequest<Result> {
  resolve(result: Result): void;
  reject(error: Error): void;
  timer: ReturnType<typeof setTimeout>;
}

export interface WorkerClient<Payload, Result> {
  run(payload: Payload): Promise<Result>;
  dispose(): void;
}

const DEFAULT_TIMEOUT_MS = 5000;

export function createWorkerClient<Payload, Result>(
  createWorker: () => Worker,
  { timeoutMs = DEFAULT_TIMEOUT_MS }: WorkerClientOptions = {},
): WorkerClient<Payload, Result> {
  let worker: Worker | null = null;
  let nextId = 0;
  const pending = new Map<number, PendingRequest<Result>>();

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

  function handleMessage(event: MessageEvent<WorkerResponse<Result>>) {
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

  function run(payload: Payload) {
    const id = ++nextId;
    return new Promise<Result>((resolve, reject) => {
      const timer = setTimeout(() => {
        reset(
          new Error(
            `Processing took longer than ${timeoutMs / 1000}s and was stopped.`,
          ),
        );
      }, timeoutMs);
      pending.set(id, { resolve, reject, timer });
      const request: WorkerRequest<Payload> = { id, payload };
      getWorker().postMessage(request);
    });
  }

  function dispose() {
    reset(new Error('The background worker was disposed.'));
  }

  return { run, dispose };
}
