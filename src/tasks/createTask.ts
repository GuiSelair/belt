import { createWorkerClient } from '@/lib/worker/createWorkerClient';

import { createTaskWorker } from './createTaskWorker';
import type { TaskName, TaskPayload, TaskResult } from './taskLoaders';

interface TaskOptions {
  timeoutMs?: number;
}

const taskClient = createWorkerClient(createTaskWorker);

/**
 * Returns a stable function that runs the task in the shared worker. Call it
 * at module level so hooks can pass the result straight to `useLatestTask`.
 */
export function createTask<Name extends TaskName>(
  name: Name,
  options: TaskOptions = {},
) {
  return function runTask(payload: TaskPayload<Name>) {
    return taskClient.run(name, payload, options) as Promise<TaskResult<Name>>;
  };
}
