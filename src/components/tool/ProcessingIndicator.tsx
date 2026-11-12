import { HStack, Spinner, Text } from '@chakra-ui/react';

interface ProcessingIndicatorProps {
  label: string;
}

export function ProcessingIndicator({ label }: ProcessingIndicatorProps) {
  return (
    <HStack gap="2" role="status" color="fg.muted">
      <Spinner size="xs" color="fg.highlight" />
      <Text fontSize="sm">{label}</Text>
    </HStack>
  );
}
