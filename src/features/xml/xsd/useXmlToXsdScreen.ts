'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import type { CodeEditorHandle } from '@/components/editor/CodeEditor';
import type { SelectOption } from '@/components/form/SelectField';
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
  const [input, setInput] = useState(XML_SAMPLE);
  const [style, setStyle] = useState<XsdStyle>('russian-doll');
  const [compositor, setCompositor] = useState<XsdCompositor>('sequence');
  const [request, setRequest] = useState<GenerateXsdRequest | null>(null);
  const inputEditorRef = useRef<CodeEditorHandle>(null);

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

  const handleRun = useCallback(() => {
    setRequest({ text: input, style, compositor });
  }, [input, style, compositor]);
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
    style,
    setStyle,
    compositor,
    setCompositor,
    inputEditorRef,
    diagnostics,
    xsd,
    notices,
    canRun: input.trim() !== '',
    syntaxError,
    taskError,
    isStale: syntaxError !== null && xsd !== '',
    isGenerating: isPending && request !== null,
    isLargeInput: input.length > LARGE_INPUT_CHARACTERS,
    handleRun,
    handleClear,
    handleGoToError,
  };
}
