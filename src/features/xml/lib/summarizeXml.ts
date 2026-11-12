import {
  getAttributes,
  getElementChildren,
  getTagName,
  type OrderedNode,
} from './xmlNodes';

export interface XmlNamespace {
  prefix: string | null;
  uri: string;
}

export interface XmlSummary {
  rootElement: string;
  elementCount: number;
  maxDepth: number;
  namespaces: XmlNamespace[];
}

function collectNamespaces(
  attributes: Record<string, string>,
  namespaces: Map<string, XmlNamespace>,
) {
  for (const [name, uri] of Object.entries(attributes)) {
    if (name !== 'xmlns' && !name.startsWith('xmlns:')) continue;
    const prefix = name === 'xmlns' ? null : name.slice('xmlns:'.length);
    namespaces.set(`${prefix}|${uri}`, { prefix, uri });
  }
}

export function summarizeXml(root: OrderedNode): XmlSummary {
  const namespaces = new Map<string, XmlNamespace>();
  let elementCount = 0;
  let maxDepth = 0;

  function visit(node: OrderedNode, depth: number) {
    elementCount++;
    maxDepth = Math.max(maxDepth, depth);
    collectNamespaces(getAttributes(node), namespaces);
    for (const child of getElementChildren(node)) visit(child, depth + 1);
  }

  visit(root, 1);

  return {
    rootElement: getTagName(root) ?? '',
    elementCount,
    maxDepth,
    namespaces: [...namespaces.values()],
  };
}
