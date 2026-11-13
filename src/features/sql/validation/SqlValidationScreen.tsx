'use client';

import { Heading, Stack, Text } from '@chakra-ui/react';

import { CodeEditor } from '@/components/editor/CodeEditor';
import { SelectField } from '@/components/form/SelectField';
import { EditorPanel } from '@/components/tool/EditorPanel';
import { InputActions } from '@/components/tool/InputActions';
import { ProcessingIndicator } from '@/components/tool/ProcessingIndicator';
import { StatusMessage } from '@/components/tool/StatusMessage';
import { SyntaxErrorAlert } from '@/components/tool/SyntaxErrorAlert';
import { ToolPanels } from '@/components/tool/ToolPanels';
import { ToolToolbar } from '@/components/tool/ToolToolbar';

import { dialectOptions } from '../sqlShared';
import { SqlCompatibilityList } from './SqlCompatibilityList';
import { useSqlValidationScreen } from './useSqlValidationScreen';

function describeStatements(statements: string[]) {
  if (statements.length === 0) return 'No statements found.';
  const noun = statements.length === 1 ? 'statement' : 'statements';
  return `${statements.length} ${noun}: ${statements.join(', ')}`;
}

export function SqlValidationScreen() {
  const {
    input,
    setInput,
    dialect,
    handleDialectChange,
    inputEditorRef,
    diagnostics,
    canRun,
    hasRun,
    isValidating,
    checkedDialect,
    statements,
    compatibility,
    syntaxError,
    taskError,
    handleRun,
    handleClear,
    handleGoToError,
  } = useSqlValidationScreen();

  return (
    <Stack gap="6">
      <ToolToolbar label="Validation options">
        <SelectField
          label="Dialect"
          value={dialect}
          options={dialectOptions}
          onChange={handleDialectChange}
        />
      </ToolToolbar>

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
            label="SQL to validate"
            language="sql"
            value={input}
            onChange={setInput}
            diagnostics={diagnostics}
            placeholder="Paste or type SQL here…"
          />
        </EditorPanel>
        <EditorPanel title="Result">
          <Stack gap="4">
            {!hasRun && (
              <StatusMessage tone="info" title="Ready to validate">
                Pick a dialect, paste SQL on the left and click Validate.
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
                title={`Invalid ${checkedDialect} SQL`}
                error={syntaxError}
                onGoToError={handleGoToError}
              />
            )}
            {statements && (
              <StatusMessage
                tone="success"
                title={`Valid ${checkedDialect} SQL`}
              >
                {describeStatements(statements)}
              </StatusMessage>
            )}
            {compatibility && (
              <Stack as="section" aria-label="Dialect compatibility" gap="2">
                <Heading as="h3" size="sm">
                  Dialect compatibility
                </Heading>
                <SqlCompatibilityList compatibility={compatibility} />
              </Stack>
            )}
            <Text color="fg.muted" fontSize="sm">
              Checks syntax only, against each dialect&apos;s grammar. It does
              not check whether tables, columns or functions exist.
            </Text>
          </Stack>
        </EditorPanel>
      </ToolPanels>
    </Stack>
  );
}
