import { describe, expect, it } from 'vitest';

import { beautifyXmlDocument } from './beautifyXmlDocument';

describe('beautifyXmlDocument', () => {
  it('formats well-formed XML', () => {
    expect(beautifyXmlDocument({ text: '<r><t/></r>', indent: '  ' })).toEqual({
      ok: true,
      output: '<r>\n  <t/>\n</r>',
      notices: [],
    });
  });

  it('returns the syntax error instead of formatting malformed XML', () => {
    const result = beautifyXmlDocument({ text: '<r><t></r>', indent: '  ' });

    expect(result.ok).toBe(false);
  });
});
