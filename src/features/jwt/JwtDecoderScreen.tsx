'use client';

import { Stack, Text } from '@chakra-ui/react';

import { CodeEditor } from '@/components/editor/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { EditorPanel } from '@/components/tool/EditorPanel';
import { InputActions } from '@/components/tool/InputActions';
import {
  StatusMessage,
  type StatusTone,
} from '@/components/tool/StatusMessage';
import { ToolPanels } from '@/components/tool/ToolPanels';

import { JwtClaimsList } from './JwtClaimsList';
import type { ClaimRow, JwtDescription, JwtStatus } from './lib/describeClaims';
import { useJwtDecoderScreen } from './useJwtDecoderScreen';

const statusMessages: Record<JwtStatus, { tone: StatusTone; title: string }> = {
  active: { tone: 'success', title: 'Token is active' },
  expired: { tone: 'warning', title: 'Token expired' },
  'not-yet-valid': { tone: 'warning', title: 'Token is not valid yet' },
  'no-expiry': { tone: 'info', title: 'Token never expires' },
};

function buildRows(description: JwtDescription): ClaimRow[] {
  const headerRows: ClaimRow[] = [
    { key: 'alg', label: 'Algorithm', value: description.algorithm ?? '—' },
    { key: 'typ', label: 'Type', value: description.type ?? '—' },
  ];
  return [...headerRows, ...description.claims];
}

export function JwtDecoderScreen() {
  const {
    input,
    setInput,
    canRun,
    hasRun,
    token,
    description,
    decodeError,
    handleRun,
    handleClear,
  } = useJwtDecoderScreen();

  const status = description ? statusMessages[description.status] : null;

  return (
    <Stack gap="6">
      <ToolPanels>
        <EditorPanel
          title="Encoded token"
          actions={
            <InputActions
              runLabel="Decode"
              canRun={canRun}
              onRun={handleRun}
              onClear={handleClear}
            />
          }
        >
          <CodeEditor
            label="JWT to decode"
            language="text"
            value={input}
            onChange={setInput}
            minHeight="16rem"
            placeholder="Paste a JWT here…"
          />
        </EditorPanel>
        <EditorPanel title="Result">
          {!hasRun && (
            <StatusMessage tone="info" title="Ready to decode">
              Paste a JWT on the left and click Decode.
            </StatusMessage>
          )}
          {decodeError && (
            <StatusMessage tone="error" title="Invalid token">
              {decodeError.message}
            </StatusMessage>
          )}
          {description && status && (
            <StatusMessage tone={status.tone} title={status.title}>
              <JwtClaimsList rows={buildRows(description)} />
            </StatusMessage>
          )}
          {token && (
            <Text color="fg.muted" fontSize="sm">
              The signature is shown as is and is not verified.
            </Text>
          )}
        </EditorPanel>
      </ToolPanels>

      {token && (
        <ToolPanels>
          <EditorPanel
            title="Header"
            actions={<CopyButton value={token.headerJson} />}
          >
            <CodeEditor
              label="Decoded header"
              language="json"
              value={token.headerJson}
              minHeight="10rem"
              readOnly
            />
          </EditorPanel>
          <EditorPanel
            title="Payload"
            actions={<CopyButton value={token.payloadJson} />}
          >
            <CodeEditor
              label="Decoded payload"
              language="json"
              value={token.payloadJson}
              minHeight="10rem"
              readOnly
            />
          </EditorPanel>
        </ToolPanels>
      )}
    </Stack>
  );
}
