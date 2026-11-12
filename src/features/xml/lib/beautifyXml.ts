import Builder from 'fast-xml-builder';

import { orderedParserOptions, parseOrderedXml } from './xmlNodes';

export interface BeautifyXmlResult {
  output: string;
  notices: string[];
}

const PROCESSING_INSTRUCTION_WITH_DATA = /<\?(?!xml[\s?])[\w.-]+\s+[^?\s]/;

export function beautifyXml(text: string, indent: string): BeautifyXmlResult {
  const builder = new Builder({
    ...orderedParserOptions,
    format: true,
    indentBy: indent,
    suppressEmptyNode: true,
  });
  const output = builder.build(parseOrderedXml(text)).trim();
  const notices = PROCESSING_INSTRUCTION_WITH_DATA.test(text)
    ? [
        'Processing instructions other than the XML declaration keep only their target name; their contents are not preserved.',
      ]
    : [];

  return { output, notices };
}
