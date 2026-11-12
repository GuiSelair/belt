import { describe, expect, it } from 'vitest';

import { validateXml } from './validateXml';

describe('validateXml', () => {
  it('reports mismatched tags with line and column', () => {
    expect(validateXml('<a>\n  <b></a>')).toMatchObject({
      ok: false,
      error: {
        line: 2,
        message: expect.stringContaining("Expected closing tag 'b'"),
      },
    });
  });

  it('rejects more than one root element at the second root', () => {
    expect(validateXml('<a/>\n<b/>')).toMatchObject({
      ok: false,
      error: { line: 2, column: 1, offset: 5 },
    });
  });

  it('summarizes a valid document', () => {
    const result = validateXml(
      '<?xml version="1.0"?>\n<!-- c --><root xmlns="urn:a" xmlns:x="urn:x"><x:item><name>A</name></x:item><item/></root>',
    );

    expect(result).toEqual({
      ok: true,
      summary: {
        rootElement: 'root',
        elementCount: 4,
        maxDepth: 3,
        namespaces: [
          { prefix: null, uri: 'urn:a' },
          { prefix: 'x', uri: 'urn:x' },
        ],
      },
    });
  });
});
