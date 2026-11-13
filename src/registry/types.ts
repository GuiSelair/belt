import type { Route } from 'next';

export type ToolGroupId =
  'beautify' | 'minify' | 'validation' | 'transformations' | 'helpers';

export type ToolId =
  | 'json-beautify'
  | 'jsx-beautify'
  | 'xml-beautify'
  | 'json-minify'
  | 'json-validation'
  | 'xml-validation'
  | 'sql-validation'
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
  relatedToolIds?: ToolId[];
}

export interface ExternalLink {
  id: string;
  name: string;
  href: string;
}

interface NavItemBase {
  id: string;
  label: string;
}

export type NavItem =
  | (NavItemBase & { external: false; href: Route })
  | (NavItemBase & { external: true; href: string });

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}
