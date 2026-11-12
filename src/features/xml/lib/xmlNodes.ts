import { XMLParser } from 'fast-xml-parser';

export const ATTRIBUTES_KEY = ':@';
export const TEXT_KEY = '#text';
export const COMMENT_KEY = '#comment';
export const CDATA_KEY = '#cdata';

const MAX_NESTED_TAGS = 1000;

/** A node of fast-xml-parser's `preserveOrder` output. */
export type OrderedNode = Record<string, unknown>;

interface ParseOptions {
  trimValues?: boolean;
  captureMetaData?: boolean;
}

export const orderedParserOptions = {
  preserveOrder: true,
  ignoreAttributes: false,
  attributeNamePrefix: '',
  commentPropName: COMMENT_KEY,
  cdataPropName: CDATA_KEY,
  parseTagValue: false,
  parseAttributeValue: false,
  maxNestedTags: MAX_NESTED_TAGS,
} as const;

export function parseOrderedXml(
  text: string,
  { trimValues = true, captureMetaData = false }: ParseOptions = {},
): OrderedNode[] {
  const parser = new XMLParser({
    ...orderedParserOptions,
    trimValues,
    captureMetaData,
  });
  return parser.parse(text) as OrderedNode[];
}

export function getTagName(node: OrderedNode): string | null {
  for (const key of Object.keys(node)) {
    if (key === ATTRIBUTES_KEY) continue;
    if (key.startsWith('#') || key.startsWith('?')) return null;
    return key;
  }
  return null;
}

export function getChildren(node: OrderedNode): OrderedNode[] {
  const tagName = getTagName(node);
  return tagName ? ((node[tagName] as OrderedNode[]) ?? []) : [];
}

export function getAttributes(node: OrderedNode): Record<string, string> {
  return (node[ATTRIBUTES_KEY] as Record<string, string> | undefined) ?? {};
}

export function getElementChildren(node: OrderedNode): OrderedNode[] {
  return getChildren(node).filter((child) => getTagName(child) !== null);
}

export function getTextContent(node: OrderedNode): string | null {
  if (TEXT_KEY in node) return String(node[TEXT_KEY]);
  if (CDATA_KEY in node) {
    const cdata = node[CDATA_KEY] as OrderedNode[];
    return cdata.map((part) => String(part[TEXT_KEY] ?? '')).join('');
  }
  return null;
}

export function getStartOffset(node: OrderedNode): number | undefined {
  const metadata = (node as Record<symbol, { startIndex?: number }>)[
    XMLParser.getMetaDataSymbol() as symbol
  ];
  return metadata?.startIndex;
}
