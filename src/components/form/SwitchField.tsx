'use client';

import { Switch } from '@chakra-ui/react';

interface SwitchFieldProps {
  label: string;
  checked: boolean;
  onChange(checked: boolean): void;
  disabled?: boolean;
}

export function SwitchField({
  label,
  checked,
  onChange,
  disabled = false,
}: SwitchFieldProps) {
  function handleCheckedChange(details: Switch.CheckedChangeDetails) {
    onChange(details.checked);
  }

  return (
    <Switch.Root
      checked={checked}
      onCheckedChange={handleCheckedChange}
      disabled={disabled}
      colorPalette="accent"
      size="sm"
      minH="8"
    >
      <Switch.HiddenInput />
      <Switch.Control />
      <Switch.Label>{label}</Switch.Label>
    </Switch.Root>
  );
}
