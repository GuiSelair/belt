'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import type { CodeEditorHandle } from '@/components/editor/CodeEditor';
import { toIndentUnit, type IndentOption } from '@/lib/indentation';
import { useLastValue } from '@/lib/useLastValue';

import { beautifyXml, type BeautifyXmlResult } from '../lib/beautifyXml';
import { validateXml } from '../lib/validateXml';
import { XML_SAMPLE, toXmlDiagnostic } from '../xmlShared';

interface BeautifyXmlRequest {
  text: string;
  indent: string;
}

const EMPTY_RESULT: BeautifyXmlResult = { output: '', notices: [] };

export function useXmlBeautifyScreen() {
  const [input, setInput] = useState(XML_SAMPLE);
  const [indent, setIndent] = useState<IndentOption>('2');
  const [request, setRequest] = useState<BeautifyXmlRequest | null>(null);
  const inputEditorRef = useRef<CodeEditorHandle>(null);

  const validation = useMemo(
    () => (request === null ? null : validateXml(request.text)),
    [request],
  );
  const syntaxError = validation && !validation.ok ? validation.error : null;

  const freshResult = useMemo(() => {
    if (request === null) return EMPTY_RESULT;
    if (!validation?.ok) return undefined;
    return beautifyXml(request.text, request.indent);
  }, [request, validation]);
  const result = useLastValue(freshResult, EMPTY_RESULT);

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
    output: result.output,
    notices: result.notices,
    canRun: input.trim() !== '',
    isStale: syntaxError !== null && result.output !== '',
    syntaxError,
    handleRun,
    handleGoToError,
    handleClear,
  };
}
