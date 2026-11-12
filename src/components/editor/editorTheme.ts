import { createTheme } from '@uiw/codemirror-themes';
import { tags as t } from '@lezer/highlight';

function token(name: string) {
  return `var(--chakra-colors-${name})`;
}

export const editorTheme = createTheme({
  theme: 'dark',
  settings: {
    background: token('navy-950'),
    foreground: token('brand-white'),
    caret: token('brand-green'),
    selection: 'rgba(185, 252, 1, 0.22)',
    selectionMatch: 'rgba(185, 252, 1, 0.12)',
    lineHighlight: 'rgba(1, 49, 205, 0.25)',
    gutterBackground: token('navy-900'),
    gutterForeground: token('navy-300'),
    gutterActiveForeground: token('brand-white'),
    gutterBorder: token('navy-700'),
    fontFamily: 'var(--chakra-fonts-mono)',
  },
  styles: [
    { tag: [t.propertyName, t.tagName], color: token('syntax-property') },
    { tag: [t.string, t.special(t.string)], color: token('syntax-string') },
    { tag: t.number, color: token('syntax-number') },
    { tag: [t.bool, t.null, t.atom], color: token('syntax-atom') },
    {
      tag: [t.keyword, t.definitionKeyword, t.modifier],
      color: token('syntax-keyword'),
    },
    { tag: t.attributeName, color: token('syntax-attribute') },
    {
      tag: [t.comment, t.blockComment, t.lineComment],
      color: token('syntax-comment'),
      fontStyle: 'italic',
    },
    {
      tag: [t.punctuation, t.bracket, t.angleBracket, t.separator],
      color: token('syntax-punctuation'),
    },
    { tag: t.invalid, color: token('syntax-invalid') },
  ],
});
