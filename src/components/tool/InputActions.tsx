'use client';

import { Button } from '@chakra-ui/react';
import { Eraser, Play } from 'lucide-react';

interface InputActionsProps {
  runLabel: string;
  canRun: boolean;
  onRun(): void;
  onClear(): void;
}

export function InputActions({
  runLabel,
  canRun,
  onRun,
  onClear,
}: InputActionsProps) {
  return (
    <>
      <Button size="sm" variant="ghost" onClick={onClear}>
        <Eraser aria-hidden="true" />
        Clear
      </Button>
      <Button
        size="sm"
        colorPalette="accent"
        onClick={onRun}
        disabled={!canRun}
      >
        <Play aria-hidden="true" />
        {runLabel}
      </Button>
    </>
  );
}
