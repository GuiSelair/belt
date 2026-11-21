'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import type { CodeEditorHandle } from '@/components/editor/CodeEditor';
import { useLatestTask } from '@/lib/useLatestTask';
import { createTask } from '@/tasks/createTask';

import type { JsonPositionedMessage } from '../lib/types';
import { JSON_SAMPLE, toDiagnostic } from '../jsonShared';

const validateJsonTask = createTask('validateJson');

const NO_WARNINGS: JsonPositionedMessage[] = [];

export function useJsonValidationScreen() {
  const [input, setInput] = useState(JSON_SAMPLE);
  const [request, setRequest] = useState<string | null>(null);
  const inputEditorRef = useRef<CodeEditorHandle>(null);

  const { outcome, isPending } = useLatestTask(validateJsonTask, request);

  const result = outcome?.ok ? outcome.result : null;
  const taskError = outcome && !outcome.ok ? outcome.error : null;
  const syntaxError = result && !result.ok ? result.error : null;
  const summary = result?.ok ? result.summary : null;
  const warnings = result?.ok ? result.warnings : NO_WARNINGS;

  const diagnostics = useMemo(() => {
    if (syntaxError) return [toDiagnostic(syntaxError, 'error')];
    return warnings.map((warning) => toDiagnostic(warning, 'warning'));
  }, [syntaxError, warnings]);

  const goTo = useCallback((offset: number) => {
    inputEditorRef.current?.focusAt(offset);
  }, []);

  const handleGoToError = useCallback(() => {
    if (syntaxError) goTo(syntaxError.offset);
  }, [goTo, syntaxError]);

  const handleRun = useCallback(() => setRequest(input), [input]);
  const handleClear = useCallback(() => {
    setInput('');
    setRequest(null);
  }, []);

  return {
    input,
    setInput,
    inputEditorRef,
    diagnostics,
    canRun: input.trim() !== '',
    hasRun: request !== null,
    isRunning: isPending,
    summary,
    warnings,
    syntaxError,
    taskError,
    goTo,
    handleGoToError,
    handleRun,
    handleClear,
  };
}
