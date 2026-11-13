import type { ToolDefinition, ToolGroupId, ToolId } from './types';

export const tools: readonly ToolDefinition[] = [
  {
    id: 'json-beautify',
    name: 'JSON Beautify',
    description:
      'Format JSON with your preferred indentation, without losing big-number precision.',
    groupId: 'beautify',
    href: '/beautify/json',
    relatedToolIds: ['json-minify', 'json-validation'],
  },
  {
    id: 'jsx-beautify',
    name: 'JSX Beautify',
    description:
      'Format JSX and TSX snippets with Prettier, using the options your project uses.',
    groupId: 'beautify',
    href: '/beautify/jsx',
  },
  {
    id: 'xml-beautify',
    name: 'XML Beautify',
    description:
      'Format XML with your preferred indentation, keeping comments and CDATA sections.',
    groupId: 'beautify',
    href: '/beautify/xml',
    relatedToolIds: ['xml-validation', 'xml-to-xsd'],
  },
  {
    id: 'json-minify',
    name: 'JSON Minify',
    description:
      'Strip every optional whitespace from JSON, without losing big-number precision.',
    groupId: 'minify',
    href: '/minify/json',
    relatedToolIds: ['json-beautify', 'json-validation'],
  },
  {
    id: 'json-validation',
    name: 'JSON Validation',
    description:
      'Check whether JSON is valid and jump straight to the line and column that breaks it.',
    groupId: 'validation',
    href: '/validation/json',
    relatedToolIds: ['json-beautify', 'json-minify'],
  },
  {
    id: 'xml-validation',
    name: 'XML Validation',
    description:
      'Check XML well-formedness and jump straight to the line and column that breaks it.',
    groupId: 'validation',
    href: '/validation/xml',
    relatedToolIds: ['xml-beautify', 'xml-to-xsd'],
  },
  {
    id: 'sql-validation',
    name: 'SQL Validation',
    description:
      'Check SQL syntax for PostgreSQL, MySQL, Oracle, ClickHouse or SQL Server and compare dialects.',
    groupId: 'validation',
    href: '/validation/sql',
  },
  {
    id: 'xml-to-xsd',
    name: 'XML to XSD',
    description:
      'Generate an XML Schema from a sample document, with occurrence and type inference.',
    groupId: 'transformations',
    href: '/transformations/xml-to-xsd',
    relatedToolIds: ['xml-validation', 'xml-beautify'],
  },
  {
    id: 'connection-string',
    name: 'Connection String Builder',
    description:
      'Build database connection URIs with suggested parameters and safe percent-encoding.',
    groupId: 'helpers',
    href: '/helpers/connection-string',
  },
];

export function getTool(id: ToolId): ToolDefinition {
  const tool = tools.find((candidate) => candidate.id === id);
  if (!tool) throw new Error(`Unknown tool: ${id}`);
  return tool;
}

export function getToolsByGroup(groupId: ToolGroupId): ToolDefinition[] {
  return tools.filter((tool) => tool.groupId === groupId);
}

export function getRelatedTools(id: ToolId): ToolDefinition[] {
  return (getTool(id).relatedToolIds ?? []).map(getTool);
}
