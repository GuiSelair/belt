'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import type { CodeEditorHandle } from '@/components/editor/CodeEditor';
import { toIndentUnit, type IndentOption } from '@/lib/indentation';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { useLastValue } from '@/lib/useLastValue';

import { beautifyXml, type BeautifyXmlResult } from '../lib/beautifyXml';
import { validateXml } from '../lib/validateXml';
import { XML_SAMPLE, toXmlDiagnostic } from '../xmlShared';

const EMPTY_RESULT: BeautifyXmlResult = { output: '', notices: [] };

export function useXmlBeautifyScreen() {
  const [input, setInput] = useState('');
  const [indent, setIndent] = useState<IndentOption>('2');
  const inputEditorRef = useRef<CodeEditorHandle>(null);
  const debouncedInput = useDebouncedValue(input);
  const isEmpty = input.trim() === '' || debouncedInput.trim() === '';

  const validation = useMemo(
    () => (isEmpty ? null : validateXml(debouncedInput)),
    [isEmpty, debouncedInput],
  );
  const syntaxError = validation && !validation.ok ? validation.error : null;

  const freshResult = useMemo(() => {
    if (isEmpty) return EMPTY_RESULT;
    if (!validation?.ok) return undefined;
    return beautifyXml(debouncedInput, toIndentUnit(indent));
  }, [isEmpty, validation, debouncedInput, indent]);
  const result = useLastValue(freshResult, EMPTY_RESULT);

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
    indent,
    setIndent,
    inputEditorRef,
    diagnostics,
    output: result.output,
    notices: result.notices,
    isStale: syntaxError !== null && result.output !== '',
    syntaxError,
    handleGoToError,
    handleLoadSample,
    handleClear,
  };
}
