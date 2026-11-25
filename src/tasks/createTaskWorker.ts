export function createTaskWorker() {
  return new Worker(new URL('./tasks.worker.ts', import.meta.url), {
    type: 'module',
  });
}
