'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import type { CodeEditorHandle } from '@/components/editor/CodeEditor';
import { useLastValue } from '@/lib/useLastValue';
import { useLatestTask } from '@/lib/useLatestTask';
import { createTask } from '@/tasks/createTask';

import type { FormatJsonRequest } from '../lib/formatJson';
import { JSON_SAMPLE, toDiagnostic } from '../jsonShared';

const formatJsonTask = createTask('formatJson');

/** `indent` is the indentation unit; an empty string minifies. */
export function useJsonFormatter(indent: string, sample = JSON_SAMPLE) {
  const [input, setInput] = useState(sample);
  const [request, setRequest] = useState<FormatJsonRequest | null>(null);
  const inputEditorRef = useRef<CodeEditorHandle>(null);

  const { outcome, isPending } = useLatestTask(formatJsonTask, request);

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
    isRunning: isPending,
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
