'use client';

import { Stack } from '@chakra-ui/react';

import { CodeEditor } from '@/components/editor/CodeEditor';
import { SegmentedField } from '@/components/form/SegmentedField';
import { SelectField } from '@/components/form/SelectField';
import { SwitchField } from '@/components/form/SwitchField';
import { CopyButton } from '@/components/tool/CopyButton';
import { EditorPanel } from '@/components/tool/EditorPanel';
import { InputActions } from '@/components/tool/InputActions';
import { ProcessingIndicator } from '@/components/tool/ProcessingIndicator';
import { StatusMessage } from '@/components/tool/StatusMessage';
import { SyntaxErrorAlert } from '@/components/tool/SyntaxErrorAlert';
import { ToolPanels } from '@/components/tool/ToolPanels';
import { ToolToolbar } from '@/components/tool/ToolToolbar';
import { indentOptions } from '@/lib/indentation';

import {
  outputModeOptions,
  useJsonBeautifyScreen,
} from './useJsonBeautifyScreen';

export function JsonBeautifyScreen() {
  const {
    input,
    setInput,
    indent,
    setIndent,
    mode,
    setMode,
    sortKeys,
    setSortKeys,
    output,
    isStale,
    isProcessingInWorker,
    syntaxError,
    taskError,
    diagnostics,
    inputEditorRef,
    handleLoadSample,
    handleClear,
    handleGoToError,
  } = useJsonBeautifyScreen();

  return (
    <Stack gap="6">
      <ToolToolbar label="Formatting options">
        <SegmentedField
          label="Output mode"
          value={mode}
          options={outputModeOptions}
          onChange={setMode}
        />
        <SelectField
          label="Indentation"
          value={indent}
          options={indentOptions}
          onChange={setIndent}
          disabled={mode === 'minify'}
        />
        <SwitchField
          label="Sort keys"
          checked={sortKeys}
          onChange={setSortKeys}
        />
      </ToolToolbar>

      {syntaxError && (
        <SyntaxErrorAlert
          title="Invalid JSON"
          error={syntaxError}
          onGoToError={handleGoToError}
        />
      )}
      {taskError && (
        <StatusMessage tone="error" title="Formatting failed">
          {taskError}
        </StatusMessage>
      )}

      <ToolPanels>
        <EditorPanel
          title="Input"
          actions={
            <InputActions
              onLoadSample={handleLoadSample}
              onClear={handleClear}
            />
          }
        >
          <CodeEditor
            ref={inputEditorRef}
            label="JSON input"
            language="json"
            value={input}
            onChange={setInput}
            diagnostics={diagnostics}
            placeholder="Paste or type JSON here…"
          />
        </EditorPanel>
        <EditorPanel
          title="Output"
          isStale={isStale}
          actions={
            <>
              {isProcessingInWorker && (
                <ProcessingIndicator label="Formatting…" />
              )}
              <CopyButton value={output} />
            </>
          }
        >
          <CodeEditor
            label="Formatted JSON output"
            language="json"
            value={output}
            readOnly
          />
        </EditorPanel>
      </ToolPanels>
    </Stack>
  );
}
