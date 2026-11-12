import { describe, expect, it } from 'vitest';

import { beautifyXml } from './beautifyXml';

describe('beautifyXml', () => {
  it('indents while preserving the prolog, comments, CDATA and entities', () => {
    const result = beautifyXml(
      '<?xml version="1.0"?><!--c--><r a="x &amp; y"><t>&lt;b&gt;</t><e/><![CDATA[<raw>]]></r>',
      '  ',
    );

    expect(result).toEqual({
      output:
        '<?xml version="1.0"?>\n<!--c-->\n<r a="x &amp; y">\n  <t>&lt;b&gt;</t>\n  <e/>\n  <![CDATA[<raw>]]>\n</r>',
      notices: [],
    });
  });

  it('warns when processing instruction contents may be dropped', () => {
    expect(beautifyXml('<r><?pi data?></r>', '  ').notices).toHaveLength(1);
  });
});
