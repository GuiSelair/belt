'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import type { CodeEditorHandle } from '@/components/editor/CodeEditor';
import type { SelectOption } from '@/components/form/SelectField';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { useLastValue } from '@/lib/useLastValue';
import { useLatestTask } from '@/lib/useLatestTask';
import {
  useWorkerTask,
  type WorkerTaskOptions,
} from '@/lib/worker/useWorkerTask';

import {
  formatJson,
  type FormatJsonRequest,
  type FormatJsonResult,
} from '../lib/formatJson';
import { JSON_SAMPLE, isLargeJson, toDiagnostic } from '../jsonShared';

type IndentOption = '2' | '4' | 'tab';
type OutputMode = 'beautify' | 'minify';

const INDENTS: Record<IndentOption, string> = {
  '2': '  ',
  '4': '    ',
  tab: '\t',
};

export const indentOptions: SelectOption<IndentOption>[] = [
  { value: '2', label: '2 spaces' },
  { value: '4', label: '4 spaces' },
  { value: 'tab', label: 'Tab' },
];

export const outputModeOptions: SelectOption<OutputMode>[] = [
  { value: 'beautify', label: 'Beautify' },
  { value: 'minify', label: 'Minify' },
];

function createFormatWorker() {
  return new Worker(
    new URL('../workers/formatJson.worker.ts', import.meta.url),
    { type: 'module' },
  );
}

const workerOptions: WorkerTaskOptions<FormatJsonRequest, FormatJsonResult> = {
  inline: { when: (request) => !isLargeJson(request), run: formatJson },
};

export function useJsonBeautifyScreen() {
  const [input, setInput] = useState('');
  const [indent, setIndent] = useState<IndentOption>('2');
  const [mode, setMode] = useState<OutputMode>('beautify');
  const [sortKeys, setSortKeys] = useState(false);
  const inputEditorRef = useRef<CodeEditorHandle>(null);
  const debouncedInput = useDebouncedValue(input);

  const request = useMemo<FormatJsonRequest | null>(() => {
    if (input.trim() === '' || debouncedInput.trim() === '') return null;
    return {
      text: debouncedInput,
      indent: mode === 'minify' ? '' : INDENTS[indent],
      sortKeys,
    };
  }, [input, debouncedInput, mode, indent, sortKeys]);

  const runFormat = useWorkerTask(createFormatWorker, workerOptions);
  const { outcome, isPending } = useLatestTask(runFormat, request);

  const result = outcome?.ok ? outcome.result : null;
  const taskError = outcome && !outcome.ok ? outcome.error : null;
  const syntaxError = result && !result.ok ? result.error : null;
  const freshOutput =
    request === null ? '' : result?.ok ? result.output : undefined;
  const output = useLastValue(freshOutput, '');

  const diagnostics = useMemo(
    () => (syntaxError ? [toDiagnostic(syntaxError, 'error')] : []),
    [syntaxError],
  );

  const handleLoadSample = useCallback(() => setInput(JSON_SAMPLE), []);
  const handleClear = useCallback(() => setInput(''), []);
  const handleGoToError = useCallback(() => {
    if (syntaxError) inputEditorRef.current?.focusAt(syntaxError.offset);
  }, [syntaxError]);

  return {
    input,
    setInput,
    indent,
    setIndent,
    mode,
    setMode,
    sortKeys,
    setSortKeys,
    output,
    isStale: syntaxError !== null && output !== '',
    isProcessingInWorker: isPending && request !== null && isLargeJson(request),
    syntaxError,
    taskError,
    diagnostics,
    inputEditorRef,
    handleLoadSample,
    handleClear,
    handleGoToError,
  };
}
