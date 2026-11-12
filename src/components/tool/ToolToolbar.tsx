import type { ReactNode } from 'react';

import { Flex } from '@chakra-ui/react';

interface ToolToolbarProps {
  label: string;
  children: ReactNode;
}

export function ToolToolbar({ label, children }: ToolToolbarProps) {
  return (
    <Flex
      role="group"
      aria-label={label}
      wrap="wrap"
      align="flex-end"
      gap="4"
      p="4"
      bg="bg.subtle"
      borderWidth="1px"
      borderColor="border.muted"
      rounded="lg"
    >
      {children}
    </Flex>
  );
}
