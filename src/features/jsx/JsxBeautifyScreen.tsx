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

import { BooleanOptionSwitch } from './BooleanOptionSwitch';
import {
  booleanOptions,
  printWidthOptions,
  tabWidthOptions,
  trailingCommaOptions,
  useJsxBeautifyScreen,
} from './useJsxBeautifyScreen';

export function JsxBeautifyScreen() {
  const {
    input,
    setInput,
    options,
    setOption,
    handlePrintWidthChange,
    handleTabWidthChange,
    handleTrailingCommaChange,
    output,
    isStale,
    processingLabel,
    syntaxError,
    taskError,
    diagnostics,
    inputEditorRef,
    handleLoadSample,
    handleClear,
    handleGoToError,
  } = useJsxBeautifyScreen();
  const language = options.typescript ? 'tsx' : 'jsx';

  return (
    <Stack gap="6">
      <ToolToolbar label="Prettier options">
        <SelectField
          label="Print width"
          value={String(options.printWidth)}
          options={printWidthOptions}
          onChange={handlePrintWidthChange}
          width="28"
        />
        <SelectField
          label="Tab width"
          value={String(options.tabWidth)}
          options={tabWidthOptions}
          onChange={handleTabWidthChange}
          width="24"
        />
        <SelectField
          label="Trailing commas"
          value={options.trailingComma}
          options={trailingCommaOptions}
          onChange={handleTrailingCommaChange}
          width="32"
        />
        {booleanOptions.map((option) => (
          <BooleanOptionSwitch
            key={option.key}
            optionKey={option.key}
            label={option.label}
            checked={options[option.key]}
            onChange={setOption}
          />
        ))}
      </ToolToolbar>

      {syntaxError && (
        <SyntaxErrorAlert error={syntaxError} onGoToError={handleGoToError} />
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
            label="JSX input"
            language={language}
            value={input}
            onChange={setInput}
            diagnostics={diagnostics}
            placeholder="Paste a JSX or TSX snippet here…"
          />
        </EditorPanel>
        <EditorPanel
          title="Output"
          isStale={isStale}
          actions={
            <>
              {processingLabel && (
                <ProcessingIndicator label={processingLabel} />
              )}
              <CopyButton value={output} />
            </>
          }
        >
          <CodeEditor
            label="Formatted JSX output"
            language={language}
            value={output}
            readOnly
          />
        </EditorPanel>
      </ToolPanels>
    </Stack>
  );
}
