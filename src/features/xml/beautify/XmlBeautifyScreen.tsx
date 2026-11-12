'use client';

import { Stack } from '@chakra-ui/react';

import { CodeEditor } from '@/components/editor/CodeEditor';
import { SelectField } from '@/components/form/SelectField';
import { CopyButton } from '@/components/tool/CopyButton';
import { EditorPanel } from '@/components/tool/EditorPanel';
import { InputActions } from '@/components/tool/InputActions';
import { StatusMessage } from '@/components/tool/StatusMessage';
import { SyntaxErrorAlert } from '@/components/tool/SyntaxErrorAlert';
import { ToolPanels } from '@/components/tool/ToolPanels';
import { ToolToolbar } from '@/components/tool/ToolToolbar';
import { indentOptions } from '@/lib/indentation';

import { useXmlBeautifyScreen } from './useXmlBeautifyScreen';

export function XmlBeautifyScreen() {
  const {
    input,
    setInput,
    indent,
    setIndent,
    inputEditorRef,
    diagnostics,
    output,
    notices,
    isStale,
    syntaxError,
    handleGoToError,
    handleLoadSample,
    handleClear,
  } = useXmlBeautifyScreen();

  return (
    <Stack gap="6">
      <ToolToolbar label="Formatting options">
        <SelectField
          label="Indentation"
          value={indent}
          options={indentOptions}
          onChange={setIndent}
        />
      </ToolToolbar>

      {syntaxError && (
        <SyntaxErrorAlert
          title="Malformed XML"
          error={syntaxError}
          onGoToError={handleGoToError}
        />
      )}
      {notices.map((notice) => (
        <StatusMessage key={notice} tone="warning" title="Heads up">
          {notice}
        </StatusMessage>
      ))}

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
            label="XML input"
            language="xml"
            value={input}
            onChange={setInput}
            diagnostics={diagnostics}
            placeholder="Paste or type XML here…"
          />
        </EditorPanel>
        <EditorPanel
          title="Output"
          isStale={isStale}
          actions={<CopyButton value={output} />}
        >
          <CodeEditor
            label="Formatted XML output"
            language="xml"
            value={output}
            readOnly
          />
        </EditorPanel>
      </ToolPanels>
    </Stack>
  );
}
