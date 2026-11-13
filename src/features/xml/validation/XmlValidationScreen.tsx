'use client';

import { CodeEditor } from '@/components/editor/CodeEditor';
import { EditorPanel } from '@/components/tool/EditorPanel';
import { InputActions } from '@/components/tool/InputActions';
import { StatusMessage } from '@/components/tool/StatusMessage';
import { SyntaxErrorAlert } from '@/components/tool/SyntaxErrorAlert';
import { ToolPanels } from '@/components/tool/ToolPanels';

import { XmlSummaryList } from './XmlSummaryList';
import { useXmlValidationScreen } from './useXmlValidationScreen';

export function XmlValidationScreen() {
  const {
    input,
    setInput,
    inputEditorRef,
    diagnostics,
    canRun,
    hasRun,
    summary,
    syntaxError,
    handleRun,
    handleGoToError,
    handleClear,
  } = useXmlValidationScreen();

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
          label="XML to validate"
          language="xml"
          value={input}
          onChange={setInput}
          diagnostics={diagnostics}
          placeholder="Paste or type XML here…"
        />
      </EditorPanel>
      <EditorPanel title="Result">
        {!hasRun && (
          <StatusMessage tone="info" title="Ready to validate">
            Paste XML on the left and click Validate.
          </StatusMessage>
        )}
        {syntaxError && (
          <SyntaxErrorAlert
            title="Malformed XML"
            error={syntaxError}
            onGoToError={handleGoToError}
          />
        )}
        {summary && (
          <StatusMessage tone="success" title="Valid XML">
            <XmlSummaryList summary={summary} />
          </StatusMessage>
        )}
      </EditorPanel>
    </ToolPanels>
  );
}
