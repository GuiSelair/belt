import type { JsonNode } from './types';

export interface JsonSummary {
  rootType: JsonNode['kind'];
  childCount: number | null;
  sizeInBytes: number;
}

function countChildren(node: JsonNode): number | null {
  if (node.kind === 'object') return node.entries.length;
  if (node.kind === 'array') return node.items.length;
  return null;
}

export function summarizeJson(node: JsonNode, text: string): JsonSummary {
  return {
    rootType: node.kind,
    childCount: countChildren(node),
    sizeInBytes: new TextEncoder().encode(text).length,
  };
}
