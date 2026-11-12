import { mergeSimpleTypes, type SimpleType } from './simpleTypes';

export interface AttributeStats {
  type: SimpleType;
  count: number;
}

export interface ChildStats {
  element: ElementStats;
  parentsWithChild: number;
  maxPerParent: number;
}

export interface ElementStats {
  name: string;
  occurrences: number;
  textType: SimpleType | null;
  hasText: boolean;
  attributes: Map<string, AttributeStats>;
  /** Insertion order is the order of first appearance. */
  children: Map<string, ChildStats>;
  /** Child name -> names seen immediately after it in some occurrence. */
  childFollowers: Map<string, Set<string>>;
  hasInterleavedChildren: boolean;
}

export function createElementStats(name: string): ElementStats {
  return {
    name,
    occurrences: 0,
    textType: null,
    hasText: false,
    attributes: new Map(),
    children: new Map(),
    childFollowers: new Map(),
    hasInterleavedChildren: false,
  };
}

export function recordAttribute(
  stats: ElementStats,
  name: string,
  type: SimpleType,
  count = 1,
) {
  const current = stats.attributes.get(name);
  stats.attributes.set(name, {
    type: mergeSimpleTypes(current?.type ?? null, type) ?? type,
    count: (current?.count ?? 0) + count,
  });
}

export function recordFollower(
  stats: ElementStats,
  name: string,
  next: string,
) {
  const followers = stats.childFollowers.get(name) ?? new Set<string>();
  followers.add(next);
  stats.childFollowers.set(name, followers);
}

/** Topological order of children, or null when no single order fits. */
export function resolveChildOrder(stats: ElementStats): string[] | null {
  if (stats.hasInterleavedChildren) return null;

  const inDegree = new Map<string, number>();
  for (const name of stats.children.keys()) inDegree.set(name, 0);
  for (const followers of stats.childFollowers.values()) {
    for (const name of followers) inDegree.set(name, inDegree.get(name)! + 1);
  }

  const ready = [...inDegree.keys()].filter((name) => inDegree.get(name) === 0);
  const order: string[] = [];
  while (ready.length > 0) {
    const name = ready.shift()!;
    order.push(name);
    for (const next of stats.childFollowers.get(name) ?? []) {
      const remaining = inDegree.get(next)! - 1;
      inDegree.set(next, remaining);
      if (remaining === 0) ready.push(next);
    }
  }

  return order.length === stats.children.size ? order : null;
}
