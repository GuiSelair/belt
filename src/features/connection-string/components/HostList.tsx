'use client';

import { memo } from 'react';

import { Button, HStack, IconButton, Stack } from '@chakra-ui/react';
import { Plus, Trash2 } from 'lucide-react';

import { TextField } from '@/components/form/TextField';

import type { ResolvedEngine } from '../lib/resolveEngine';
import type { HostEntry } from '../lib/types';
import {
  hostFieldId,
  portFieldId,
  type FieldErrors,
} from '../lib/validateConnectionForm';

interface HostListProps {
  hosts: HostEntry[];
  resolved: ResolvedEngine;
  fieldErrors: FieldErrors;
  portPlaceholder: string;
  onChange(id: string, patch: Partial<Omit<HostEntry, 'id'>>): void;
  onAdd(): void;
  onRemove(id: string): void;
}

interface HostRowProps {
  entry: HostEntry;
  index: number;
  showPort: boolean;
  canRemove: boolean;
  hostError?: string;
  portError?: string;
  portPlaceholder: string;
  onChange: HostListProps['onChange'];
  onRemove: HostListProps['onRemove'];
}

const HostRow = memo(function HostRow({
  entry,
  index,
  showPort,
  canRemove,
  hostError,
  portError,
  portPlaceholder,
  onChange,
  onRemove,
}: HostRowProps) {
  const suffix = index === 0 ? '' : ` ${index + 1}`;

  function handleHostChange(host: string) {
    onChange(entry.id, { host });
  }

  function handlePortChange(port: string) {
    onChange(entry.id, { port });
  }

  function handleRemove() {
    onRemove(entry.id);
  }

  return (
    <HStack align="flex-start" gap="3">
      <TextField
        label={`Host${suffix}`}
        value={entry.host}
        onChange={handleHostChange}
        error={hostError}
        placeholder="localhost"
        required
        flex="3"
      />
      {showPort && (
        <TextField
          label={`Port${suffix}`}
          value={entry.port}
          onChange={handlePortChange}
          error={portError}
          placeholder={portPlaceholder}
          inputMode="numeric"
          flex="1"
        />
      )}
      {canRemove && (
        <IconButton
          aria-label={`Remove host${suffix || ' 1'}`}
          variant="ghost"
          size="sm"
          mt="6"
          onClick={handleRemove}
        >
          <Trash2 aria-hidden="true" />
        </IconButton>
      )}
    </HStack>
  );
});

export function HostList({
  hosts,
  resolved,
  fieldErrors,
  portPlaceholder,
  onChange,
  onAdd,
  onRemove,
}: HostListProps) {
  const visibleHosts = resolved.allowsMultipleHosts ? hosts : hosts.slice(0, 1);

  return (
    <Stack gap="3">
      {visibleHosts.map((entry, index) => (
        <HostRow
          key={entry.id}
          entry={entry}
          index={index}
          showPort={resolved.defaultPort !== null}
          canRemove={visibleHosts.length > 1}
          hostError={fieldErrors[hostFieldId(entry.id)]}
          portError={fieldErrors[portFieldId(entry.id)]}
          portPlaceholder={portPlaceholder}
          onChange={onChange}
          onRemove={onRemove}
        />
      ))}
      {resolved.allowsMultipleHosts && (
        <Button
          size="sm"
          variant="outline"
          alignSelf="flex-start"
          onClick={onAdd}
        >
          <Plus aria-hidden="true" />
          Add host
        </Button>
      )}
    </Stack>
  );
}
