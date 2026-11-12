'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import type { CodeEditorHandle } from '@/components/editor/CodeEditor';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

import { validateXml } from '../lib/validateXml';
import { XML_SAMPLE, toXmlDiagnostic } from '../xmlShared';

export function useXmlValidationScreen() {
  const [input, setInput] = useState('');
  const inputEditorRef = useRef<CodeEditorHandle>(null);
  const debouncedInput = useDebouncedValue(input);
  const isEmpty = input.trim() === '' || debouncedInput.trim() === '';

  const validation = useMemo(
    () => (isEmpty ? null : validateXml(debouncedInput)),
    [isEmpty, debouncedInput],
  );
  const syntaxError = validation && !validation.ok ? validation.error : null;
  const summary = validation?.ok ? validation.summary : null;

  const diagnostics = useMemo(
    () => (syntaxError ? [toXmlDiagnostic(syntaxError)] : []),
    [syntaxError],
  );

  const handleGoToError = useCallback(() => {
    if (syntaxError) inputEditorRef.current?.focusAt(syntaxError.offset);
  }, [syntaxError]);

  const handleLoadSample = useCallback(() => setInput(XML_SAMPLE), []);
  const handleClear = useCallback(() => setInput(''), []);

  return {
    input,
    setInput,
    inputEditorRef,
    diagnostics,
    isEmpty,
    summary,
    syntaxError,
    handleGoToError,
    handleLoadSample,
    handleClear,
  };
}
