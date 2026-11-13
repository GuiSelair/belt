import type { EditorDiagnostic } from '@/components/editor/CodeEditor';

import type { JsonPositionedMessage } from './lib/types';

export const JSON_WORKER_THRESHOLD_BYTES = 100_000;

export const JSON_SAMPLE =
  '{"id":9007199254740993,"name":"Kanivete","tags":["beautify","validate","transform"],"private":true,"owner":{"login":"dev","since":"2026-11-12"},"stats":{"tools":6,"requestsToServer":0}}';

export const JSON_PRETTY_SAMPLE = `{
  "id": 9007199254740993,
  "name": "Kanivete",
  "tags": ["beautify", "validate", "transform"],
  "private": true,
  "owner": {
    "login": "dev",
    "since": "2026-11-12"
  },
  "stats": {
    "tools": 6,
    "requestsToServer": 0
  }
}`;

export function isLargeJson({ text }: { text: string }) {
  return text.length >= JSON_WORKER_THRESHOLD_BYTES;
}

export function toDiagnostic(
  message: JsonPositionedMessage,
  severity: EditorDiagnostic['severity'],
): EditorDiagnostic {
  return {
    from: message.offset,
    to: message.offset + 1,
    severity,
    message: message.message,
  };
}

export function formatPosition({ line, column }: JsonPositionedMessage) {
  return `Line ${line}, column ${column}`;
}
