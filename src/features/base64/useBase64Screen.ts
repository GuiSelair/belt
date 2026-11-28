'use client';

import { useCallback, useState } from 'react';

import type { SelectOption } from '@/components/form/SelectField';
import { useLastValue } from '@/lib/useLastValue';
import { useLatestTask } from '@/lib/useLatestTask';
import { createTask } from '@/tasks/createTask';

import { BASE64_SAMPLE } from './base64Shared';
import type {
  Base64Direction,
  ConvertBase64Request,
} from './lib/convertBase64';

export const directionOptions: SelectOption<Base64Direction>[] = [
  { value: 'encode', label: 'Encode' },
  { value: 'decode', label: 'Decode' },
];

const convertBase64Task = createTask('convertBase64');

export function useBase64Screen() {
  const [input, setInput] = useState(BASE64_SAMPLE);
  const [direction, setDirection] = useState<Base64Direction>('encode');
  const [request, setRequest] = useState<ConvertBase64Request | null>(null);

  const { outcome, isPending } = useLatestTask(convertBase64Task, request);

  const result = outcome?.ok ? outcome.result : null;
  const taskError = outcome && !outcome.ok ? outcome.error : null;
  const convertError = result && !result.ok ? result.error : null;
  const freshOutput =
    request === null ? '' : result?.ok ? result.output : undefined;
  const output = useLastValue(freshOutput, '');

  const handleDirectionChange = useCallback((next: Base64Direction) => {
    setDirection(next);
    setRequest(null);
  }, []);
  const handleRun = useCallback(() => {
    setRequest({ text: input, direction });
  }, [input, direction]);
  const handleClear = useCallback(() => {
    setInput('');
    setRequest(null);
  }, []);

  return {
    input,
    setInput,
    direction,
    setDirection: handleDirectionChange,
    output,
    canRun: input !== '',
    convertError,
    taskError,
    isStale: convertError !== null && output !== '',
    isRunning: isPending,
    handleRun,
    handleClear,
  };
}
