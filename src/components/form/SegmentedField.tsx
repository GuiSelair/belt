'use client';

import { SegmentGroup } from '@chakra-ui/react';

import type { SelectOption } from './SelectField';

interface SegmentedFieldProps<Value extends string> {
  label: string;
  value: Value;
  options: readonly SelectOption<Value>[];
  onChange(value: NoInfer<Value>): void;
}

export function SegmentedField<Value extends string>({
  label,
  value,
  options,
  onChange,
}: SegmentedFieldProps<Value>) {
  function handleValueChange(details: SegmentGroup.ValueChangeDetails) {
    if (details.value) onChange(details.value as Value);
  }

  return (
    <SegmentGroup.Root
      aria-label={label}
      value={value}
      onValueChange={handleValueChange}
      size="sm"
    >
      <SegmentGroup.Indicator bg="accent.solid" />
      {options.map((option) => (
        <SegmentGroup.Item
          key={option.value}
          value={option.value}
          _checked={{ color: 'accent.contrast' }}
        >
          <SegmentGroup.ItemText>{option.label}</SegmentGroup.ItemText>
          <SegmentGroup.ItemHiddenInput />
        </SegmentGroup.Item>
      ))}
    </SegmentGroup.Root>
  );
}
