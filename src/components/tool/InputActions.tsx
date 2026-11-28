'use client';

import { Button } from '@chakra-ui/react';
import { Eraser, Play } from 'lucide-react';

import { trackToolRun } from '@/lib/analytics';

interface InputActionsProps {
  runLabel: string;
  canRun: boolean;
  onRun(): void;
  onClear(): void;
  isRunning?: boolean;
  runningLabel?: string;
}

export function InputActions({
  runLabel,
  canRun,
  onRun,
  onClear,
  isRunning = false,
  runningLabel,
}: InputActionsProps) {
  function handleRun() {
    trackToolRun(runLabel);
    onRun();
  }

  return (
    <>
      <Button size="sm" variant="ghost" onClick={onClear}>
        <Eraser aria-hidden="true" />
        Clear
      </Button>
      <Button
        size="sm"
        colorPalette="accent"
        onClick={handleRun}
        disabled={!canRun}
        loading={isRunning}
        loadingText={runningLabel}
      >
        <Play aria-hidden="true" />
        {runLabel}
      </Button>
    </>
  );
}
