'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import type { CodeEditorHandle } from '@/components/editor/CodeEditor';
import { toIndentUnit, type IndentOption } from '@/lib/indentation';
import { useLastValue } from '@/lib/useLastValue';
import { useLatestTask } from '@/lib/useLatestTask';
import { createTask } from '@/tasks/createTask';

import type { BeautifyXmlRequest } from '../lib/beautifyXmlDocument';
import { XML_SAMPLE, toXmlDiagnostic } from '../xmlShared';

const beautifyXmlTask = createTask('beautifyXml');

const NO_NOTICES: string[] = [];

export function useXmlBeautifyScreen() {
  const [input, setInput] = useState(XML_SAMPLE);
  const [indent, setIndent] = useState<IndentOption>('2');
  const [request, setRequest] = useState<BeautifyXmlRequest | null>(null);
  const inputEditorRef = useRef<CodeEditorHandle>(null);

  const { outcome, isPending } = useLatestTask(beautifyXmlTask, request);

  const result = outcome?.ok ? outcome.result : null;
  const taskError = outcome && !outcome.ok ? outcome.error : null;
  const syntaxError = result && !result.ok ? result.error : null;
  const freshOutput =
    request === null ? '' : result?.ok ? result.output : undefined;
  const output = useLastValue(freshOutput, '');
  const notices = result?.ok ? result.notices : NO_NOTICES;

  const diagnostics = useMemo(
    () => (syntaxError ? [toXmlDiagnostic(syntaxError)] : []),
    [syntaxError],
  );

  const handleRun = useCallback(() => {
    setRequest({ text: input, indent: toIndentUnit(indent) });
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
    indent,
    setIndent,
    inputEditorRef,
    diagnostics,
    output,
    notices,
    canRun: input.trim() !== '',
    isStale: syntaxError !== null && output !== '',
    isRunning: isPending,
    syntaxError,
    taskError,
    handleRun,
    handleGoToError,
    handleClear,
  };
}
