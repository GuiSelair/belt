import NextLink from 'next/link';
import { Box, Button, HStack, Text } from '@chakra-ui/react';
import { ArrowRight } from 'lucide-react';

import type { ToolDefinition } from '@/registry';

interface RelatedToolsProps {
  tools: ToolDefinition[];
}

export function RelatedTools({ tools }: RelatedToolsProps) {
  if (tools.length === 0) return null;

  return (
    <Box as="nav" aria-label="Related tools">
      <HStack gap="2" wrap="wrap">
        <Text as="span" color="fg.muted" fontSize="sm">
          Related tools:
        </Text>
        {tools.map((tool) => (
          <Button
            key={tool.id}
            asChild
            size="xs"
            variant="outline"
            rounded="full"
            color="fg"
          >
            <NextLink href={tool.href}>
              {tool.name}
              <ArrowRight aria-hidden="true" />
            </NextLink>
          </Button>
        ))}
      </HStack>
    </Box>
  );
}
