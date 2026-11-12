import { describe, expect, it } from 'vitest';

import { externalLinks } from './externalLinks';
import { getRelatedTools, getTool, tools } from './tools';

describe('tool registry', () => {
  it('has unique ids and routes', () => {
    const ids = new Set(tools.map((tool) => tool.id));
    const routes = new Set(tools.map((tool) => tool.href));

    expect(ids.size).toBe(tools.length);
    expect(routes.size).toBe(tools.length);
  });

  it('prefixes each route with its group', () => {
    for (const tool of tools) {
      expect(tool.href.startsWith(`/${tool.groupId}/`)).toBe(true);
    }
  });

  it('resolves featured tools by id', () => {
    expect(getTool('json-beautify').href).toBe('/beautify/json');
    expect(getTool('xml-to-xsd').href).toBe('/transformations/xml-to-xsd');
  });

  it('relates tools only to other registered tools', () => {
    for (const tool of tools) {
      const related = getRelatedTools(tool.id);
      expect(related.map((candidate) => candidate.id)).not.toContain(tool.id);
    }
  });

  it('links validation and beautify screens to each other', () => {
    const relatedIds = (id: Parameters<typeof getRelatedTools>[0]) =>
      getRelatedTools(id).map((tool) => tool.id);

    expect(relatedIds('json-validation')).toContain('json-beautify');
    expect(relatedIds('json-beautify')).toContain('json-validation');
    expect(relatedIds('xml-validation')).toContain('xml-beautify');
    expect(relatedIds('xml-beautify')).toContain('xml-validation');
  });

  it('lists the curated external links', () => {
    expect(externalLinks.map((link) => link.href)).toEqual([
      'https://transform.tools',
      'https://webhook.cool/',
    ]);
  });
});
