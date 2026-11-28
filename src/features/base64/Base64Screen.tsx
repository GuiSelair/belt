'use client';

import { Stack } from '@chakra-ui/react';

import { CodeEditor } from '@/components/editor/CodeEditor';
import { SegmentedField } from '@/components/form/SegmentedField';
import { CopyButton } from '@/components/tool/CopyButton';
import { EditorPanel } from '@/components/tool/EditorPanel';
import { InputActions } from '@/components/tool/InputActions';
import { StatusMessage } from '@/components/tool/StatusMessage';
import { ToolPanels } from '@/components/tool/ToolPanels';
import { ToolToolbar } from '@/components/tool/ToolToolbar';

import { directionOptions, useBase64Screen } from './useBase64Screen';

const labelsByDirection = {
  encode: {
    inputTitle: 'Text input',
    inputLabel: 'Text to encode',
    inputPlaceholder: 'Type or paste text here…',
    outputTitle: 'Base64 output',
    outputLabel: 'Base64 output',
    runLabel: 'Encode',
    runningLabel: 'Encoding…',
  },
  decode: {
    inputTitle: 'Base64 input',
    inputLabel: 'Base64 to decode',
    inputPlaceholder: 'Paste Base64 here…',
    outputTitle: 'Text output',
    outputLabel: 'Decoded text output',
    runLabel: 'Decode',
    runningLabel: 'Decoding…',
  },
} as const;

export function Base64Screen() {
  const {
    input,
    setInput,
    direction,
    setDirection,
    output,
    canRun,
    convertError,
    taskError,
    isStale,
    isRunning,
    handleRun,
    handleClear,
  } = useBase64Screen();

  const labels = labelsByDirection[direction];

  return (
    <Stack gap="6">
      <ToolToolbar label="Base64 options">
        <SegmentedField
          label="Direction"
          value={direction}
          options={directionOptions}
          onChange={setDirection}
        />
      </ToolToolbar>

      {convertError && (
        <StatusMessage tone="error" title="Could not decode">
          {convertError.message}
        </StatusMessage>
      )}
      {taskError && (
        <StatusMessage tone="error" title="Conversion failed">
          {taskError}
        </StatusMessage>
      )}

      <ToolPanels>
        <EditorPanel
          title={labels.inputTitle}
          actions={
            <InputActions
              runLabel={labels.runLabel}
              canRun={canRun}
              onRun={handleRun}
              onClear={handleClear}
              isRunning={isRunning}
              runningLabel={labels.runningLabel}
            />
          }
        >
          <CodeEditor
            label={labels.inputLabel}
            language="text"
            value={input}
            onChange={setInput}
            placeholder={labels.inputPlaceholder}
          />
        </EditorPanel>
        <EditorPanel
          title={labels.outputTitle}
          isStale={isStale}
          actions={<CopyButton value={output} />}
        >
          <CodeEditor
            label={labels.outputLabel}
            language="text"
            value={output}
            readOnly
          />
        </EditorPanel>
      </ToolPanels>
    </Stack>
  );
}
