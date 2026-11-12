'use client';

import { SwitchField } from '@/components/form/SwitchField';

import type { JsxBooleanOption } from './lib/formatOptions';

interface BooleanOptionSwitchProps {
  optionKey: JsxBooleanOption;
  label: string;
  checked: boolean;
  onChange(key: JsxBooleanOption, value: boolean): void;
}

export function BooleanOptionSwitch({
  optionKey,
  label,
  checked,
  onChange,
}: BooleanOptionSwitchProps) {
  function handleChange(value: boolean) {
    onChange(optionKey, value);
  }

  return (
    <SwitchField label={label} checked={checked} onChange={handleChange} />
  );
}
