import type { ReactNode } from 'react';

import { Badge, Flex, HStack, Heading, Stack } from '@chakra-ui/react';

interface EditorPanelProps {
  title: string;
  actions?: ReactNode;
  isStale?: boolean;
  children: ReactNode;
}

export function EditorPanel({
  title,
  actions,
  isStale = false,
  children,
}: EditorPanelProps) {
  return (
    <Stack as="section" aria-label={title} gap="3" minW="0">
      <Flex align="center" justify="space-between" gap="3" wrap="wrap">
        <HStack gap="2">
          <Heading as="h2" size="md">
            {title}
          </Heading>
          {isStale && (
            <Badge colorPalette="orange" variant="surface">
              Stale — fix the input to update
            </Badge>
          )}
        </HStack>
        {actions && <HStack gap="2">{actions}</HStack>}
      </Flex>
      {children}
    </Stack>
  );
}
