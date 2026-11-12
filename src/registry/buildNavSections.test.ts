import { describe, expect, it } from 'vitest';

import { buildNavSections } from './buildNavSections';
import type { ExternalLink, ToolDefinition, ToolGroup } from './types';

const groups: ToolGroup[] = [
  { id: 'beautify', label: 'Beautify' },
  { id: 'validation', label: 'Validation' },
  { id: 'transformations', label: 'Transformations' },
  { id: 'helpers', label: 'Helpers' },
];

const tools: ToolDefinition[] = [
  {
    id: 'json-validation',
    name: 'JSON Validation',
    description: 'Validate JSON',
    groupId: 'validation',
    href: '/validation/json',
  },
  {
    id: 'json-beautify',
    name: 'JSON Beautify',
    description: 'Format JSON',
    groupId: 'beautify',
    href: '/beautify/json',
  },
];

const links: ExternalLink[] = [
  {
    id: 'transform-tools',
    name: 'transform.tools',
    href: 'https://transform.tools',
    description: 'Polyglot web converter',
  },
];

describe('buildNavSections', () => {
  it('keeps the group order and drops groups without tools', () => {
    const sections = buildNavSections(groups, tools, []);

    expect(sections.map((section) => section.id)).toEqual([
      'beautify',
      'validation',
    ]);
  });

  it('lists a newly registered tool in its group', () => {
    const sections = buildNavSections(
      groups,
      [
        ...tools,
        {
          id: 'xml-to-xsd',
          name: 'XML → XSD',
          description: 'Generate XSD',
          groupId: 'transformations',
          href: '/transformations/xml-to-xsd',
        },
      ],
      [],
    );

    const transformations = sections.find(
      (section) => section.id === 'transformations',
    );
    expect(transformations?.items).toEqual([
      {
        id: 'xml-to-xsd',
        label: 'XML → XSD',
        description: 'Generate XSD',
        href: '/transformations/xml-to-xsd',
        external: false,
      },
    ]);
  });

  it('appends the external links section last', () => {
    const sections = buildNavSections(groups, tools, links);
    const last = sections.at(-1);

    expect(last?.id).toBe('links');
    expect(last?.items[0]).toMatchObject({
      label: 'transform.tools',
      href: 'https://transform.tools',
      external: true,
    });
  });
});
