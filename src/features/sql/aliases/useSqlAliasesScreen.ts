'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import type { CodeEditorHandle } from '@/components/editor/CodeEditor';
import { useLastValue } from '@/lib/useLastValue';
import { useLatestTask } from '@/lib/useLatestTask';

import type { SqlDialect } from '../lib/dialects';
import { SQL_SAMPLE, toSqlDiagnostic } from '../sqlShared';
import { addAliases, type AddAliasesRequest } from './lib/addAliases';

const NO_NOTICES: string[] = [];

export function useSqlAliasesScreen() {
  const [input, setInput] = useState(SQL_SAMPLE);
  const [dialect, setDialect] = useState<SqlDialect>('postgresql');
  const [request, setRequest] = useState<AddAliasesRequest | null>(null);
  const inputEditorRef = useRef<CodeEditorHandle>(null);

  const { outcome, isPending } = useLatestTask(addAliases, request);

  const result = outcome?.ok ? outcome.result : null;
  const taskError = outcome && !outcome.ok ? outcome.error : null;
  const syntaxError = result && !result.ok ? result.error : null;
  const freshOutput =
    request === null ? '' : result?.ok ? result.output : undefined;
  const output = useLastValue(freshOutput, '');
  const notices = result?.ok ? result.notices : NO_NOTICES;

  const diagnostics = useMemo(
    () => (syntaxError ? [toSqlDiagnostic(syntaxError)] : []),
    [syntaxError],
  );

  const handleDialectChange = useCallback((next: SqlDialect) => {
    setDialect(next);
    setRequest((current) => current && { ...current, dialect: next });
  }, []);
  const handleRun = useCallback(() => {
    setRequest({ text: input, dialect });
  }, [input, dialect]);
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
    dialect,
    handleDialectChange,
    inputEditorRef,
    diagnostics,
    output,
    notices,
    canRun: input.trim() !== '',
    syntaxError,
    taskError,
    isStale: (syntaxError !== null || taskError !== null) && output !== '',
    isProcessing: isPending,
    handleRun,
    handleClear,
    handleGoToError,
  };
}
