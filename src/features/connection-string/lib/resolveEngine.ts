import type { EngineDefinition } from './types';

export interface ResolvedEngine {
  scheme: string;
  defaultPort: number | null;
  impliedParams: Record<string, string>;
  allowsMultipleHosts: boolean;
}

export function resolveEngine(
  engine: EngineDefinition,
  variantEnabled: boolean,
): ResolvedEngine {
  const variant = variantEnabled ? engine.variant : undefined;
  return {
    scheme: variant?.scheme ?? engine.scheme,
    defaultPort: variant ? variant.defaultPort : engine.defaultPort,
    impliedParams: variant?.impliedParams ?? {},
    allowsMultipleHosts: engine.multipleHosts && !variant?.singleHost,
  };
}
