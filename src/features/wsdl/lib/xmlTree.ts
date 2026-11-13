import {
  getAttributes,
  getChildren,
  getTagName,
  getTextContent,
  parseOrderedXml,
  type OrderedNode,
} from '@/features/xml/lib/xmlNodes';

const XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace';

export interface QName {
  ns: string | null;
  local: string;
}

export interface XmlElement {
  ns: string | null;
  local: string;
  attributes: Record<string, string>;
  /** In-scope namespace declarations, prefix (empty for default) to URI. */
  namespaces: ReadonlyMap<string, string>;
  children: XmlElement[];
  text: string;
}

function splitName(name: string): [prefix: string, local: string] {
  const separator = name.indexOf(':');
  return separator === -1
    ? ['', name]
    : [name.slice(0, separator), name.slice(separator + 1)];
}

function toElement(
  node: OrderedNode,
  inherited: ReadonlyMap<string, string>,
): XmlElement | null {
  const tagName = getTagName(node);
  if (!tagName) return null;

  const rawAttributes = getAttributes(node);
  const namespaces = new Map(inherited);
  const attributes: Record<string, string> = {};
  for (const [name, value] of Object.entries(rawAttributes)) {
    if (name === 'xmlns') namespaces.set('', value);
    else if (name.startsWith('xmlns:')) namespaces.set(name.slice(6), value);
    else attributes[name] = value;
  }

  const [prefix, local] = splitName(tagName);
  const children: XmlElement[] = [];
  let text = '';
  for (const child of getChildren(node)) {
    const element = toElement(child, namespaces);
    if (element) children.push(element);
    else text += getTextContent(child) ?? '';
  }

  return {
    ns: namespaces.get(prefix) ?? null,
    local,
    attributes,
    namespaces,
    children,
    text: text.trim(),
  };
}

export function parseXmlTree(text: string): XmlElement | null {
  for (const node of parseOrderedXml(text)) {
    const element = toElement(node, new Map([['xml', XML_NAMESPACE]]));
    if (element) return element;
  }
  return null;
}

/** Resolves a QName attribute value (`tns:Order`) in the element's scope. */
export function resolveQName(element: XmlElement, value: string): QName {
  const [prefix, local] = splitName(value.trim());
  return { ns: element.namespaces.get(prefix) ?? null, local };
}

export function qnameKey({ ns, local }: QName) {
  return `{${ns ?? ''}}${local}`;
}

export function childrenOf(element: XmlElement, ns: string, local?: string) {
  return element.children.filter(
    (child) =>
      child.ns === ns && (local === undefined || child.local === local),
  );
}

export function childOf(element: XmlElement, ns: string, local: string) {
  return childrenOf(element, ns, local)[0];
}
