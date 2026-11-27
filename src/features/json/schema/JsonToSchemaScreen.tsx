'use client';

import { Stack } from '@chakra-ui/react';

import { CodeEditor } from '@/components/editor/CodeEditor';
import { SelectField } from '@/components/form/SelectField';
import { SwitchField } from '@/components/form/SwitchField';
import { CopyButton } from '@/components/tool/CopyButton';
import { EditorPanel } from '@/components/tool/EditorPanel';
import { InputActions } from '@/components/tool/InputActions';
import { StatusMessage } from '@/components/tool/StatusMessage';
import { SyntaxErrorAlert } from '@/components/tool/SyntaxErrorAlert';
import { ToolPanels } from '@/components/tool/ToolPanels';
import { ToolToolbar } from '@/components/tool/ToolToolbar';

import { draftOptions, useJsonToSchemaScreen } from './useJsonToSchemaScreen';

export function JsonToSchemaScreen() {
  const {
    input,
    setInput,
    draft,
    setDraft,
    requireProperties,
    setRequireProperties,
    detectFormats,
    setDetectFormats,
    allowAdditionalProperties,
    setAllowAdditionalProperties,
    inputEditorRef,
    diagnostics,
    schema,
    notices,
    canRun,
    syntaxError,
    taskError,
    isStale,
    isRunning,
    handleRun,
    handleClear,
    handleGoToError,
  } = useJsonToSchemaScreen();

  return (
    <Stack gap="6">
      <ToolToolbar label="Schema options">
        <SelectField
          label="Draft"
          value={draft}
          options={draftOptions}
          onChange={setDraft}
        />
        <SwitchField
          label="Required properties"
          checked={requireProperties}
          onChange={setRequireProperties}
        />
        <SwitchField
          label="Detect formats"
          checked={detectFormats}
          onChange={setDetectFormats}
        />
        <SwitchField
          label="Allow additional properties"
          checked={allowAdditionalProperties}
          onChange={setAllowAdditionalProperties}
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
        <StatusMessage tone="error" title="Generation failed">
          {taskError}
        </StatusMessage>
      )}
      {notices.map((notice) => (
        <StatusMessage key={notice} tone="warning" title="Heads up">
          {notice}
        </StatusMessage>
      ))}

      <ToolPanels>
        <EditorPanel
          title="JSON input"
          actions={
            <InputActions
              runLabel="Generate"
              canRun={canRun}
              onRun={handleRun}
              onClear={handleClear}
              isRunning={isRunning}
              runningLabel="Generating…"
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
            placeholder="Paste a sample JSON document here…"
          />
        </EditorPanel>
        <EditorPanel
          title="JSON Schema output"
          isStale={isStale}
          actions={<CopyButton value={schema} />}
        >
          <CodeEditor
            label="Generated JSON Schema output"
            language="json"
            value={schema}
            readOnly
          />
        </EditorPanel>
      </ToolPanels>
    </Stack>
  );
}
