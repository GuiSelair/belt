import type { EditorDiagnostic } from '@/components/editor/CodeEditor';

import type { JsonPositionedMessage } from './lib/types';

export const JSON_SAMPLE =
  '{"id":9007199254740993,"name":"Belt","tags":["beautify","validate","transform"],"private":true,"owner":{"login":"dev","since":"2026-11-12"},"stats":{"tools":6,"requestsToServer":0}}';

export const JSON_PRETTY_SAMPLE = `{
  "id": 9007199254740993,
  "name": "Belt",
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

export const JSON_SCHEMA_SAMPLE = `{
  "id": "4f1c2b8e-9d3a-4e7b-a6f5-2c8d1e0b7a93",
  "name": "Belt",
  "homepage": "https://github.com/GuiSelair/belt",
  "private": false,
  "createdAt": "2026-11-12T09:30:00Z",
  "owner": {
    "login": "dev",
    "email": "dev@example.com"
  },
  "tools": [
    { "name": "JSON Beautify", "uses": 1280, "rating": 4.8 },
    { "name": "XML to XSD", "uses": 342, "rating": 5, "beta": true }
  ],
  "tags": ["beautify", "validate", "transform"],
  "license": null
}`;

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
