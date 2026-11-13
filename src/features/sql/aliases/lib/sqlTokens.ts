export type SqlTokenKind = 'word' | 'quoted' | 'string' | 'symbol';

export interface SqlToken {
  kind: SqlTokenKind;
  text: string;
  start: number;
  end: number;
}

const WORD_START = /[\p{L}_@#$]/u;
const WORD_PART = /[\p{L}\p{N}_@#$]/u;
const DIGIT = /[0-9]/;
const QUOTE_CLOSERS: Record<string, string> = { '"': '"', '`': '`' };

function skipQuoted(text: string, from: number, closer: string) {
  let index = from + 1;
  while (index < text.length) {
    if (text[index] === closer) {
      if (text[index + 1] === closer) {
        index += 2;
        continue;
      }
      return index + 1;
    }
    if (text[index] === '\\' && closer === "'") index++;
    index++;
  }
  return text.length;
}

/**
 * Splits SQL into tokens, skipping whitespace and comments. It only needs to
 * be precise about boundaries (strings, quoted names, comments, parentheses),
 * not about the meaning of each token.
 */
export function tokenizeSql(text: string): SqlToken[] {
  const tokens: SqlToken[] = [];
  let index = 0;

  while (index < text.length) {
    const char = text[index];
    const next = text[index + 1];

    if (/\s/.test(char)) {
      index++;
    } else if (char === '-' && next === '-') {
      const lineEnd = text.indexOf('\n', index);
      index = lineEnd === -1 ? text.length : lineEnd + 1;
    } else if (char === '/' && next === '*') {
      const commentEnd = text.indexOf('*/', index + 2);
      index = commentEnd === -1 ? text.length : commentEnd + 2;
    } else if (char === "'") {
      const end = skipQuoted(text, index, "'");
      tokens.push({
        kind: 'string',
        text: text.slice(index, end),
        start: index,
        end,
      });
      index = end;
    } else if (char in QUOTE_CLOSERS) {
      const end = skipQuoted(text, index, QUOTE_CLOSERS[char]);
      tokens.push({
        kind: 'quoted',
        text: text.slice(index, end),
        start: index,
        end,
      });
      index = end;
    } else if (WORD_START.test(char) || DIGIT.test(char)) {
      let end = index + 1;
      while (
        end < text.length &&
        (WORD_PART.test(text[end]) || (text[end] === '.' && DIGIT.test(char)))
      ) {
        end++;
      }
      tokens.push({
        kind: 'word',
        text: text.slice(index, end),
        start: index,
        end,
      });
      index = end;
    } else {
      tokens.push({ kind: 'symbol', text: char, start: index, end: index + 1 });
      index++;
    }
  }

  return tokens;
}
