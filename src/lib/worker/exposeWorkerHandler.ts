import type { WorkerRequest, WorkerResponse } from './protocol';

export function exposeWorkerHandler<Payload, Result>(
  handler: (payload: Payload) => Result | Promise<Result>,
) {
  self.onmessage = async (event: MessageEvent<WorkerRequest<Payload>>) => {
    const { id, payload } = event.data;
    let response: WorkerResponse<Result>;

    try {
      response = { id, ok: true, result: await handler(payload) };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      response = { id, ok: false, error: message };
    }

    self.postMessage(response);
  };
}
