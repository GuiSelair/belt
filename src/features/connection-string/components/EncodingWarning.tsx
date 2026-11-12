import { Code, List, Stack, Text } from '@chakra-ui/react';

import { StatusMessage } from '@/components/tool/StatusMessage';

import type { EncodedCharacter, FieldEncoding } from '../lib/types';

interface EncodingWarningProps {
  encodings: FieldEncoding[];
}

function describeChange({ char, encoded }: EncodedCharacter) {
  const label = char === ' ' ? 'space' : char;
  return `${label} → ${encoded}`;
}

export function EncodingWarning({ encodings }: EncodingWarningProps) {
  if (encodings.length === 0) return null;
  const hadPercent = encodings.some((encoding) => encoding.hadPercent);

  return (
    <StatusMessage tone="warning" title="Some characters were percent-encoded">
      <Stack gap="2">
        <List.Root ps="4">
          {encodings.map((encoding) => (
            <List.Item key={encoding.field}>
              {encoding.field}:{' '}
              <Code size="sm">
                {encoding.changes.map(describeChange).join(', ')}
              </Code>
            </List.Item>
          ))}
        </List.Root>
        {hadPercent && (
          <Text>
            Values are treated as raw text, so an existing % is encoded as %25.
            Type the decoded value instead.
          </Text>
        )}
      </Stack>
    </StatusMessage>
  );
}
