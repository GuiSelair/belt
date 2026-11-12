import type { JsonEntry, JsonNode } from './types';

export interface PrintJsonOptions {
  /** Indentation unit. An empty string produces minified output. */
  indent: string;
  sortKeys: boolean;
}

function compareKeys(left: JsonEntry, right: JsonEntry) {
  if (left.key < right.key) return -1;
  if (left.key > right.key) return 1;
  return 0;
}

export function printJson(
  node: JsonNode,
  { indent, sortKeys }: PrintJsonOptions,
): string {
  const parts: string[] = [];
  const isPretty = indent.length > 0;
  const keySeparator = isPretty ? ': ' : ':';

  function newline(depth: number) {
    if (isPretty) parts.push('\n', indent.repeat(depth));
  }

  function printList<Item>(
    open: string,
    close: string,
    items: readonly Item[],
    depth: number,
    printItem: (item: Item) => void,
  ) {
    if (items.length === 0) {
      parts.push(open, close);
      return;
    }
    parts.push(open);
    items.forEach((item, position) => {
      if (position > 0) parts.push(',');
      newline(depth + 1);
      printItem(item);
    });
    newline(depth);
    parts.push(close);
  }

  function print(current: JsonNode, depth: number) {
    switch (current.kind) {
      case 'object': {
        const entries = sortKeys
          ? [...current.entries].sort(compareKeys)
          : current.entries;
        printList('{', '}', entries, depth, (entry) => {
          parts.push(entry.rawKey, keySeparator);
          print(entry.value, depth + 1);
        });
        return;
      }
      case 'array':
        printList('[', ']', current.items, depth, (item) =>
          print(item, depth + 1),
        );
        return;
      case 'string':
      case 'number':
        parts.push(current.raw);
        return;
      case 'boolean':
        parts.push(String(current.value));
        return;
      case 'null':
        parts.push('null');
    }
  }

  print(node, 0);
  return parts.join('');
}
