'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import type { CodeEditorHandle } from '@/components/editor/CodeEditor';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { useLatestTask } from '@/lib/useLatestTask';
import {
  useWorkerTask,
  type WorkerTaskOptions,
} from '@/lib/worker/useWorkerTask';

import type { JsonPositionedMessage } from '../lib/types';
import { validateJson, type ValidateJsonResult } from '../lib/validateJson';
import { JSON_SAMPLE, isLargeJson, toDiagnostic } from '../jsonShared';

function createValidateWorker() {
  return new Worker(
    new URL('../workers/validateJson.worker.ts', import.meta.url),
    { type: 'module' },
  );
}

const workerOptions: WorkerTaskOptions<string, ValidateJsonResult> = {
  inline: { when: (text) => !isLargeJson({ text }), run: validateJson },
};

const NO_WARNINGS: JsonPositionedMessage[] = [];

export function useJsonValidationScreen() {
  const [input, setInput] = useState('');
  const inputEditorRef = useRef<CodeEditorHandle>(null);
  const debouncedInput = useDebouncedValue(input);
  const request =
    input.trim() === '' || debouncedInput.trim() === '' ? null : debouncedInput;

  const runValidation = useWorkerTask(createValidateWorker, workerOptions);
  const { outcome, isPending } = useLatestTask(runValidation, request);

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

  const handleLoadSample = useCallback(() => setInput(JSON_SAMPLE), []);
  const handleClear = useCallback(() => setInput(''), []);

  return {
    input,
    setInput,
    inputEditorRef,
    diagnostics,
    isEmpty: request === null,
    isValidating: isPending && outcome === null,
    summary,
    warnings,
    syntaxError,
    taskError,
    goTo,
    handleGoToError,
    handleLoadSample,
    handleClear,
  };
}
