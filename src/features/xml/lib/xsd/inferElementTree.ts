import {
  getAttributes,
  getChildren,
  getTagName,
  getTextContent,
  type OrderedNode,
} from '../xmlNodes';
import {
  createElementStats,
  recordAttribute,
  recordFollower,
  type ChildStats,
  type ElementStats,
} from './elementStats';
import { detectSimpleType, mergeSimpleTypes } from './simpleTypes';

export interface ElementTree {
  root: ElementStats;
  targetNamespace: string | null;
}

export const PREFIXED_ELEMENT_NOTICE =
  'Prefixed element names were declared by their local name: only the ' +
  'default namespace is mapped to the schema.';
export const PREFIXED_ATTRIBUTE_NOTICE =
  'Prefixed attributes (such as xsi:schemaLocation) were left out: only ' +
  'the default namespace is mapped to the schema.';
export const NESTED_NAMESPACE_NOTICE =
  'Default namespaces redeclared below the root element are not mapped: ' +
  'the root namespace was used for every element.';

interface InferContext {
  notices: Set<string>;
  targetNamespace: string | null;
}

function toLocalName(tagName: string, context: InferContext) {
  const separator = tagName.indexOf(':');
  if (separator === -1) return tagName;
  context.notices.add(PREFIXED_ELEMENT_NOTICE);
  return tagName.slice(separator + 1);
}

function recordAttributes(
  stats: ElementStats,
  node: OrderedNode,
  context: InferContext,
) {
  for (const [name, value] of Object.entries(getAttributes(node))) {
    if (name === 'xmlns') {
      if (value !== context.targetNamespace) {
        context.notices.add(NESTED_NAMESPACE_NOTICE);
      }
      continue;
    }
    if (name.startsWith('xmlns:')) continue;
    if (name.includes(':')) {
      context.notices.add(PREFIXED_ATTRIBUTE_NOTICE);
      continue;
    }
    recordAttribute(stats, name, detectSimpleType(String(value)));
  }
}

function getOrCreateChild(stats: ElementStats, name: string): ChildStats {
  const existing = stats.children.get(name);
  if (existing) return existing;
  const child = {
    element: createElementStats(name),
    parentsWithChild: 0,
    maxPerParent: 0,
  };
  stats.children.set(name, child);
  return child;
}

function recordChildOrder(stats: ElementStats, childNames: string[]) {
  const runs = childNames.filter(
    (name, index) => name !== childNames[index - 1],
  );
  if (new Set(runs).size !== runs.length) stats.hasInterleavedChildren = true;
  for (let index = 1; index < runs.length; index += 1) {
    recordFollower(stats, runs[index - 1], runs[index]);
  }
}

function recordOccurrence(
  stats: ElementStats,
  node: OrderedNode,
  context: InferContext,
) {
  stats.occurrences += 1;
  recordAttributes(stats, node, context);

  const textParts: string[] = [];
  const childNames: string[] = [];
  const childCounts = new Map<string, number>();

  for (const child of getChildren(node)) {
    const tagName = getTagName(child);
    if (tagName === null) {
      const text = getTextContent(child);
      if (text) textParts.push(text);
      continue;
    }
    const name = toLocalName(tagName, context);
    childNames.push(name);
    childCounts.set(name, (childCounts.get(name) ?? 0) + 1);
    recordOccurrence(getOrCreateChild(stats, name).element, child, context);
  }

  const text = textParts.join('');
  if (text !== '') stats.hasText = true;
  if (childNames.length === 0) {
    stats.textType = mergeSimpleTypes(stats.textType, detectSimpleType(text));
  }

  for (const [name, count] of childCounts) {
    const child = stats.children.get(name)!;
    child.parentsWithChild += 1;
    child.maxPerParent = Math.max(child.maxPerParent, count);
  }
  recordChildOrder(stats, childNames);
}

export function inferElementTree(
  rootNode: OrderedNode,
  notices: Set<string>,
): ElementTree {
  const namespace = getAttributes(rootNode).xmlns;
  const context: InferContext = {
    notices,
    targetNamespace: namespace ? String(namespace) : null,
  };
  const root = createElementStats(toLocalName(getTagName(rootNode)!, context));
  recordOccurrence(root, rootNode, context);
  return { root, targetNamespace: context.targetNamespace };
}
