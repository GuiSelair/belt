'use client';

import { memo } from 'react';

import {
  Badge,
  Button,
  Flex,
  HStack,
  IconButton,
  List,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Plus, Trash2 } from 'lucide-react';

import { SelectField } from '@/components/form/SelectField';
import { TextField } from '@/components/form/TextField';

import type { ParamEntry, ParamSuggestion } from '../lib/types';

type ParamPatch = Partial<Pick<ParamEntry, 'key' | 'value'>>;

interface ParamsEditorProps {
  params: ParamEntry[];
  suggestedParams: readonly ParamSuggestion[];
  availableSuggestions: readonly ParamSuggestion[];
  onAddSuggested(key: string): void;
  onAddCustom(): void;
  onChange(id: string, patch: ParamPatch): void;
  onRemove(id: string): void;
}

interface ParamRowProps {
  param: ParamEntry;
  suggestion?: ParamSuggestion;
  onChange: ParamsEditorProps['onChange'];
  onRemove: ParamsEditorProps['onRemove'];
}

const ParamRow = memo(function ParamRow({
  param,
  suggestion,
  onChange,
  onRemove,
}: ParamRowProps) {
  const name = param.key || 'new parameter';
  const valueOptions = param.origin === 'suggested' ? suggestion?.values : null;

  function handleKeyChange(key: string) {
    onChange(param.id, { key });
  }

  function handleValueChange(value: string) {
    onChange(param.id, { value });
  }

  function handleRemove() {
    onRemove(param.id);
  }

  return (
    <HStack align="flex-start" gap="3">
      <TextField
        label="Key"
        value={param.key}
        onChange={handleKeyChange}
        readOnly={param.origin === 'suggested'}
        flex="1"
      />
      {valueOptions ? (
        <SelectField
          label={`Value of ${name}`}
          value={param.value}
          options={valueOptions.map((value) => ({ value, label: value }))}
          onChange={handleValueChange}
          width="auto"
        />
      ) : (
        <TextField
          label={`Value of ${name}`}
          value={param.value}
          onChange={handleValueChange}
          flex="1"
        />
      )}
      <IconButton
        aria-label={`Remove ${name}`}
        variant="ghost"
        size="sm"
        mt="6"
        onClick={handleRemove}
      >
        <Trash2 aria-hidden="true" />
      </IconButton>
    </HStack>
  );
});

interface SuggestionItemProps {
  suggestion: ParamSuggestion;
  onAdd(key: string): void;
}

const SuggestionItem = memo(function SuggestionItem({
  suggestion,
  onAdd,
}: SuggestionItemProps) {
  function handleAdd() {
    onAdd(suggestion.key);
  }

  return (
    <List.Item>
      <Flex align="center" justify="space-between" gap="3" w="full">
        <Stack gap="0.5" minW="0">
          <HStack gap="2">
            <Text fontFamily="mono" fontSize="sm" color="fg">
              {suggestion.key}
            </Text>
            {suggestion.driverSpecific && (
              <Badge size="sm" variant="outline">
                Driver-specific
              </Badge>
            )}
          </HStack>
          <Text fontSize="sm" color="fg.muted">
            {suggestion.description}
            {suggestion.driverSpecific &&
              ' Support depends on the driver or library you use.'}
          </Text>
        </Stack>
        <Button
          size="xs"
          variant="outline"
          aria-label={`Add ${suggestion.key}`}
          onClick={handleAdd}
        >
          <Plus aria-hidden="true" />
          Add
        </Button>
      </Flex>
    </List.Item>
  );
});

export function ParamsEditor({
  params,
  suggestedParams,
  availableSuggestions,
  onAddSuggested,
  onAddCustom,
  onChange,
  onRemove,
}: ParamsEditorProps) {
  return (
    <Stack gap="4">
      {params.length > 0 && (
        <Stack gap="3">
          {params.map((param) => (
            <ParamRow
              key={param.id}
              param={param}
              suggestion={suggestedParams.find(({ key }) => key === param.key)}
              onChange={onChange}
              onRemove={onRemove}
            />
          ))}
        </Stack>
      )}
      <Button
        size="sm"
        variant="outline"
        alignSelf="flex-start"
        onClick={onAddCustom}
      >
        <Plus aria-hidden="true" />
        Add custom parameter
      </Button>
      {availableSuggestions.length > 0 && (
        <Stack gap="2">
          <Text as="h3" fontSize="sm" fontWeight="semibold" color="fg.muted">
            Suggested parameters
          </Text>
          <List.Root variant="plain" gap="3">
            {availableSuggestions.map((suggestion) => (
              <SuggestionItem
                key={suggestion.key}
                suggestion={suggestion}
                onAdd={onAddSuggested}
              />
            ))}
          </List.Root>
        </Stack>
      )}
    </Stack>
  );
}
