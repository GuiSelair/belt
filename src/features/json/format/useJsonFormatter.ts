'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import type { CodeEditorHandle } from '@/components/editor/CodeEditor';
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
  const [input, setInput] = useState(sample);
  const [request, setRequest] = useState<FormatJsonRequest | null>(null);
  const inputEditorRef = useRef<CodeEditorHandle>(null);

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

  const handleRun = useCallback(() => {
    setRequest({ text: input, indent });
  }, [input, indent]);
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
    output,
    canRun: input.trim() !== '',
    isStale: syntaxError !== null && output !== '',
    isProcessingInWorker: isPending && request !== null && isLargeJson(request),
    syntaxError,
    taskError,
    diagnostics,
    inputEditorRef,
    handleRun,
    handleClear,
    handleGoToError,
  };
}

export type JsonFormatter = ReturnType<typeof useJsonFormatter>;
