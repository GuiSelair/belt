export interface WorkerRequest<Payload> {
  id: number;
  payload: Payload;
}

export type WorkerResponse<Result> =
  | { id: number; ok: true; result: Result }
  | { id: number; ok: false; error: string };
