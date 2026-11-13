'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import type { CodeEditorHandle } from '@/components/editor/CodeEditor';
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

function createFormatWorker() {
  return new Worker(
    new URL('../workers/formatJson.worker.ts', import.meta.url),
    { type: 'module' },
  );
}

const workerOptions: WorkerTaskOptions<FormatJsonRequest, FormatJsonResult> = {
  inline: { when: (request) => !isLargeJson(request), run: formatJson },
};

/** `indent` is the indentation unit; an empty string minifies. */
export function useJsonFormatter(indent: string, sample = JSON_SAMPLE) {
  const [input, setInput] = useState('');
  const inputEditorRef = useRef<CodeEditorHandle>(null);
  const debouncedInput = useDebouncedValue(input);

  const request = useMemo<FormatJsonRequest | null>(() => {
    if (input.trim() === '' || debouncedInput.trim() === '') return null;
    return { text: debouncedInput, indent };
  }, [input, debouncedInput, indent]);

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

  const handleLoadSample = useCallback(() => setInput(sample), [sample]);
  const handleClear = useCallback(() => setInput(''), []);
  const handleGoToError = useCallback(() => {
    if (syntaxError) inputEditorRef.current?.focusAt(syntaxError.offset);
  }, [syntaxError]);

  return {
    input,
    setInput,
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

export type JsonFormatter = ReturnType<typeof useJsonFormatter>;
