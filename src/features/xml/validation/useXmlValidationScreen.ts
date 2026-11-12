'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import type { CodeEditorHandle } from '@/components/editor/CodeEditor';
import { toIndentUnit, type IndentOption } from '@/lib/indentation';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

import { beautifyXml, type BeautifyXmlResult } from '../lib/beautifyXml';
import { validateXml } from '../lib/validateXml';
import { XML_SAMPLE, toXmlDiagnostic } from '../xmlShared';

interface BeautifiedXml extends BeautifyXmlResult {
  source: string;
}

export function useXmlValidationScreen() {
  const [input, setInput] = useState('');
  const [indent, setIndent] = useState<IndentOption>('2');
  const [beautified, setBeautified] = useState<BeautifiedXml | null>(null);
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

  const handleBeautify = useCallback(() => {
    if (!validation?.ok) return;
    const result = beautifyXml(debouncedInput, toIndentUnit(indent));
    setBeautified({ ...result, source: debouncedInput });
  }, [validation, debouncedInput, indent]);

  const handleGoToError = useCallback(() => {
    if (syntaxError) inputEditorRef.current?.focusAt(syntaxError.offset);
  }, [syntaxError]);

  const handleLoadSample = useCallback(() => setInput(XML_SAMPLE), []);
  const handleClear = useCallback(() => {
    setInput('');
    setBeautified(null);
  }, []);

  return {
    input,
    setInput,
    indent,
    setIndent,
    inputEditorRef,
    diagnostics,
    isEmpty,
    summary,
    syntaxError,
    canBeautify: summary !== null,
    beautified,
    isBeautifiedStale:
      beautified !== null && beautified.source !== debouncedInput,
    handleBeautify,
    handleGoToError,
    handleLoadSample,
    handleClear,
  };
}
