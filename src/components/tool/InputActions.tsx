'use client';

import { Button } from '@chakra-ui/react';
import { Eraser, FileCode } from 'lucide-react';

interface InputActionsProps {
  onLoadSample(): void;
  onClear(): void;
}

export function InputActions({ onLoadSample, onClear }: InputActionsProps) {
  return (
    <>
      <Button size="sm" variant="outline" onClick={onLoadSample}>
        <FileCode aria-hidden="true" />
        Load sample
      </Button>
      <Button size="sm" variant="ghost" onClick={onClear}>
        <Eraser aria-hidden="true" />
        Clear
      </Button>
    </>
  );
}
