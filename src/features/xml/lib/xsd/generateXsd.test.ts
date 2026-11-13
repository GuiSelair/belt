import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll, describe, expect, it } from 'vitest';

import { XML_SAMPLE } from '../../xmlShared';
import { generateXsd, type GenerateXsdRequest } from './generateXsd';
import { PREFIXED_ELEMENT_NOTICE } from './inferElementTree';
import { ALL_FALLBACK_NOTICE, unorderedChildrenNotice } from './writeXsd';

const hasXmllint = spawnSync('xmllint', ['--version']).status === 0;
const workDir = mkdtempSync(join(tmpdir(), 'belt-xsd-'));

afterAll(() => rmSync(workDir, { recursive: true, force: true }));

function generate(
  text: string,
  options: Partial<Omit<GenerateXsdRequest, 'text'>> = {},
) {
  const result = generateXsd({
    text,
    style: 'russian-doll',
    compositor: 'sequence',
    ...options,
  });
  if (!result.ok) throw new Error(result.error.message);
  return result;
}

function validatesWithXmllint(xml: string, xsd: string) {
  const xmlPath = join(workDir, 'document.xml');
  const xsdPath = join(workDir, 'schema.xsd');
  writeFileSync(xmlPath, xml);
  writeFileSync(xsdPath, xsd);
  const result = spawnSync('xmllint', [
    '--noout',
    '--schema',
    xsdPath,
    xmlPath,
  ]);
  return { ok: result.status === 0, output: result.stderr.toString() };
}

const FIXTURES = {
  sample: XML_SAMPLE,
  mixed: '<p>Hello <b>bold</b> and <i>italic</i> text.</p>',
  unordered: '<r><a><x/><y/></a><a><y/><x/></a></r>',
  interleaved: '<r><x>1</x><y>2</y><x>3</x></r>',
  emptyWithAttributes: '<r><flag on="true"/><flag/></r>',
  recursive: '<tree><node id="1"><node id="2"/></node></tree>',
  mergedTypes: '<r><v>1</v><v>2.5</v><w>1</w><w/></r>',
};

describe.each(['russian-doll', 'salami-slice'] as const)(
  'generateXsd (%s)',
  (style) => {
    it.each(Object.entries(FIXTURES))(
      'generates a schema that validates the %s fixture',
      (_, xml) => {
        const { xsd } = generate(xml, { style });
        if (!hasXmllint) return;
        expect(validatesWithXmllint(xml, xsd)).toEqual({
          ok: true,
          output: expect.any(String),
        });
      },
    );

    it('validates the any-order variant of every fixture', () => {
      for (const xml of Object.values(FIXTURES)) {
        const { xsd } = generate(xml, { style, compositor: 'all' });
        if (hasXmllint) expect(validatesWithXmllint(xml, xsd).ok).toBe(true);
      }
    });
  },
);

describe('generateXsd inference', () => {
  const { xsd } = generate(XML_SAMPLE);

  it.runIf(hasXmllint)('rejects documents that do not match the schema', () => {
    expect(validatesWithXmllint('<library/>', xsd).ok).toBe(false);
  });

  it('maps the default namespace to the target namespace', () => {
    expect(xsd).toContain(
      'targetNamespace="urn:belt:library" ' +
        'xmlns="urn:belt:library" elementFormDefault="qualified"',
    );
  });

  it('infers cardinality', () => {
    expect(xsd).toContain('<xs:element name="book" maxOccurs="unbounded">');
    expect(xsd).toContain(
      '<xs:element name="author" type="xs:string" maxOccurs="unbounded"/>',
    );
    expect(xsd).toContain(
      '<xs:element name="edition" type="xs:integer" minOccurs="0"/>',
    );
    expect(xsd).toContain(
      '<xs:element name="published" type="xs:date" minOccurs="0"/>',
    );
  });

  it('infers attribute types and usage', () => {
    expect(xsd).toContain(
      '<xs:attribute name="updated" type="xs:dateTime" use="required"/>',
    );
    expect(xsd).toContain(
      '<xs:attribute name="available" type="xs:boolean" use="required"/>',
    );
    expect(xsd).toContain('<xs:extension base="xs:decimal">');
  });

  it('marks mixed content', () => {
    expect(generate(FIXTURES.mixed).xsd).toContain(
      '<xs:complexType mixed="true">',
    );
  });

  it('declares global elements with refs in salami-slice style', () => {
    const salami = generate(XML_SAMPLE, { style: 'salami-slice' }).xsd;
    expect(salami).toContain('<xs:element ref="book" maxOccurs="unbounded"/>');
    expect(salami).toContain('<xs:element name="title" type="xs:string"/>');
  });

  it('falls back from xs:all to xs:sequence when children repeat', () => {
    const result = generate(XML_SAMPLE, { compositor: 'all' });
    expect(result.notices).toContain(ALL_FALLBACK_NOTICE);
    expect(result.xsd).toContain('<xs:sequence>');
  });

  it('uses xs:all when every child appears at most once', () => {
    const result = generate('<a><y/><x/></a>', { compositor: 'all' });
    expect(result.xsd).toContain('<xs:all>');
    expect(result.notices).toEqual([]);
  });

  it('relaxes to a repeatable choice when child order varies', () => {
    const result = generate(FIXTURES.unordered);
    expect(result.xsd).toContain(
      '<xs:choice minOccurs="0" maxOccurs="unbounded">',
    );
    expect(result.notices).toContain(unorderedChildrenNotice('a'));
  });

  it('warns about prefixed elements', () => {
    const result = generate('<a:root xmlns:a="urn:a"><a:item/></a:root>');
    expect(result.notices).toContain(PREFIXED_ELEMENT_NOTICE);
    expect(result.xsd).toContain('<xs:element name="root">');
  });

  it('returns the validation error for malformed XML', () => {
    const result = generateXsd({
      text: '<a><b></a>',
      style: 'russian-doll',
      compositor: 'sequence',
    });
    expect(result.ok).toBe(false);
  });
});
