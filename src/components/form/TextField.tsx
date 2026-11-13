'use client';

import { useState, type ChangeEvent, type HTMLAttributes } from 'react';

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
  const [isTouched, setIsTouched] = useState(false);
  const visibleError = isTouched ? error : undefined;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value);
  }

  function handleBlur() {
    setIsTouched(true);
  }

  return (
    <Field.Root invalid={Boolean(visibleError)} required={required} flex={flex}>
      <Field.Label>
        {label}
        <Field.RequiredIndicator />
      </Field.Label>
      <Input
        size="sm"
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        readOnly={readOnly}
        spellCheck={false}
      />
      {helperText && !visibleError && (
        <Field.HelperText>{helperText}</Field.HelperText>
      )}
      <Field.ErrorText>{visibleError}</Field.ErrorText>
    </Field.Root>
  );
}
