'use client';

import { Stack } from '@chakra-ui/react';

import { CodeEditor } from '@/components/editor/CodeEditor';
import { SegmentedField } from '@/components/form/SegmentedField';
import { SelectField } from '@/components/form/SelectField';
import { CopyButton } from '@/components/tool/CopyButton';
import { EditorPanel } from '@/components/tool/EditorPanel';
import { InputActions } from '@/components/tool/InputActions';
import { ProcessingIndicator } from '@/components/tool/ProcessingIndicator';
import { StatusMessage } from '@/components/tool/StatusMessage';
import { SyntaxErrorAlert } from '@/components/tool/SyntaxErrorAlert';
import { ToolPanels } from '@/components/tool/ToolPanels';
import { ToolToolbar } from '@/components/tool/ToolToolbar';

import {
  compositorOptions,
  styleOptions,
  useXmlToXsdScreen,
} from './useXmlToXsdScreen';

export function XmlToXsdScreen() {
  const {
    input,
    setInput,
    style,
    setStyle,
    compositor,
    setCompositor,
    inputEditorRef,
    diagnostics,
    xsd,
    notices,
    canRun,
    syntaxError,
    taskError,
    isStale,
    isGenerating,
    isLargeInput,
    handleRun,
    handleClear,
    handleGoToError,
  } = useXmlToXsdScreen();

  return (
    <Stack gap="6">
      <ToolToolbar label="Schema options">
        <SelectField
          label="Design style"
          value={style}
          options={styleOptions}
          onChange={setStyle}
        />
        <SegmentedField
          label="Child order"
          value={compositor}
          options={compositorOptions}
          onChange={setCompositor}
        />
      </ToolToolbar>

      {isLargeInput && (
        <StatusMessage tone="warning" title="Large document">
          Inputs above 5 MB may take longer to process.
        </StatusMessage>
      )}
      {syntaxError && (
        <SyntaxErrorAlert
          title="Malformed XML"
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
          title="XML input"
          actions={
            <InputActions
              runLabel="Generate"
              canRun={canRun}
              onRun={handleRun}
              onClear={handleClear}
            />
          }
        >
          <CodeEditor
            ref={inputEditorRef}
            label="XML input"
            language="xml"
            value={input}
            onChange={setInput}
            diagnostics={diagnostics}
            placeholder="Paste a sample XML document here…"
          />
        </EditorPanel>
        <EditorPanel
          title="XSD output"
          isStale={isStale}
          actions={
            <>
              {isGenerating && <ProcessingIndicator label="Generating…" />}
              <CopyButton value={xsd} />
            </>
          }
        >
          <CodeEditor
            label="Generated XSD output"
            language="xml"
            value={xsd}
            readOnly
          />
        </EditorPanel>
      </ToolPanels>
    </Stack>
  );
}
