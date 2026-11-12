'use client';

import { Button, List } from '@chakra-ui/react';

import { StatusMessage } from './StatusMessage';

export interface PositionedWarning {
  message: string;
  offset: number;
  line: number;
  column: number;
}

interface PositionedWarningsProps {
  title: string;
  warnings: readonly PositionedWarning[];
  onGoTo(offset: number): void;
}

interface WarningItemProps {
  warning: PositionedWarning;
  onGoTo(offset: number): void;
}

function WarningItem({ warning, onGoTo }: WarningItemProps) {
  function handleClick() {
    onGoTo(warning.offset);
  }

  return (
    <List.Item>
      <Button
        size="xs"
        variant="plain"
        px="0"
        textDecoration="underline"
        onClick={handleClick}
      >
        {warning.message} — line {warning.line}, column {warning.column}
      </Button>
    </List.Item>
  );
}

export function PositionedWarnings({
  title,
  warnings,
  onGoTo,
}: PositionedWarningsProps) {
  if (warnings.length === 0) return null;

  return (
    <StatusMessage tone="warning" title={title}>
      <List.Root gap="1" ps="0" listStyleType="none">
        {warnings.map((warning) => (
          <WarningItem
            key={`${warning.offset}-${warning.message}`}
            warning={warning}
            onGoTo={onGoTo}
          />
        ))}
      </List.Root>
    </StatusMessage>
  );
}
