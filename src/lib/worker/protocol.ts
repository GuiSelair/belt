export interface WorkerRequest<Payload = unknown> {
  id: number;
  task: string;
  payload: Payload;
}

export type WorkerResponse<Result = unknown> =
  | { id: number; ok: true; result: Result }
  | { id: number; ok: false; error: string };
