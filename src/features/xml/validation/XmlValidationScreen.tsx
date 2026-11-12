'use client';

import { Button, Stack } from '@chakra-ui/react';
import { WandSparkles } from 'lucide-react';

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

import { XmlSummaryList } from './XmlSummaryList';
import { useXmlValidationScreen } from './useXmlValidationScreen';

export function XmlValidationScreen() {
  const {
    input,
    setInput,
    indent,
    setIndent,
    inputEditorRef,
    diagnostics,
    isEmpty,
    summary,
    syntaxError,
    canBeautify,
    beautified,
    isBeautifiedStale,
    handleBeautify,
    handleGoToError,
    handleLoadSample,
    handleClear,
  } = useXmlValidationScreen();

  return (
    <Stack gap="6">
      <ToolToolbar label="Beautify options">
        <SelectField
          label="Indentation"
          value={indent}
          options={indentOptions}
          onChange={setIndent}
        />
        <Button
          size="sm"
          colorPalette="accent"
          onClick={handleBeautify}
          disabled={!canBeautify}
        >
          <WandSparkles aria-hidden="true" />
          Beautify
        </Button>
      </ToolToolbar>

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
            label="XML to validate"
            language="xml"
            value={input}
            onChange={setInput}
            diagnostics={diagnostics}
            placeholder="Paste or type XML here…"
          />
        </EditorPanel>

        <Stack gap="6" minW="0">
          <EditorPanel title="Result">
            {isEmpty && (
              <StatusMessage tone="info" title="Waiting for input">
                Paste XML on the left to check whether it is well-formed.
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

          {beautified && (
            <EditorPanel
              title="Beautified"
              isStale={isBeautifiedStale}
              actions={<CopyButton value={beautified.output} />}
            >
              {beautified.notices.map((notice) => (
                <StatusMessage key={notice} tone="warning" title="Heads up">
                  {notice}
                </StatusMessage>
              ))}
              <CodeEditor
                label="Beautified XML output"
                language="xml"
                value={beautified.output}
                readOnly
              />
            </EditorPanel>
          )}
        </Stack>
      </ToolPanels>
    </Stack>
  );
}
