import type { EditorDiagnostic } from '@/components/editor/CodeEditor';

import type { XmlSyntaxError } from './lib/validateXml';

export const XML_SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<library xmlns="urn:belt:library" updated="2026-11-12T09:30:00Z">
  <!-- Books available in the shelf -->
  <book id="1" available="true">
    <title>Refactoring</title>
    <author>Martin Fowler</author>
    <author>Kent Beck</author>
    <price currency="USD">47.99</price>
    <published>2018-11-20</published>
  </book>
  <book id="2" available="false">
    <title>Clean Architecture</title>
    <author>Robert C. Martin</author>
    <price currency="USD">34.50</price>
    <edition>1</edition>
  </book>
</library>`;

export function toXmlDiagnostic(error: XmlSyntaxError): EditorDiagnostic {
  return {
    from: error.offset,
    to: error.offset + 1,
    severity: 'error',
    message: error.message,
  };
}
