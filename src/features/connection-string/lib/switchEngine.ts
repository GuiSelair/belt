import { getEngine } from './engines';
import { resolveEngine } from './resolveEngine';
import type { ConnectionForm, EngineId } from './types';

export interface SwitchEngineResult {
  form: ConnectionForm;
  droppedParams: string[];
}

/** Keeps shared fields and drops what the next engine cannot use. */
export function switchEngine(
  form: ConnectionForm,
  nextEngineId: EngineId,
): SwitchEngineResult {
  const current = getEngine(form.engineId);
  const next = getEngine(nextEngineId);
  const previousDefault = resolveEngine(
    current,
    form.variantEnabled,
  ).defaultPort;
  const supportedKeys = new Set(next.suggestedParams.map(({ key }) => key));

  const hosts = (next.multipleHosts ? form.hosts : form.hosts.slice(0, 1)).map(
    (entry) =>
      entry.port.trim() === String(previousDefault)
        ? { ...entry, port: '' }
        : entry,
  );
  const params = form.params.filter(
    (param) => param.origin === 'custom' || supportedKeys.has(param.key),
  );
  const droppedParams = form.params
    .filter((param) => !params.includes(param))
    .map((param) => param.key);

  return {
    form: {
      ...form,
      engineId: nextEngineId,
      variantEnabled: false,
      hosts,
      instance: next.supportsInstance ? form.instance : '',
      params,
    },
    droppedParams,
  };
}
