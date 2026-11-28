import { describe, expect, it } from 'vitest';

import { JSON_SCHEMA_SAMPLE } from '../../jsonShared';
import {
  generateJsonSchema,
  type GenerateJsonSchemaRequest,
} from './generateJsonSchema';
import { DUPLICATE_KEY_NOTICE } from './inferSchemaShape';
import { EMPTY_ARRAY_NOTICE } from './writeJsonSchema';

function generate(
  text: string,
  options: Partial<Omit<GenerateJsonSchemaRequest, 'text'>> = {},
) {
  const result = generateJsonSchema({
    text,
    draft: '2020-12',
    requireProperties: true,
    detectFormats: true,
    allowAdditionalProperties: true,
    ...options,
  });
  if (!result.ok) throw new Error(result.error.message);
  return { schema: JSON.parse(result.schema), notices: result.notices };
}

describe('generateJsonSchema', () => {
  it('describes the sample document', () => {
    const { schema, notices } = generate(JSON_SCHEMA_SAMPLE);

    expect(notices).toEqual([]);
    expect(schema).toEqual({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        homepage: { type: 'string', format: 'uri' },
        private: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        owner: {
          type: 'object',
          properties: {
            login: { type: 'string' },
            email: { type: 'string', format: 'email' },
          },
          required: ['login', 'email'],
        },
        tools: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              uses: { type: 'integer' },
              rating: { type: 'number' },
              beta: { type: 'boolean' },
            },
            required: ['name', 'uses', 'rating'],
          },
        },
        tags: { type: 'array', items: { type: 'string' } },
        license: { type: 'null' },
      },
      required: [
        'id',
        'name',
        'homepage',
        'private',
        'createdAt',
        'owner',
        'tools',
        'tags',
        'license',
      ],
    });
  });

  it.each([
    ['2020-12', 'https://json-schema.org/draft/2020-12/schema'],
    ['2019-09', 'https://json-schema.org/draft/2019-09/schema'],
    ['draft-07', 'http://json-schema.org/draft-07/schema#'],
    ['draft-04', 'http://json-schema.org/draft-04/schema#'],
  ] as const)('declares the %s dialect', (draft, uri) => {
    expect(generate('{}', { draft }).schema.$schema).toBe(uri);
  });

  it('lists every type seen for a value', () => {
    const { schema } = generate('[1, "a", null, true]');
    expect(schema.items.type).toEqual(['string', 'integer', 'boolean', 'null']);
  });

  it('widens integers to numbers when both are sampled', () => {
    expect(generate('[1, 2.5, 3]').schema.items).toEqual({ type: 'number' });
  });

  it('keeps a format only when every string shares it', () => {
    const { schema } = generate('[{"d": "2026-11-12"}, {"d": "soon"}]');
    expect(schema.items.properties.d).toEqual({ type: 'string' });
  });

  it('applies the options', () => {
    const { schema } = generate('{"at": "2026-11-12", "tags": []}', {
      requireProperties: false,
      detectFormats: false,
      allowAdditionalProperties: false,
    });

    expect(schema).toEqual({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        at: { type: 'string' },
        tags: { type: 'array' },
      },
      additionalProperties: false,
    });
  });

  it('warns when array items cannot be inferred', () => {
    expect(generate('{"tags": []}').notices).toEqual([EMPTY_ARRAY_NOTICE]);
  });

  it('infers items from any non-empty sample of the same array', () => {
    const { schema, notices } = generate('[{"tags": []}, {"tags": ["a"]}]');
    expect(schema.items.properties.tags.items).toEqual({ type: 'string' });
    expect(notices).toEqual([]);
  });

  it('merges repeated keys and still marks them as required', () => {
    const { schema, notices } = generate('{"a": 1, "a": "x"}');
    expect(schema.properties.a.type).toEqual(['string', 'integer']);
    expect(schema.required).toEqual(['a']);
    expect(notices).toEqual([DUPLICATE_KEY_NOTICE]);
  });

  it('keeps special property names as plain properties', () => {
    const { schema } = generate('{"__proto__": 1}');
    expect(Object.keys(schema.properties)).toEqual(['__proto__']);
  });

  it('returns the syntax error for invalid JSON', () => {
    const result = generateJsonSchema({
      text: '{"a": }',
      draft: '2020-12',
      requireProperties: true,
      detectFormats: true,
      allowAdditionalProperties: true,
    });
    expect(result).toMatchObject({ ok: false, error: { line: 1, column: 7 } });
  });
});
