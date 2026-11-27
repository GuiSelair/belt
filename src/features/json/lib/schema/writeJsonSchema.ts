import type { JsonType, SchemaShape } from './inferSchemaShape';

export type JsonSchemaDraft = '2020-12' | '2019-09' | 'draft-07' | 'draft-04';

export interface JsonSchemaOptions {
  draft: JsonSchemaDraft;
  /** Marks as required the properties present in every sampled object. */
  requireProperties: boolean;
  detectFormats: boolean;
  allowAdditionalProperties: boolean;
}

type JsonSchema = Record<string, unknown>;

export const EMPTY_ARRAY_NOTICE =
  'Some arrays are empty in the sample, so their items accept any value.';

const SCHEMA_URIS: Record<JsonSchemaDraft, string> = {
  '2020-12': 'https://json-schema.org/draft/2020-12/schema',
  '2019-09': 'https://json-schema.org/draft/2019-09/schema',
  'draft-07': 'http://json-schema.org/draft-07/schema#',
  'draft-04': 'http://json-schema.org/draft-04/schema#',
};

const TYPE_ORDER: readonly JsonType[] = [
  'object',
  'array',
  'string',
  'integer',
  'number',
  'boolean',
  'null',
];

function toTypeKeyword(types: Set<JsonType>) {
  const ordered = TYPE_ORDER.filter(
    (type) => types.has(type) && !(type === 'integer' && types.has('number')),
  );
  return ordered.length === 1 ? ordered[0] : ordered;
}

function toObjectKeywords(
  shape: SchemaShape,
  options: JsonSchemaOptions,
  notices: Set<string>,
): JsonSchema {
  const properties = [...shape.properties];
  const keywords: JsonSchema = {
    properties: Object.fromEntries(
      properties.map(([key, property]) => [
        key,
        toSchema(property.shape, options, notices),
      ]),
    ),
  };

  const required = properties
    .filter(([, property]) => property.occurrences === shape.objectCount)
    .map(([key]) => key);
  if (options.requireProperties && required.length > 0) {
    keywords.required = required;
  }
  if (!options.allowAdditionalProperties) {
    keywords.additionalProperties = false;
  }
  return keywords;
}

function toSchema(
  shape: SchemaShape,
  options: JsonSchemaOptions,
  notices: Set<string>,
): JsonSchema {
  const schema: JsonSchema = { type: toTypeKeyword(shape.types) };

  if (options.detectFormats && shape.stringFormat) {
    schema.format = shape.stringFormat;
  }
  if (shape.types.has('object')) {
    Object.assign(schema, toObjectKeywords(shape, options, notices));
  }
  if (shape.types.has('array')) {
    if (shape.items) schema.items = toSchema(shape.items, options, notices);
    else notices.add(EMPTY_ARRAY_NOTICE);
  }
  return schema;
}

export function writeJsonSchema(
  shape: SchemaShape,
  options: JsonSchemaOptions,
  notices: Set<string>,
): string {
  const schema = {
    $schema: SCHEMA_URIS[options.draft],
    ...toSchema(shape, options, notices),
  };
  return JSON.stringify(schema, null, 2);
}
