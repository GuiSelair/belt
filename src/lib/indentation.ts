export type IndentOption = '2' | '4' | 'tab';

const INDENT_UNITS: Record<IndentOption, string> = {
  '2': '  ',
  '4': '    ',
  tab: '\t',
};

export const indentOptions: { value: IndentOption; label: string }[] = [
  { value: '2', label: '2 spaces' },
  { value: '4', label: '4 spaces' },
  { value: 'tab', label: 'Tab' },
];

export function toIndentUnit(option: IndentOption): string {
  return INDENT_UNITS[option];
}
