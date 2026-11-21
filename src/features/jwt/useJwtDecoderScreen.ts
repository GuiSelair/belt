'use client';

import { useCallback, useState } from 'react';

import { useLatestTask } from '@/lib/useLatestTask';
import { createTask } from '@/tasks/createTask';

import { JWT_SAMPLE } from './jwtShared';

const inspectJwtTask = createTask('inspectJwt');

export function useJwtDecoderScreen() {
  const [input, setInput] = useState(JWT_SAMPLE);
  const [request, setRequest] = useState<string | null>(null);

  const { outcome, isPending } = useLatestTask(inspectJwtTask, request);

  const result = outcome?.ok ? outcome.result : null;
  const taskError = outcome && !outcome.ok ? outcome.error : null;
  const decodeError = result && !result.ok ? result.error : null;

  const handleRun = useCallback(() => setRequest(input), [input]);
  const handleClear = useCallback(() => {
    setInput('');
    setRequest(null);
  }, []);

  return {
    input,
    setInput,
    canRun: input.trim() !== '',
    hasRun: request !== null,
    isRunning: isPending,
    token: result?.ok ? result.token : null,
    description: result?.ok ? result.description : null,
    decodeError,
    taskError,
    handleRun,
    handleClear,
  };
}
