'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import type {
  CodeEditorHandle,
  EditorDiagnostic,
} from '@/components/editor/CodeEditor';
import type { SelectOption } from '@/components/form/SelectField';
import { useLastValue } from '@/lib/useLastValue';
import { useLatestTask } from '@/lib/useLatestTask';
import {
  useWorkerTask,
  type WorkerTaskOptions,
} from '@/lib/worker/useWorkerTask';

import type { FormatJsxRequest, FormatJsxResult } from './lib/formatJsx';
import {
  defaultJsxFormatOptions,
  type JsxBooleanOption,
  type JsxFormatOptions,
  type TrailingCommaOption,
} from './lib/formatOptions';

export const JSX_SAMPLE =
  'import {useState} from \'react\'\nexport function Counter({initial=0,label}){const [count,setCount]=useState(initial);return <section className="counter"><h2>{label}</h2><button type="button" onClick={()=>setCount(count+1)} aria-label={`Increment ${label}`}>Clicked {count} times</button>{count>10&&<p className=\'warning\'>That is a lot of clicks!</p>}</section>}';

export const printWidthOptions: SelectOption<string>[] = [
  { value: '80', label: '80' },
  { value: '100', label: '100' },
  { value: '120', label: '120' },
];

export const tabWidthOptions: SelectOption<string>[] = [
  { value: '2', label: '2' },
  { value: '4', label: '4' },
];

export const trailingCommaOptions: SelectOption<TrailingCommaOption>[] = [
  { value: 'all', label: 'All' },
  { value: 'es5', label: 'ES5' },
  { value: 'none', label: 'None' },
];

export const booleanOptions: { key: JsxBooleanOption; label: string }[] = [
  { key: 'typescript', label: 'TypeScript (TSX)' },
  { key: 'useTabs', label: 'Use tabs' },
  { key: 'singleQuote', label: 'Single quotes' },
  { key: 'jsxSingleQuote', label: 'JSX single quotes' },
  { key: 'semi', label: 'Semicolons' },
  { key: 'bracketSameLine', label: 'Bracket same line' },
];

const FORMAT_TIMEOUT_MS = 5000;

function createFormatWorker() {
  return new Worker(new URL('./workers/formatJsx.worker.ts', import.meta.url), {
    type: 'module',
  });
}

const workerOptions: WorkerTaskOptions<FormatJsxRequest, FormatJsxResult> = {
  timeoutMs: FORMAT_TIMEOUT_MS,
};

export function useJsxBeautifyScreen() {
  const [input, setInput] = useState(JSX_SAMPLE);
  const [options, setOptions] = useState(defaultJsxFormatOptions);
  const [request, setRequest] = useState<FormatJsxRequest | null>(null);
  const inputEditorRef = useRef<CodeEditorHandle>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const runFormat = useWorkerTask(createFormatWorker, workerOptions);
  const { outcome, isPending } = useLatestTask(runFormat, request);
  if (outcome && !hasLoadedOnce) setHasLoadedOnce(true);

  const result = outcome?.ok ? outcome.result : null;
  const taskError = outcome && !outcome.ok ? outcome.error : null;
  const syntaxError = result && !result.ok ? result.error : null;
  const freshOutput =
    request === null ? '' : result?.ok ? result.output : undefined;
  const output = useLastValue(freshOutput, '');

  const diagnostics = useMemo<EditorDiagnostic[]>(() => {
    if (!syntaxError) return [];
    return [
      {
        from: syntaxError.offset,
        to: syntaxError.offset + 1,
        severity: 'error',
        message: syntaxError.message,
      },
    ];
  }, [syntaxError]);

  const setOption = useCallback(
    <Key extends keyof JsxFormatOptions>(
      key: Key,
      value: JsxFormatOptions[Key],
    ) => {
      setOptions((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  const handlePrintWidthChange = useCallback(
    (value: string) => setOption('printWidth', Number(value)),
    [setOption],
  );
  const handleTabWidthChange = useCallback(
    (value: string) => setOption('tabWidth', Number(value)),
    [setOption],
  );
  const handleTrailingCommaChange = useCallback(
    (value: TrailingCommaOption) => setOption('trailingComma', value),
    [setOption],
  );
  const handleRun = useCallback(() => {
    setRequest({ code: input, options });
  }, [input, options]);
  const handleClear = useCallback(() => {
    setInput('');
    setRequest(null);
  }, []);
  const handleGoToError = useCallback(() => {
    if (syntaxError) inputEditorRef.current?.focusAt(syntaxError.offset);
  }, [syntaxError]);

  return {
    input,
    setInput,
    options,
    setOption,
    handlePrintWidthChange,
    handleTabWidthChange,
    handleTrailingCommaChange,
    output,
    canRun: input.trim() !== '',
    isStale: syntaxError !== null && output !== '',
    processingLabel: isPending
      ? hasLoadedOnce
        ? 'Formatting…'
        : 'Loading Prettier…'
      : null,
    syntaxError,
    taskError,
    diagnostics,
    inputEditorRef,
    handleRun,
    handleClear,
    handleGoToError,
  };
}
