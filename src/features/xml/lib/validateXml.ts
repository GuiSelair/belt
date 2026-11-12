import { SyntaxValidator } from 'fast-xml-validator';

import { lineColumnToOffset, offsetToLineColumn } from '@/lib/textPosition';

import { summarizeXml, type XmlSummary } from './summarizeXml';
import {
  getStartOffset,
  getTagName,
  parseOrderedXml,
  type OrderedNode,
} from './xmlNodes';

export interface XmlSyntaxError {
  message: string;
  line: number;
  column: number;
  offset: number;
}

export type XmlValidationResult =
  { ok: true; summary: XmlSummary } | { ok: false; error: XmlSyntaxError };

interface ValidatorError {
  message: string;
  line: number;
  col: number;
}

function isValidatorError(error: unknown): error is ValidatorError {
  return error instanceof Error && 'line' in error && 'col' in error;
}

function errorAt(text: string, message: string, offset: number) {
  return { message, offset, ...offsetToLineColumn(text, offset) };
}

export function findRootElements(nodes: OrderedNode[]) {
  return nodes.filter((node) => getTagName(node) !== null);
}

export function validateXml(text: string): XmlValidationResult {
  try {
    SyntaxValidator.validate(text);
  } catch (error) {
    if (!isValidatorError(error)) throw error;
    return {
      ok: false,
      error: {
        message: error.message,
        line: error.line,
        column: error.col,
        offset: lineColumnToOffset(text, error.line, error.col),
      },
    };
  }

  const roots = findRootElements(
    parseOrderedXml(text, { captureMetaData: true }),
  );
  if (roots.length > 1) {
    const offset = getStartOffset(roots[1]) ?? 0;
    return {
      ok: false,
      error: errorAt(
        text,
        'An XML document must have exactly one root element.',
        offset,
      ),
    };
  }

  return { ok: true, summary: summarizeXml(roots[0]) };
}
