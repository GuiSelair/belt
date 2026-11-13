import type { ReactNode } from 'react';
import type { Metadata } from 'next';

import { Container, Heading, Stack } from '@chakra-ui/react';

import { getRelatedTools, getTool, type ToolId } from '@/registry';

import { RelatedTools } from './RelatedTools';

interface ToolPageProps {
  toolId: ToolId;
  children: ReactNode;
}

export function buildToolMetadata(toolId: ToolId): Metadata {
  const tool = getTool(toolId);
  return { title: tool.name, description: tool.description };
}

export function ToolPage({ toolId, children }: ToolPageProps) {
  const tool = getTool(toolId);

  return (
    <Container maxW="7xl" py={{ base: '8', md: '12' }}>
      <Stack gap="8">
        <Stack gap="3">
          <Heading as="h1" size={{ base: '2xl', md: '3xl' }}>
            {tool.name}
          </Heading>
          <RelatedTools tools={getRelatedTools(toolId)} />
        </Stack>
        {children}
      </Stack>
    </Container>
  );
}
