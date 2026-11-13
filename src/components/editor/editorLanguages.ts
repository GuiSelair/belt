import type { Extension } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { sql } from '@codemirror/lang-sql';
import { xml } from '@codemirror/lang-xml';

export type EditorLanguage = 'json' | 'jsx' | 'tsx' | 'xml' | 'sql' | 'text';

const languageFactories: Record<EditorLanguage, () => Extension> = {
  json: () => json(),
  jsx: () => javascript({ jsx: true }),
  tsx: () => javascript({ jsx: true, typescript: true }),
  xml: () => xml(),
  sql: () => sql(),
  text: () => [],
};

export function getLanguageExtension(language: EditorLanguage): Extension {
  return languageFactories[language]();
}
