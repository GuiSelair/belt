import {
  createElementStats,
  recordAttribute,
  recordFollower,
  type ElementStats,
} from './elementStats';
import { mergeSimpleTypes } from './simpleTypes';

function mergeInto(target: ElementStats, source: ElementStats) {
  target.occurrences += source.occurrences;
  target.textType = mergeSimpleTypes(target.textType, source.textType);
  target.hasText ||= source.hasText;
  target.hasInterleavedChildren ||= source.hasInterleavedChildren;

  for (const [name, attribute] of source.attributes) {
    recordAttribute(target, name, attribute.type, attribute.count);
  }
  for (const [name, child] of source.children) {
    const existing = target.children.get(name);
    if (!existing) {
      target.children.set(name, { ...child });
      continue;
    }
    existing.parentsWithChild += child.parentsWithChild;
    existing.maxPerParent = Math.max(existing.maxPerParent, child.maxPerParent);
  }
  for (const [name, followers] of source.childFollowers) {
    for (const next of followers) recordFollower(target, name, next);
  }
}

/** Global declarations for the salami-slice style, in document order. */
export function mergeElementsByName(root: ElementStats): ElementStats[] {
  const merged = new Map<string, ElementStats>();

  function visit(stats: ElementStats) {
    const target = merged.get(stats.name) ?? createElementStats(stats.name);
    merged.set(stats.name, target);
    mergeInto(target, stats);
    for (const child of stats.children.values()) visit(child.element);
  }

  visit(root);
  return [...merged.values()];
}
