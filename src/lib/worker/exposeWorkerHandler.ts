import type { TaskDispatcher } from './createTaskDispatcher';
import type { WorkerRequest } from './protocol';

export function exposeWorkerHandler(dispatch: TaskDispatcher) {
  self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
    self.postMessage(await dispatch(event.data));
  };
}
