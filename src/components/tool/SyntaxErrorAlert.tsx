'use client';

import { Button, Stack, Text } from '@chakra-ui/react';
import { LocateFixed } from 'lucide-react';

import { StatusMessage } from './StatusMessage';

export interface PositionedError {
  message: string;
  line: number;
  column: number;
}

interface SyntaxErrorAlertProps {
  title?: string;
  error: PositionedError;
  onGoToError(): void;
}

export function SyntaxErrorAlert({
  title = 'Syntax error',
  error,
  onGoToError,
}: SyntaxErrorAlertProps) {
  return (
    <StatusMessage tone="error" title={title}>
      <Stack gap="2" align="flex-start">
        <Text>{error.message}</Text>
        <Button size="xs" variant="outline" onClick={onGoToError}>
          <LocateFixed aria-hidden="true" />
          Go to line {error.line}, column {error.column}
        </Button>
      </Stack>
    </StatusMessage>
  );
}
