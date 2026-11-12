import { describe, expect, it } from 'vitest';

import { defaultJsxFormatOptions } from './formatOptions';
import { formatJsx } from './formatJsx';

async function format(code: string, overrides = {}) {
  const result = await formatJsx({
    code,
    options: { ...defaultJsxFormatOptions, ...overrides },
  });
  if (!result.ok) throw new Error(result.error.message);
  return result.output;
}

describe('formatJsx', () => {
  it('formats a one-line component with Prettier defaults', async () => {
    expect(
      await format('const A=()=><div className="x"><span>hi</span></div>'),
    ).toBe(
      'const A = () => (\n  <div className="x">\n    <span>hi</span>\n  </div>\n);\n',
    );
  });

  it('applies quote and semicolon options', async () => {
    expect(
      await format('const a = "x"; const b = <i title="y" />', {
        singleQuote: true,
        jsxSingleQuote: true,
        semi: false,
      }),
    ).toBe("const a = 'x'\nconst b = <i title='y' />\n");
  });

  it('parses TSX when TypeScript is enabled', async () => {
    expect(
      await format('const A = (p: {n: number}) => <b>{p.n}</b>', {
        typescript: true,
      }),
    ).toBe('const A = (p: { n: number }) => <b>{p.n}</b>;\n');
  });

  it('explains that sibling elements need a wrapper', async () => {
    const result = await formatJsx({
      code: '<div></div><span></span>',
      options: defaultJsxFormatOptions,
    });

    expect(result).toMatchObject({
      ok: false,
      error: {
        line: 1,
        column: 12,
        offset: 11,
        message: expect.stringMatching(/single root element or a fragment/),
      },
    });
  });

  it('reports syntax errors with their position', async () => {
    const result = await formatJsx({
      code: 'const a = 1;\nconst b = <div>',
      options: defaultJsxFormatOptions,
    });

    expect(result).toMatchObject({ ok: false, error: { line: 2 } });
  });

  it('returns empty output for empty input', async () => {
    expect(await format('   ')).toBe('');
  });
});
