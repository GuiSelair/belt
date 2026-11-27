import type { JsonEntry, JsonNode } from '../types';
import { detectStringFormat, type StringFormat } from './stringFormats';

export type JsonType =
  'object' | 'array' | 'string' | 'integer' | 'number' | 'boolean' | 'null';

export interface PropertyShape {
  shape: SchemaShape;
  /** Number of sampled objects that have this property. */
  occurrences: number;
}

export interface SchemaShape {
  types: Set<JsonType>;
  /** `undefined` until a string is sampled, `null` once samples disagree. */
  stringFormat: StringFormat | null | undefined;
  objectCount: number;
  properties: Map<string, PropertyShape>;
  /** Merged shape of every array item, or `null` when no item was sampled. */
  items: SchemaShape | null;
}

export const DUPLICATE_KEY_NOTICE =
  'Some objects repeat a key; the values of every repetition were merged into one property.';

const INTEGER = /^-?\d+$/;

function createShape(): SchemaShape {
  return {
    types: new Set(),
    stringFormat: undefined,
    objectCount: 0,
    properties: new Map(),
    items: null,
  };
}

function addString(shape: SchemaShape, raw: string) {
  shape.types.add('string');
  if (shape.stringFormat === null) return;
  const format = detectStringFormat(JSON.parse(raw) as string);
  shape.stringFormat =
    shape.stringFormat === undefined || shape.stringFormat === format
      ? format
      : null;
}

function addObject(
  shape: SchemaShape,
  entries: JsonEntry[],
  notices: Set<string>,
) {
  shape.types.add('object');
  shape.objectCount++;
  const seenKeys = new Set<string>();

  for (const { key, value } of entries) {
    let property = shape.properties.get(key);
    if (!property) {
      property = { shape: createShape(), occurrences: 0 };
      shape.properties.set(key, property);
    }
    if (seenKeys.has(key)) {
      notices.add(DUPLICATE_KEY_NOTICE);
    } else {
      seenKeys.add(key);
      property.occurrences++;
    }
    addSample(property.shape, value, notices);
  }
}

function addArray(shape: SchemaShape, items: JsonNode[], notices: Set<string>) {
  shape.types.add('array');
  if (items.length === 0) return;
  const itemShape = (shape.items ??= createShape());
  for (const item of items) addSample(itemShape, item, notices);
}

function addSample(shape: SchemaShape, node: JsonNode, notices: Set<string>) {
  switch (node.kind) {
    case 'object':
      addObject(shape, node.entries, notices);
      return;
    case 'array':
      addArray(shape, node.items, notices);
      return;
    case 'string':
      addString(shape, node.raw);
      return;
    case 'number':
      shape.types.add(INTEGER.test(node.raw) ? 'integer' : 'number');
      return;
    case 'boolean':
      shape.types.add('boolean');
      return;
    case 'null':
      shape.types.add('null');
  }
}

/**
 * Builds the shape every value of the sample fits, merging the items of each
 * array so that objects in a list share one set of properties.
 */
export function inferSchemaShape(
  node: JsonNode,
  notices: Set<string>,
): SchemaShape {
  const shape = createShape();
  addSample(shape, node, notices);
  return shape;
}
