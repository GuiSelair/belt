import type { Plugin } from 'prettier';

import { lineColumnToOffset } from '@/lib/textPosition';

import type { JsxFormatOptions } from './formatOptions';

export interface FormatJsxRequest {
  code: string;
  options: JsxFormatOptions;
}

export interface JsxSyntaxError {
  message: string;
  line: number;
  column: number;
  offset: number;
}

export type FormatJsxResult =
  { ok: true; output: string } | { ok: false; error: JsxSyntaxError };

interface PrettierSyntaxError {
  message: string;
  loc?: { start: { line: number; column: number } };
  cause?: { reasonCode?: string };
}

const UNWRAPPED_ELEMENTS_MESSAGE =
  'Adjacent JSX elements need a single root element or a fragment (<>…</>) wrapping them.';

let prettierPromise: ReturnType<typeof loadPrettier> | null = null;
let typescriptPluginPromise: Promise<Plugin> | null = null;

async function loadPrettier() {
  const [prettier, babel, estree] = await Promise.all([
    import('prettier/standalone'),
    import('prettier/plugins/babel'),
    import('prettier/plugins/estree'),
  ]);
  return { format: prettier.format, plugins: [babel, estree] as Plugin[] };
}

function loadTypescriptPlugin() {
  typescriptPluginPromise ??= import('prettier/plugins/typescript');
  return typescriptPluginPromise;
}

function isPrettierSyntaxError(error: unknown): error is PrettierSyntaxError {
  return error instanceof Error && 'loc' in error;
}

function toSyntaxError(
  code: string,
  error: PrettierSyntaxError,
): JsxSyntaxError {
  const { line, column } = error.loc?.start ?? { line: 1, column: 1 };
  const firstLine = error.message.split('\n')[0].replace(/\s*\(\d+:\d+\)$/, '');
  const isUnwrapped =
    error.cause?.reasonCode === 'UnwrappedAdjacentJSXElements';
  return {
    message: isUnwrapped ? UNWRAPPED_ELEMENTS_MESSAGE : firstLine,
    line,
    column,
    offset: lineColumnToOffset(code, line, column),
  };
}

export async function formatJsx({
  code,
  options,
}: FormatJsxRequest): Promise<FormatJsxResult> {
  if (code.trim() === '') return { ok: true, output: '' };

  prettierPromise ??= loadPrettier();
  const { format, plugins } = await prettierPromise;
  const { typescript, ...prettierOptions } = options;
  const allPlugins = typescript
    ? [...plugins, await loadTypescriptPlugin()]
    : plugins;

  try {
    const output = await format(code, {
      ...prettierOptions,
      parser: typescript ? 'typescript' : 'babel',
      plugins: allPlugins,
    });
    return { ok: true, output };
  } catch (error) {
    if (isPrettierSyntaxError(error)) {
      return { ok: false, error: toSyntaxError(code, error) };
    }
    throw error;
  }
}
