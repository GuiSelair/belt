'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import type { CodeEditorHandle } from '@/components/editor/CodeEditor';
import type { SelectOption } from '@/components/form/SelectField';
import { toXmlDiagnostic } from '@/features/xml/xmlShared';
import { useLatestTask } from '@/lib/useLatestTask';
import {
  useWorkerTask,
  type WorkerTaskOptions,
} from '@/lib/worker/useWorkerTask';

import { inspectWsdl, type InspectWsdlResult } from './lib/inspectWsdl';
import { WSDL_SAMPLE } from './wsdlShared';

const INLINE_LIMIT_CHARACTERS = 200_000;
const NO_NOTICES: string[] = [];

function createInspectWorker() {
  return new Worker(
    new URL('./workers/inspectWsdl.worker.ts', import.meta.url),
    {
      type: 'module',
    },
  );
}

const workerOptions: WorkerTaskOptions<string, InspectWsdlResult> = {
  inline: {
    when: (text) => text.length < INLINE_LIMIT_CHARACTERS,
    run: inspectWsdl,
  },
};

export function useWsdlInspectorScreen() {
  const [input, setInput] = useState(WSDL_SAMPLE);
  const [request, setRequest] = useState<string | null>(null);
  const [selectedPortId, setSelectedPortId] = useState('');
  const [selectedOperation, setSelectedOperation] = useState('');
  const inputEditorRef = useRef<CodeEditorHandle>(null);

  const runInspect = useWorkerTask(createInspectWorker, workerOptions);
  const { outcome, isPending } = useLatestTask(runInspect, request);

  const result = outcome?.ok ? outcome.result : null;
  const taskError = outcome && !outcome.ok ? outcome.error : null;
  const syntaxError =
    result && !result.ok && result.kind === 'syntax' ? result.error : null;
  const wsdlError =
    result && !result.ok && result.kind === 'wsdl' ? result.message : null;
  const ports = result?.ok ? result.ports : null;
  const notices = result?.ok ? result.notices : NO_NOTICES;

  const port =
    ports?.find(({ id }) => id === selectedPortId) ?? ports?.[0] ?? null;
  const operation =
    port?.operations.find(({ name }) => name === selectedOperation) ??
    port?.operations[0] ??
    null;

  const portOptions = useMemo<SelectOption<string>[]>(
    () =>
      (ports ?? []).map(({ id, service, name, binding }) => ({
        value: id,
        label: `${service ? `${service} / ` : ''}${name} (SOAP ${binding.soapVersion})`,
      })),
    [ports],
  );
  const operationOptions = useMemo<SelectOption<string>[]>(
    () =>
      (port?.operations ?? []).map(({ name }) => ({
        value: name,
        label: name,
      })),
    [port],
  );

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
    isInspecting: isPending,
    syntaxError,
    wsdlError,
    taskError,
    notices,
    port,
    operation,
    portOptions,
    operationOptions,
    handlePortChange: setSelectedPortId,
    handleOperationChange: setSelectedOperation,
    handleRun,
    handleClear,
    handleGoToError,
  };
}
