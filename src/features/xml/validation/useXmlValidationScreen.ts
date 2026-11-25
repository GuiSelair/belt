'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import type { CodeEditorHandle } from '@/components/editor/CodeEditor';
import { useLatestTask } from '@/lib/useLatestTask';
import { createTask } from '@/tasks/createTask';

import { XML_SAMPLE, toXmlDiagnostic } from '../xmlShared';

const validateXmlTask = createTask('validateXml');

export function useXmlValidationScreen() {
  const [input, setInput] = useState(XML_SAMPLE);
  const [request, setRequest] = useState<string | null>(null);
  const inputEditorRef = useRef<CodeEditorHandle>(null);

  const { outcome, isPending } = useLatestTask(validateXmlTask, request);

  const result = outcome?.ok ? outcome.result : null;
  const taskError = outcome && !outcome.ok ? outcome.error : null;
  const syntaxError = result && !result.ok ? result.error : null;
  const summary = result?.ok ? result.summary : null;

  const diagnostics = useMemo(
    () => (syntaxError ? [toXmlDiagnostic(syntaxError)] : []),
    [syntaxError],
  );

  const handleRun = useCallback(() => setRequest(input), [input]);
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
    inputEditorRef,
    diagnostics,
    canRun: input.trim() !== '',
    hasRun: request !== null,
    isRunning: isPending,
    summary,
    syntaxError,
    taskError,
    handleRun,
    handleGoToError,
    handleClear,
  };
}
