import type { Extension } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';

export type EditorLanguage = 'json' | 'jsx' | 'tsx' | 'xml' | 'text';

const languageFactories: Record<EditorLanguage, () => Extension> = {
  json: () => json(),
  jsx: () => javascript({ jsx: true }),
  tsx: () => javascript({ jsx: true, typescript: true }),
  xml: () => xml(),
  text: () => [],
};

export function getLanguageExtension(language: EditorLanguage): Extension {
  return languageFactories[language]();
}
