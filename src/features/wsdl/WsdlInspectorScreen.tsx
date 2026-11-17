'use client';

import { Flex, Stack, Text } from '@chakra-ui/react';

import { CodeEditor } from '@/components/editor/CodeEditor';
import { SelectField } from '@/components/form/SelectField';
import { CopyButton } from '@/components/tool/CopyButton';
import { EditorPanel } from '@/components/tool/EditorPanel';
import { InputActions } from '@/components/tool/InputActions';
import { ProcessingIndicator } from '@/components/tool/ProcessingIndicator';
import { StatusMessage } from '@/components/tool/StatusMessage';
import { SyntaxErrorAlert } from '@/components/tool/SyntaxErrorAlert';
import { ToolPanels } from '@/components/tool/ToolPanels';

import { WsdlDetailsList } from './WsdlDetailsList';
import { useWsdlInspectorScreen } from './useWsdlInspectorScreen';

export function WsdlInspectorScreen() {
  const {
    input,
    setInput,
    inputEditorRef,
    diagnostics,
    canRun,
    hasRun,
    isInspecting,
    syntaxError,
    wsdlError,
    taskError,
    notices,
    port,
    operation,
    portOptions,
    operationOptions,
    handlePortChange,
    handleOperationChange,
    handleRun,
    handleClear,
    handleGoToError,
  } = useWsdlInspectorScreen();

  return (
    <Stack gap="6">
      {syntaxError && (
        <SyntaxErrorAlert
          title="Malformed XML"
          error={syntaxError}
          onGoToError={handleGoToError}
        />
      )}
      {wsdlError && (
        <StatusMessage tone="error" title="Invalid WSDL">
          {wsdlError}
        </StatusMessage>
      )}
      {taskError && (
        <StatusMessage tone="error" title="Inspection failed">
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
          title="WSDL input"
          actions={
            <InputActions
              runLabel="Inspect"
              canRun={canRun}
              onRun={handleRun}
              onClear={handleClear}
            />
          }
        >
          <CodeEditor
            ref={inputEditorRef}
            label="WSDL input"
            language="xml"
            value={input}
            onChange={setInput}
            diagnostics={diagnostics}
            placeholder="Paste a WSDL 1.1 document here…"
          />
        </EditorPanel>
        <EditorPanel
          title="Service details"
          actions={isInspecting && <ProcessingIndicator label="Inspecting…" />}
        >
          {!hasRun && (
            <StatusMessage tone="info" title="Ready to inspect">
              Paste a WSDL on the left and click Inspect.
            </StatusMessage>
          )}
          {port && (
            <Stack gap="5">
              <Flex gap="4" wrap="wrap">
                <SelectField
                  label="Port"
                  value={port.id}
                  options={portOptions}
                  onChange={handlePortChange}
                  width="72"
                />
                <SelectField
                  label="Operation"
                  value={operation?.name ?? ''}
                  options={operationOptions}
                  onChange={handleOperationChange}
                  width="56"
                />
              </Flex>
              {operation?.documentation && (
                <Text color="fg.muted">{operation.documentation}</Text>
              )}
              <WsdlDetailsList port={port} operation={operation} />
            </Stack>
          )}
        </EditorPanel>
      </ToolPanels>

      {operation && (
        <EditorPanel
          title="Request envelope"
          actions={
            <CopyButton value={operation.envelope} label="Copy envelope" />
          }
        >
          <CodeEditor
            label="Request envelope"
            language="xml"
            value={operation.envelope}
            readOnly
          />
        </EditorPanel>
      )}
    </Stack>
  );
}
