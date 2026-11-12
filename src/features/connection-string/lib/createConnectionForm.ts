import type { ConnectionForm, EngineId } from './types';

export function createConnectionForm(
  engineId: EngineId,
  createId: () => string,
): ConnectionForm {
  return {
    engineId,
    variantEnabled: false,
    hosts: [{ id: createId(), host: '', port: '' }],
    username: '',
    password: '',
    database: '',
    instance: '',
    params: [],
  };
}
