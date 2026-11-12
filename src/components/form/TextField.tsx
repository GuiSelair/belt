'use client';

import type { ChangeEvent, HTMLAttributes } from 'react';

import { Field, Input } from '@chakra-ui/react';

interface TextFieldProps {
  label: string;
  value: string;
  onChange(value: string): void;
  error?: string;
  helperText?: string;
  placeholder?: string;
  type?: 'text' | 'password';
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
  autoComplete?: string;
  required?: boolean;
  readOnly?: boolean;
  flex?: string;
}

export function TextField({
  label,
  value,
  onChange,
  error,
  helperText,
  placeholder,
  type = 'text',
  inputMode,
  autoComplete = 'off',
  required = false,
  readOnly = false,
  flex,
}: TextFieldProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value);
  }

  return (
    <Field.Root invalid={Boolean(error)} required={required} flex={flex}>
      <Field.Label>
        {label}
        <Field.RequiredIndicator />
      </Field.Label>
      <Input
        size="sm"
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        readOnly={readOnly}
        spellCheck={false}
      />
      {helperText && !error && (
        <Field.HelperText>{helperText}</Field.HelperText>
      )}
      <Field.ErrorText>{error}</Field.ErrorText>
    </Field.Root>
  );
}
