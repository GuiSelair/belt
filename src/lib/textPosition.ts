export interface LineColumn {
  line: number;
  column: number;
}

export function offsetToLineColumn(text: string, offset: number): LineColumn {
  const end = Math.min(Math.max(offset, 0), text.length);
  let line = 1;
  let lineStart = 0;

  for (let index = 0; index < end; index++) {
    if (text.charCodeAt(index) === 10) {
      line++;
      lineStart = index + 1;
    }
  }

  return { line, column: end - lineStart + 1 };
}

export function lineColumnToOffset(
  text: string,
  line: number,
  column: number,
): number {
  let currentLine = 1;
  let index = 0;

  while (currentLine < line && index < text.length) {
    if (text.charCodeAt(index) === 10) currentLine++;
    index++;
  }

  if (currentLine < line) return text.length;
  return Math.min(index + Math.max(column - 1, 0), text.length);
}
