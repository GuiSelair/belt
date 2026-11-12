import type { Route } from 'next';

export type ToolGroupId =
  'beautify' | 'validation' | 'transformations' | 'helpers';

export type ToolId =
  | 'json-beautify'
  | 'jsx-beautify'
  | 'json-validation'
  | 'xml-validation'
  | 'xml-to-xsd'
  | 'connection-string';

export interface ToolGroup {
  id: ToolGroupId;
  label: string;
}

export interface ToolDefinition {
  id: ToolId;
  name: string;
  description: string;
  groupId: ToolGroupId;
  href: Route;
}

export interface ExternalLink {
  id: string;
  name: string;
  href: string;
  description: string;
}

export interface NavItem {
  id: string;
  label: string;
  description: string;
  href: string;
  external: boolean;
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}
