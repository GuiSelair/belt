export type TrailingCommaOption = 'all' | 'es5' | 'none';

export interface JsxFormatOptions {
  printWidth: number;
  tabWidth: number;
  useTabs: boolean;
  singleQuote: boolean;
  jsxSingleQuote: boolean;
  semi: boolean;
  trailingComma: TrailingCommaOption;
  bracketSameLine: boolean;
  typescript: boolean;
}

export type JsxBooleanOption = {
  [Key in keyof JsxFormatOptions]: JsxFormatOptions[Key] extends boolean
    ? Key
    : never;
}[keyof JsxFormatOptions];

export const defaultJsxFormatOptions: JsxFormatOptions = {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  singleQuote: false,
  jsxSingleQuote: false,
  semi: true,
  trailingComma: 'all',
  bracketSameLine: false,
  typescript: false,
};
