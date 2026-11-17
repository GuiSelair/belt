'use client';

import {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type Ref,
} from 'react';
import { Box } from '@chakra-ui/react';
import { lintGutter, setDiagnostics } from '@codemirror/lint';
import { EditorView } from '@codemirror/view';
import CodeMirror from '@uiw/react-codemirror';

import { editorTheme } from './editorTheme';
import { getLanguageExtension, type EditorLanguage } from './editorLanguages';

export interface EditorDiagnostic {
  from: number;
  to: number;
  severity: 'error' | 'warning';
  message: string;
}

export interface CodeEditorHandle {
  focusAt(offset: number): void;
}

interface CodeEditorProps {
  value: string;
  onChange?(value: string): void;
  language: EditorLanguage;
  label: string;
  readOnly?: boolean;
  diagnostics?: readonly EditorDiagnostic[];
  placeholder?: string;
  minHeight?: string;
  ref?: Ref<CodeEditorHandle>;
}

const NO_DIAGNOSTICS: readonly EditorDiagnostic[] = [];

function clampDiagnostics(
  diagnostics: readonly EditorDiagnostic[],
  length: number,
) {
  return diagnostics.map((diagnostic) => {
    const from = Math.min(diagnostic.from, length);
    return {
      ...diagnostic,
      from,
      to: Math.min(Math.max(diagnostic.to, from), length),
    };
  });
}

export function CodeEditor({
  value,
  onChange,
  language,
  label,
  readOnly = false,
  diagnostics = NO_DIAGNOSTICS,
  placeholder,
  minHeight = '24rem',
  ref,
}: CodeEditorProps) {
  const viewRef = useRef<EditorView | null>(null);

  const extensions = useMemo(
    () => [
      getLanguageExtension(language),
      lintGutter(),
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({ 'aria-label': label }),
    ],
    [language, label],
  );

  useImperativeHandle(
    ref,
    () => ({
      focusAt(offset: number) {
        const view = viewRef.current;
        if (!view) return;
        const anchor = Math.min(offset, view.state.doc.length);
        view.dispatch({ selection: { anchor }, scrollIntoView: true });
        view.focus();
      },
    }),
    [],
  );

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const safeDiagnostics = clampDiagnostics(
      diagnostics,
      view.state.doc.length,
    );
    view.dispatch(setDiagnostics(view.state, safeDiagnostics));
  }, [diagnostics, value]);

  function handleCreateEditor(view: EditorView) {
    viewRef.current = view;
  }

  return (
    <Box
      borderWidth="1px"
      borderColor="border"
      rounded="lg"
      overflow="hidden"
      css={{
        '& .cm-editor': { minHeight, maxHeight: '70vh' },
        '& .cm-editor.cm-focused': { outline: 'none' },
        '&:focus-within': {
          outline: '2px solid var(--chakra-colors-brand-green)',
          outlineOffset: '2px',
        },
        '& .cm-scroller': { fontSize: '0.875rem', lineHeight: '1.6' },
        '& .cm-placeholder': { color: 'var(--chakra-colors-navy-300)' },
      }}
    >
      <CodeMirror
        value={value}
        onChange={onChange}
        theme={editorTheme}
        extensions={extensions}
        readOnly={readOnly}
        indentWithTab={false}
        placeholder={placeholder}
        onCreateEditor={handleCreateEditor}
        basicSetup={{
          autocompletion: false,
          highlightActiveLine: !readOnly,
          highlightActiveLineGutter: !readOnly,
          searchKeymap: true,
        }}
      />
    </Box>
  );
}
