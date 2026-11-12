import type { ReactNode } from 'react';

import { Alert } from '@chakra-ui/react';

export type StatusTone = 'success' | 'error' | 'warning' | 'info';

interface StatusMessageProps {
  tone: StatusTone;
  title: string;
  children?: ReactNode;
}

export function StatusMessage({ tone, title, children }: StatusMessageProps) {
  return (
    <Alert.Root
      status={tone}
      variant="surface"
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{title}</Alert.Title>
        {children && <Alert.Description>{children}</Alert.Description>}
      </Alert.Content>
    </Alert.Root>
  );
}
