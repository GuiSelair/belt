'use client';

import { Stack } from '@chakra-ui/react';

import { JsonFormatterView } from '../format/JsonFormatterView';
import { useJsonMinifyScreen } from './useJsonMinifyScreen';

export function JsonMinifyScreen() {
  const { formatter } = useJsonMinifyScreen();

  return (
    <Stack gap="6">
      <JsonFormatterView
        formatter={formatter}
        outputLabel="Minified JSON output"
        processingLabel="Minifying…"
      />
    </Stack>
  );
}
