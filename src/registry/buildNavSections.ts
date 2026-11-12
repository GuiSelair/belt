import type {
  ExternalLink,
  NavItem,
  NavSection,
  ToolDefinition,
  ToolGroup,
} from './types';

export const LINKS_SECTION_ID = 'links';

function toolToNavItem(tool: ToolDefinition): NavItem {
  return {
    id: tool.id,
    label: tool.name,
    description: tool.description,
    href: tool.href,
    external: false,
  };
}

function linkToNavItem(link: ExternalLink): NavItem {
  return {
    id: link.id,
    label: link.name,
    description: link.description,
    href: link.href,
    external: true,
  };
}

export function buildNavSections(
  groups: readonly ToolGroup[],
  tools: readonly ToolDefinition[],
  links: readonly ExternalLink[],
): NavSection[] {
  const toolSections = groups
    .map((group) => ({
      id: group.id,
      label: group.label,
      items: tools
        .filter((tool) => tool.groupId === group.id)
        .map(toolToNavItem),
    }))
    .filter((section) => section.items.length > 0);

  if (links.length === 0) return toolSections;

  return [
    ...toolSections,
    {
      id: LINKS_SECTION_ID,
      label: 'Links',
      items: links.map(linkToNavItem),
    },
  ];
}
