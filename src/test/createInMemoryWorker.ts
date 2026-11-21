import { createTaskDispatcher } from '@/lib/worker/createTaskDispatcher';
import type { WorkerRequest } from '@/lib/worker/protocol';
import { taskLoaders } from '@/tasks/taskLoaders';

/**
 * Stands in for the task worker under jsdom, which has no `Worker`. It runs
 * the real dispatcher and clones messages both ways, like `postMessage` does.
 */
export function createInMemoryWorker() {
  const dispatch = createTaskDispatcher(taskLoaders);
  let isTerminated = false;

  const worker = {
    onmessage: null as ((event: MessageEvent) => void) | null,
    onerror: null as ((event: ErrorEvent) => void) | null,
    postMessage(request: WorkerRequest) {
      dispatch(structuredClone(request)).then((response) => {
        if (isTerminated) return;
        worker.onmessage?.({ data: structuredClone(response) } as MessageEvent);
      });
    },
    terminate() {
      isTerminated = true;
    },
  };

  return worker as unknown as Worker;
}
