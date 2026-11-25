import type { WorkerRequest, WorkerResponse } from './protocol';

type TaskHandler = (payload: never) => unknown;

export type TaskLoaders = Record<string, () => Promise<TaskHandler>>;

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

/** Resolves each request to the handler its loader imports on first use. */
export function createTaskDispatcher(loaders: TaskLoaders) {
  return async function dispatch({
    id,
    task,
    payload,
  }: WorkerRequest): Promise<WorkerResponse> {
    try {
      if (!Object.hasOwn(loaders, task)) {
        throw new Error(`Unknown task: ${task}`);
      }
      const handler = (await loaders[task]()) as (input: unknown) => unknown;
      return { id, ok: true, result: await handler(payload) };
    } catch (error) {
      return { id, ok: false, error: toErrorMessage(error) };
    }
  };
}

export type TaskDispatcher = ReturnType<typeof createTaskDispatcher>;
