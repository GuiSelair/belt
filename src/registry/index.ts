import { buildNavSections } from './buildNavSections';
import { externalLinks } from './externalLinks';
import { toolGroups } from './groups';
import { tools } from './tools';

export { LINKS_SECTION_ID } from './buildNavSections';
export {
  getRelatedTools,
  getTool,
  getToolByHref,
  getToolsByGroup,
  tools,
} from './tools';
export type * from './types';

export const navSections = buildNavSections(toolGroups, tools, externalLinks);
