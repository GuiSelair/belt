import { beautifyXml } from './beautifyXml';
import { validateXml, type XmlSyntaxError } from './validateXml';

export interface BeautifyXmlRequest {
  text: string;
  indent: string;
}

export type BeautifyXmlDocumentResult =
  | { ok: true; output: string; notices: string[] }
  | { ok: false; error: XmlSyntaxError };

export function beautifyXmlDocument({
  text,
  indent,
}: BeautifyXmlRequest): BeautifyXmlDocumentResult {
  const validation = validateXml(text);
  if (!validation.ok) return validation;
  return { ok: true, ...beautifyXml(text, indent) };
}
