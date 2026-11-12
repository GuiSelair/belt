import {
  findRootElements,
  validateXml,
  type XmlSyntaxError,
} from '../validateXml';
import { parseOrderedXml } from '../xmlNodes';
import { inferElementTree } from './inferElementTree';
import { writeXsd, type XsdOptions } from './writeXsd';

export interface GenerateXsdRequest extends XsdOptions {
  text: string;
}

export type GenerateXsdResult =
  | { ok: true; xsd: string; notices: string[] }
  | { ok: false; error: XmlSyntaxError };

export function generateXsd({
  text,
  ...options
}: GenerateXsdRequest): GenerateXsdResult {
  const validation = validateXml(text);
  if (!validation.ok) return validation;

  const [rootNode] = findRootElements(parseOrderedXml(text));
  const notices = new Set<string>();
  const tree = inferElementTree(rootNode, notices);
  const xsd = writeXsd(tree, options, notices);

  return { ok: true, xsd, notices: [...notices] };
}
