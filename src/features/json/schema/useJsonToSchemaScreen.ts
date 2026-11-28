'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import type { CodeEditorHandle } from '@/components/editor/CodeEditor';
import type { SelectOption } from '@/components/form/SelectField';
import { useLastValue } from '@/lib/useLastValue';
import { useLatestTask } from '@/lib/useLatestTask';
import { createTask } from '@/tasks/createTask';

import type { GenerateJsonSchemaRequest } from '../lib/schema/generateJsonSchema';
import type { JsonSchemaDraft } from '../lib/schema/writeJsonSchema';
import { JSON_SCHEMA_SAMPLE, toDiagnostic } from '../jsonShared';

const EMPTY_NOTICES: string[] = [];

export const draftOptions: SelectOption<JsonSchemaDraft>[] = [
  { value: '2020-12', label: '2020-12' },
  { value: '2019-09', label: '2019-09' },
  { value: 'draft-07', label: 'Draft 7' },
  { value: 'draft-04', label: 'Draft 4' },
];

const generateJsonSchemaTask = createTask('generateJsonSchema');

export function useJsonToSchemaScreen() {
  const [input, setInput] = useState(JSON_SCHEMA_SAMPLE);
  const [draft, setDraft] = useState<JsonSchemaDraft>('2020-12');
  const [requireProperties, setRequireProperties] = useState(true);
  const [detectFormats, setDetectFormats] = useState(true);
  const [allowAdditionalProperties, setAllowAdditionalProperties] =
    useState(true);
  const [request, setRequest] = useState<GenerateJsonSchemaRequest | null>(
    null,
  );
  const inputEditorRef = useRef<CodeEditorHandle>(null);

  const { outcome, isPending } = useLatestTask(generateJsonSchemaTask, request);

  const result = outcome?.ok ? outcome.result : null;
  const taskError = outcome && !outcome.ok ? outcome.error : null;
  const syntaxError = result && !result.ok ? result.error : null;
  const freshSchema =
    request === null ? '' : result?.ok ? result.schema : undefined;
  const schema = useLastValue(freshSchema, '');
  const notices = result?.ok ? result.notices : EMPTY_NOTICES;

  const diagnostics = useMemo(
    () => (syntaxError ? [toDiagnostic(syntaxError, 'error')] : []),
    [syntaxError],
  );

  const handleRun = useCallback(() => {
    setRequest({
      text: input,
      draft,
      requireProperties,
      detectFormats,
      allowAdditionalProperties,
    });
  }, [
    input,
    draft,
    requireProperties,
    detectFormats,
    allowAdditionalProperties,
  ]);
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
    draft,
    setDraft,
    requireProperties,
    setRequireProperties,
    detectFormats,
    setDetectFormats,
    allowAdditionalProperties,
    setAllowAdditionalProperties,
    inputEditorRef,
    diagnostics,
    schema,
    notices,
    canRun: input.trim() !== '',
    syntaxError,
    taskError,
    isStale: syntaxError !== null && schema !== '',
    isRunning: isPending,
    handleRun,
    handleClear,
    handleGoToError,
  };
}
