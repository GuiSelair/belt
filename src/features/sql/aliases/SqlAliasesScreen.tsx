'use client';

import { Stack } from '@chakra-ui/react';

import { CodeEditor } from '@/components/editor/CodeEditor';
import { SelectField } from '@/components/form/SelectField';
import { CopyButton } from '@/components/tool/CopyButton';
import { EditorPanel } from '@/components/tool/EditorPanel';
import { InputActions } from '@/components/tool/InputActions';
import { ProcessingIndicator } from '@/components/tool/ProcessingIndicator';
import { StatusMessage } from '@/components/tool/StatusMessage';
import { SyntaxErrorAlert } from '@/components/tool/SyntaxErrorAlert';
import { ToolPanels } from '@/components/tool/ToolPanels';
import { ToolToolbar } from '@/components/tool/ToolToolbar';

import { dialectOptions } from '../sqlShared';
import { useSqlAliasesScreen } from './useSqlAliasesScreen';

export function SqlAliasesScreen() {
  const {
    input,
    setInput,
    dialect,
    handleDialectChange,
    inputEditorRef,
    diagnostics,
    output,
    notices,
    canRun,
    syntaxError,
    taskError,
    isStale,
    isProcessing,
    handleRun,
    handleClear,
    handleGoToError,
  } = useSqlAliasesScreen();

  return (
    <Stack gap="6">
      <ToolToolbar label="Alias options">
        <SelectField
          label="Dialect"
          value={dialect}
          options={dialectOptions}
          onChange={handleDialectChange}
        />
      </ToolToolbar>

      {syntaxError && (
        <SyntaxErrorAlert
          title="Invalid SQL"
          error={syntaxError}
          onGoToError={handleGoToError}
        />
      )}
      {taskError && (
        <StatusMessage tone="error" title="Could not add aliases">
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
          title="SQL input"
          actions={
            <InputActions
              runLabel="Add aliases"
              canRun={canRun}
              onRun={handleRun}
              onClear={handleClear}
            />
          }
        >
          <CodeEditor
            ref={inputEditorRef}
            label="SQL input"
            language="sql"
            value={input}
            onChange={setInput}
            diagnostics={diagnostics}
            placeholder="Paste a SELECT query here…"
          />
        </EditorPanel>
        <EditorPanel
          title="SQL with aliases"
          isStale={isStale}
          actions={
            <>
              {isProcessing && <ProcessingIndicator label="Processing…" />}
              <CopyButton value={output} />
            </>
          }
        >
          <CodeEditor
            label="SQL with aliases output"
            language="sql"
            value={output}
            readOnly
          />
        </EditorPanel>
      </ToolPanels>
    </Stack>
  );
}
