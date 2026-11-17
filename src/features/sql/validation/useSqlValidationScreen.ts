'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import type { CodeEditorHandle } from '@/components/editor/CodeEditor';
import { useLatestTask } from '@/lib/useLatestTask';

import { getSqlDialect, type SqlDialect } from '../lib/dialects';
import { validateSql, type ValidateSqlRequest } from '../lib/validateSql';
import { SQL_SAMPLE, toSqlDiagnostic } from '../sqlShared';

export function useSqlValidationScreen() {
  const [input, setInput] = useState(SQL_SAMPLE);
  const [dialect, setDialect] = useState<SqlDialect>('postgresql');
  const [request, setRequest] = useState<ValidateSqlRequest | null>(null);
  const inputEditorRef = useRef<CodeEditorHandle>(null);

  const { outcome, isPending } = useLatestTask(validateSql, request);

  const result = outcome?.ok ? outcome.result : null;
  const taskError = outcome && !outcome.ok ? outcome.error : null;
  const syntaxError = result && !result.ok ? result.error : null;
  const statements = result?.ok ? result.statements : null;
  const checkedDialect = request ? getSqlDialect(request.dialect).label : '';

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
    canRun: input.trim() !== '',
    hasRun: request !== null,
    isValidating: isPending,
    checkedDialect,
    statements,
    compatibility: result?.compatibility ?? null,
    syntaxError,
    taskError,
    handleRun,
    handleClear,
    handleGoToError,
  };
}
