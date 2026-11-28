'use client';

import { useCallback } from 'react';

import {
  Badge,
  Box,
  Button,
  Code,
  Collapsible,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import { ChevronDown, Lightbulb, Play } from 'lucide-react';

import type { SqlExample } from './sqlExamples';

interface SqlExamplesProps {
  dialectLabel: string;
  examples: SqlExample[];
  onSelect(example: SqlExample): void;
}

interface SqlExampleCardProps {
  example: SqlExample;
  onSelect(example: SqlExample): void;
}

function SqlExampleCard({ example, onSelect }: SqlExampleCardProps) {
  const isValid = example.kind !== 'invalid';
  const handleClick = useCallback(() => onSelect(example), [example, onSelect]);

  return (
    <Stack
      as="li"
      gap="3"
      p="4"
      minW="0"
      bg="bg.subtle"
      borderWidth="1px"
      borderColor="border.muted"
      rounded="lg"
    >
      <Flex align="center" justify="space-between" gap="2">
        <Heading as="h3" size="sm">
          {example.title}
        </Heading>
        <Badge colorPalette={isValid ? 'green' : 'red'} variant="surface">
          {isValid ? 'Valid' : 'Invalid'}
        </Badge>
      </Flex>
      <Text color="fg.muted" fontSize="sm">
        {example.description}
      </Text>
      <Code
        as="pre"
        display="block"
        flex="1"
        p="3"
        maxH="72"
        overflow="auto"
        whiteSpace="pre"
        fontSize="xs"
      >
        {example.sql}
      </Code>
      <Button
        size="sm"
        variant="outline"
        alignSelf="flex-start"
        mt="auto"
        onClick={handleClick}
        aria-label={`Validate the ${example.title.toLowerCase()} example`}
      >
        <Play aria-hidden="true" />
        Try it
      </Button>
    </Stack>
  );
}

export function SqlExamples({
  dialectLabel,
  examples,
  onSelect,
}: SqlExamplesProps) {
  return (
    <Collapsible.Root as="section" aria-label="Examples">
      <Collapsible.Trigger asChild>
        <Button size="sm" variant="outline">
          <Lightbulb aria-hidden="true" />
          {dialectLabel} examples
          <Collapsible.Indicator
            transition="transform 0.2s"
            _open={{ transform: 'rotate(180deg)' }}
          >
            <ChevronDown aria-hidden="true" />
          </Collapsible.Indicator>
        </Button>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <Box pt="3">
          <SimpleGrid
            as="ul"
            listStyleType="none"
            columns={{ base: 1, lg: 3 }}
            gap="3"
          >
            {examples.map((example) => (
              <SqlExampleCard
                key={example.kind}
                example={example}
                onSelect={onSelect}
              />
            ))}
          </SimpleGrid>
        </Box>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
