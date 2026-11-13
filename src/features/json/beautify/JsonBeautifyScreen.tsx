'use client';

import { Stack } from '@chakra-ui/react';

import { SelectField } from '@/components/form/SelectField';
import { ToolToolbar } from '@/components/tool/ToolToolbar';
import { indentOptions } from '@/lib/indentation';

import { JsonFormatterView } from '../format/JsonFormatterView';
import { useJsonBeautifyScreen } from './useJsonBeautifyScreen';

export function JsonBeautifyScreen() {
  const { indent, setIndent, formatter } = useJsonBeautifyScreen();

  return (
    <Stack gap="6">
      <ToolToolbar label="Formatting options">
        <SelectField
          label="Indentation"
          value={indent}
          options={indentOptions}
          onChange={setIndent}
        />
      </ToolToolbar>
      <JsonFormatterView
        formatter={formatter}
        runLabel="Beautify"
        outputLabel="Formatted JSON output"
        processingLabel="Formatting…"
      />
    </Stack>
  );
}
