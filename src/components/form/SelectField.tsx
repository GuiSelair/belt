'use client';

import type { ChangeEvent } from 'react';

import { Field, NativeSelect } from '@chakra-ui/react';

export interface SelectOption<Value extends string> {
  value: Value;
  label: string;
}

interface SelectFieldProps<Value extends string> {
  label: string;
  value: Value;
  options: readonly SelectOption<Value>[];
  onChange(value: NoInfer<Value>): void;
  disabled?: boolean;
  width?: string;
}

export function SelectField<Value extends string>({
  label,
  value,
  options,
  onChange,
  disabled = false,
  width = '40',
}: SelectFieldProps<Value>) {
  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    onChange(event.target.value as Value);
  }

  return (
    <Field.Root width={width} disabled={disabled}>
      <Field.Label>{label}</Field.Label>
      <NativeSelect.Root size="sm">
        <NativeSelect.Field value={value} onChange={handleChange}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
    </Field.Root>
  );
}
