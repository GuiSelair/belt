'use client';

import { CodeEditor } from '@/components/editor/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { EditorPanel } from '@/components/tool/EditorPanel';
import { InputActions } from '@/components/tool/InputActions';
import { ProcessingIndicator } from '@/components/tool/ProcessingIndicator';
import { StatusMessage } from '@/components/tool/StatusMessage';
import { SyntaxErrorAlert } from '@/components/tool/SyntaxErrorAlert';
import { ToolPanels } from '@/components/tool/ToolPanels';

import type { JsonFormatter } from './useJsonFormatter';

interface JsonFormatterViewProps {
  formatter: JsonFormatter;
  outputLabel: string;
  processingLabel: string;
}

export function JsonFormatterView({
  formatter,
  outputLabel,
  processingLabel,
}: JsonFormatterViewProps) {
  const {
    input,
    setInput,
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
  } = formatter;

  return (
    <>
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
                <ProcessingIndicator label={processingLabel} />
              )}
              <CopyButton value={output} />
            </>
          }
        >
          <CodeEditor
            label={outputLabel}
            language="json"
            value={output}
            readOnly
          />
        </EditorPanel>
      </ToolPanels>
    </>
  );
}
