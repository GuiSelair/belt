import type { ToolDefinition, ToolGroupId, ToolId } from './types';

export const tools: readonly ToolDefinition[] = [
  {
    id: 'json-beautify',
    name: 'JSON Beautify',
    description:
      'Format or minify JSON with your preferred indentation, without losing big-number precision.',
    groupId: 'beautify',
    href: '/beautify/json',
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
    id: 'json-validation',
    name: 'JSON Validation',
    description:
      'Check whether JSON is valid and jump straight to the line and column that breaks it.',
    groupId: 'validation',
    href: '/validation/json',
  },
  {
    id: 'xml-validation',
    name: 'XML Validation',
    description:
      'Check XML well-formedness, pinpoint errors and beautify the document.',
    groupId: 'validation',
    href: '/validation/xml',
  },
  {
    id: 'xml-to-xsd',
    name: 'XML → XSD',
    description:
      'Generate an XML Schema from a sample document, with occurrence and type inference.',
    groupId: 'transformations',
    href: '/transformations/xml-to-xsd',
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
