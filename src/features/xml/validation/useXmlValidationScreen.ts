'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import type { CodeEditorHandle } from '@/components/editor/CodeEditor';

import { validateXml } from '../lib/validateXml';
import { XML_SAMPLE, toXmlDiagnostic } from '../xmlShared';

export function useXmlValidationScreen() {
  const [input, setInput] = useState(XML_SAMPLE);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const inputEditorRef = useRef<CodeEditorHandle>(null);

  const validation = useMemo(
    () => (submitted === null ? null : validateXml(submitted)),
    [submitted],
  );
  const syntaxError = validation && !validation.ok ? validation.error : null;
  const summary = validation?.ok ? validation.summary : null;

  const diagnostics = useMemo(
    () => (syntaxError ? [toXmlDiagnostic(syntaxError)] : []),
    [syntaxError],
  );

  const handleRun = useCallback(() => setSubmitted(input), [input]);
  const handleClear = useCallback(() => {
    setInput('');
    setSubmitted(null);
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
    hasRun: submitted !== null,
    summary,
    syntaxError,
    handleRun,
    handleGoToError,
    handleClear,
  };
}
