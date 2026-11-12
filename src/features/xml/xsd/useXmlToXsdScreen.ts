'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import type { CodeEditorHandle } from '@/components/editor/CodeEditor';
import type { SelectOption } from '@/components/form/SelectField';
import { downloadText } from '@/lib/downloadText';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { useLastValue } from '@/lib/useLastValue';
import { useLatestTask } from '@/lib/useLatestTask';
import { useWorkerTask } from '@/lib/worker/useWorkerTask';

import type {
  GenerateXsdRequest,
  GenerateXsdResult,
} from '../lib/xsd/generateXsd';
import type { XsdCompositor, XsdStyle } from '../lib/xsd/writeXsd';
import { XML_SAMPLE, toXmlDiagnostic } from '../xmlShared';

const LARGE_INPUT_CHARACTERS = 5_000_000;
const EMPTY_NOTICES: string[] = [];

export const styleOptions: SelectOption<XsdStyle>[] = [
  { value: 'russian-doll', label: 'Russian doll' },
  { value: 'salami-slice', label: 'Salami slice' },
];

export const compositorOptions: SelectOption<XsdCompositor>[] = [
  { value: 'sequence', label: 'Strict order' },
  { value: 'all', label: 'Any order' },
];

function createXsdWorker() {
  return new Worker(
    new URL('../workers/generateXsd.worker.ts', import.meta.url),
    { type: 'module' },
  );
}

export function useXmlToXsdScreen() {
  const [input, setInput] = useState('');
  const [style, setStyle] = useState<XsdStyle>('russian-doll');
  const [compositor, setCompositor] = useState<XsdCompositor>('sequence');
  const inputEditorRef = useRef<CodeEditorHandle>(null);
  const debouncedInput = useDebouncedValue(input);

  const request = useMemo<GenerateXsdRequest | null>(() => {
    if (input.trim() === '' || debouncedInput.trim() === '') return null;
    return { text: debouncedInput, style, compositor };
  }, [input, debouncedInput, style, compositor]);

  const runGenerate = useWorkerTask<GenerateXsdRequest, GenerateXsdResult>(
    createXsdWorker,
  );
  const { outcome, isPending } = useLatestTask(runGenerate, request);

  const result = outcome?.ok ? outcome.result : null;
  const taskError = outcome && !outcome.ok ? outcome.error : null;
  const syntaxError = result && !result.ok ? result.error : null;
  const freshXsd = request === null ? '' : result?.ok ? result.xsd : undefined;
  const xsd = useLastValue(freshXsd, '');
  const notices = result?.ok ? result.notices : EMPTY_NOTICES;

  const diagnostics = useMemo(
    () => (syntaxError ? [toXmlDiagnostic(syntaxError)] : []),
    [syntaxError],
  );

  const handleLoadSample = useCallback(() => setInput(XML_SAMPLE), []);
  const handleClear = useCallback(() => setInput(''), []);
  const handleGoToError = useCallback(() => {
    if (syntaxError) inputEditorRef.current?.focusAt(syntaxError.offset);
  }, [syntaxError]);
  const handleDownload = useCallback(() => {
    downloadText('schema.xsd', xsd, 'application/xml');
  }, [xsd]);

  return {
    input,
    setInput,
    style,
    setStyle,
    compositor,
    setCompositor,
    inputEditorRef,
    diagnostics,
    xsd,
    notices,
    syntaxError,
    taskError,
    isStale: syntaxError !== null && xsd !== '',
    isGenerating: isPending && request !== null,
    isLargeInput: input.length > LARGE_INPUT_CHARACTERS,
    handleLoadSample,
    handleClear,
    handleGoToError,
    handleDownload,
  };
}
