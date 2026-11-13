'use client';

import { Stack } from '@chakra-ui/react';

import { CodeEditor } from '@/components/editor/CodeEditor';
import { EditorPanel } from '@/components/tool/EditorPanel';
import { InputActions } from '@/components/tool/InputActions';
import { PositionedWarnings } from '@/components/tool/PositionedWarnings';
import { ProcessingIndicator } from '@/components/tool/ProcessingIndicator';
import { StatusMessage } from '@/components/tool/StatusMessage';
import { SyntaxErrorAlert } from '@/components/tool/SyntaxErrorAlert';
import { ToolPanels } from '@/components/tool/ToolPanels';

import { JsonSummaryList } from './JsonSummaryList';
import { useJsonValidationScreen } from './useJsonValidationScreen';

export function JsonValidationScreen() {
  const {
    input,
    setInput,
    inputEditorRef,
    diagnostics,
    canRun,
    hasRun,
    isValidating,
    summary,
    warnings,
    syntaxError,
    taskError,
    goTo,
    handleGoToError,
    handleRun,
    handleClear,
  } = useJsonValidationScreen();

  return (
    <ToolPanels>
      <EditorPanel
        title="Input"
        actions={
          <InputActions
            runLabel="Validate"
            canRun={canRun}
            onRun={handleRun}
            onClear={handleClear}
          />
        }
      >
        <CodeEditor
          ref={inputEditorRef}
          label="JSON to validate"
          language="json"
          value={input}
          onChange={setInput}
          diagnostics={diagnostics}
          placeholder="Paste or type JSON here…"
        />
      </EditorPanel>
      <EditorPanel title="Result">
        <Stack gap="4">
          {!hasRun && (
            <StatusMessage tone="info" title="Ready to validate">
              Paste JSON on the left and click Validate.
            </StatusMessage>
          )}
          {isValidating && <ProcessingIndicator label="Validating…" />}
          {taskError && (
            <StatusMessage tone="error" title="Validation failed">
              {taskError}
            </StatusMessage>
          )}
          {syntaxError && (
            <SyntaxErrorAlert
              title="Invalid JSON"
              error={syntaxError}
              onGoToError={handleGoToError}
            />
          )}
          {summary && (
            <StatusMessage tone="success" title="Valid JSON">
              <JsonSummaryList summary={summary} />
            </StatusMessage>
          )}
          <PositionedWarnings
            title="Duplicate keys"
            warnings={warnings}
            onGoTo={goTo}
          />
        </Stack>
      </EditorPanel>
    </ToolPanels>
  );
}
